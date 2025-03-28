
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
    const email = user?.email;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'No email found. User must be authenticated.' }),
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
          error: "Configuration error: Missing Stripe secret key" 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 to prevent client-side errors but include error message
        }
      );
    }

    // Validate that we have a secret key, not a publishable key
    if (!stripeSecretKey.startsWith('sk_')) {
      console.error('Invalid Stripe key format - must start with sk_');
      return new Response(
        JSON.stringify({ 
          error: "Configuration error: Invalid Stripe key format (must start with sk_)" 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 to prevent client-side errors but include error message
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    try {
      // Check if this customer already exists
      const customers = await stripe.customers.list({
        email: email,
        limit: 1
      });

      // Updated price ID for the $2 test subscription
      const price_id = "price_1R7YPgKbF8BsQYX0NUifYLls";

      let customer_id = undefined;
      if (customers.data.length > 0) {
        customer_id = customers.data[0].id;
        
        // Check if already subscribed to this price
        const subscriptions = await stripe.subscriptions.list({
          customer: customers.data[0].id,
          status: 'active',
          price: price_id,
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          return new Response(
            JSON.stringify({ 
              error: "You already have an active subscription.",
              subscriptionData: subscriptions.data[0]
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      }

      // Get the origin for success and cancel URLs
      const origin = req.headers.get('origin') || 'https://your-app-url.com';

      console.log('Creating subscription checkout session...');
      const session = await stripe.checkout.sessions.create({
        customer: customer_id,
        customer_email: customer_id ? undefined : email,
        line_items: [
          {
            price: price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/payment-success`,
        cancel_url: `${origin}/payment-cancelled`,
        billing_address_collection: 'auto',
        payment_method_types: ['card'],
        allow_promotion_codes: true,
      });

      console.log('Checkout session created:', session.id);
      
      // Record the session in the database for tracking
      if (user) {
        await supabaseClient
          .from('payments_cutmod')
          .upsert({
            user_id: user.id,
            status: 'pending',
            stripe_session_id: session.id
          }, {
            onConflict: 'user_id'
          });
      }

      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: stripeError.message || "Error communicating with Stripe" 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 to prevent client-side errors but include error message
        }
      );
    }
  } catch (error) {
    console.error('Error creating subscription session:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to prevent client-side errors
      }
    );
  }
});
