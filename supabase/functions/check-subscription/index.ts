import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the authentication token from the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Get the user from the token
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user || !user.email) {
      return new Response(
        JSON.stringify({ subscribed: false, reason: "User not authenticated" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Get the Stripe secret key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing Stripe secret key in environment variables');
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          error: "Configuration error: Missing Stripe secret key" 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Validate that we have a secret key, not a publishable key
    if (!stripeSecretKey.startsWith('sk_')) {
      console.error('Invalid Stripe key format - must start with sk_');
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          error: "Configuration error: Invalid Stripe key format (must start with sk_)" 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    try {
      // Get customer by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (customers.data.length === 0) {
        // Check if we already have a payment record in our database
        const { data: paymentData } = await supabaseClient
          .from('payments_cutmod')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        // If we have a payment record with an active status, use that
        if (paymentData && paymentData.status === 'active') {
          return new Response(
            JSON.stringify({ 
              subscribed: true,
              subscription: {
                id: paymentData.stripe_subscription_id,
                status: paymentData.status,
                current_period_end: paymentData.current_period_end,
                cancel_at_period_end: paymentData.cancel_at_period_end || false
              },
              localRecord: true
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
          
        return new Response(
          JSON.stringify({ subscribed: false, reason: "No Stripe customer found" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      // Check for active subscriptions - updated to check any active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'active',
        limit: 1
      });

      const isSubscribed = subscriptions.data.length > 0;
      
      // If subscribed, update the status in our database
      if (isSubscribed && subscriptions.data[0].id) {
        // Get latest invoice if available
        let latestInvoice = null;
        let invoiceData = null;
        
        if (subscriptions.data[0].latest_invoice) {
          try {
            latestInvoice = await stripe.invoices.retrieve(
              subscriptions.data[0].latest_invoice as string
            );
            
            if (latestInvoice) {
              invoiceData = {
                id: latestInvoice.id,
                status: latestInvoice.status,
                amount_paid: latestInvoice.amount_paid,
                created: latestInvoice.created,
                period_start: latestInvoice.period_start,
                period_end: latestInvoice.period_end
              };
            }
          } catch (err) {
            console.error("Error fetching latest invoice:", err);
          }
        }
        
        // Update our payment record
        await supabaseClient
          .from('payments_cutmod')
          .upsert({
            user_id: user.id,
            status: 'active',
            stripe_session_id: subscriptions.data[0].id,
            stripe_customer_id: customers.data[0].id,
            stripe_subscription_id: subscriptions.data[0].id,
            cancel_at_period_end: subscriptions.data[0].cancel_at_period_end,
            current_period_end: new Date(subscriptions.data[0].current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      } else {
        // Get the payment record from our database
        const { data: paymentData } = await supabaseClient
          .from('payments_cutmod')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        // If our DB says we have an active subscription but Stripe doesn't, update our DB
        if (paymentData && paymentData.status === 'active') {
          await supabaseClient
            .from('payments_cutmod')
            .upsert({
              user_id: user.id,
              status: 'inactive',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
        }
      }

      return new Response(
        JSON.stringify({ 
          subscribed: isSubscribed,
          subscription: isSubscribed ? subscriptions.data[0] : null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          error: stripeError.message || "Error communicating with Stripe"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error checking subscription:', error);
    return new Response(
      JSON.stringify({ 
        subscribed: false, 
        error: error.message || "An unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
