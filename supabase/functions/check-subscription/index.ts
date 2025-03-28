
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
          status: 200, // Return 200 to prevent client-side errors but include error message
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
          status: 200, // Return 200 to prevent client-side errors but include error message
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
        return new Response(
          JSON.stringify({ subscribed: false, reason: "No Stripe customer found" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      // Check for active subscriptions - updated to use the new price ID
      const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'active',
        price: 'price_1R7YPgKbF8BsQYX0NUifYLls',  // Updated $2 test price ID
        limit: 1
      });

      const isSubscribed = subscriptions.data.length > 0;
      
      // If subscribed, update the status in our database
      if (isSubscribed && subscriptions.data[0].id) {
        await supabaseClient
          .from('payments_cutmod')
          .upsert({
            user_id: user.id,
            status: 'active',
            stripe_session_id: subscriptions.data[0].id
          }, {
            onConflict: 'user_id'
          });
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
          status: 200, // Return 200 to prevent client-side errors but include error message
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
        status: 200, // Return 200 to prevent client-side errors
      }
    );
  }
});
