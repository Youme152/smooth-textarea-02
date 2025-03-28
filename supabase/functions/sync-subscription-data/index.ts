
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user || !user.email) {
      return new Response(
        JSON.stringify({ success: false, error: "User not authenticated" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing Stripe secret key in environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Configuration error: Missing Stripe secret key" 
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
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (customers.data.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No Stripe customer found" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      const customerId = customers.data[0].id;
      
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        
        const latestInvoice = await stripe.invoices.retrieve(
          subscription.latest_invoice as string
        );
        
        const { error: upsertError } = await supabaseClient
          .from('payments_cutmod')
          .upsert({
            user_id: user.id,
            status: subscription.status,
            stripe_session_id: subscription.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            payment_status: latestInvoice.status,
            amount_total: latestInvoice.total,
            currency: latestInvoice.currency,
            payment_method: latestInvoice.payment_intent ? 'card' : null,
            invoice_id: latestInvoice.id,
            cancel_at_period_end: subscription.cancel_at_period_end,
            period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            created_at: new Date(subscription.created * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (upsertError) {
          console.error('Error updating payment record:', upsertError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Failed to update payment record",
              details: upsertError
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Subscription data synchronized successfully",
            subscription: subscription
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } else {
        const paymentIntents = await stripe.paymentIntents.list({
          customer: customerId,
          limit: 5
        });
        
        if (paymentIntents.data.length > 0) {
          const { error: upsertError } = await supabaseClient
            .from('payments_cutmod')
            .upsert({
              user_id: user.id,
              status: 'inactive',
              stripe_customer_id: customerId,
              payment_status: paymentIntents.data[0].status,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            
          if (upsertError) {
            console.error('Error updating payment record:', upsertError);
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "No active subscription found" 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: stripeError.message || "Error communicating with Stripe" 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error syncing subscription data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
