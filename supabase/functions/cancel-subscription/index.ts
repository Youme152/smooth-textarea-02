
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
        JSON.stringify({ error: 'User not authenticated' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Get the subscription ID from the request body
    const requestData = await req.json();
    const subscriptionId = requestData.subscriptionId;
    
    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'No subscription ID provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
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
      // First, verify this subscription belongs to the user
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (customers.data.length === 0) {
        return new Response(
          JSON.stringify({ error: "No matching customer found" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      const customer = customers.data[0];
      
      // Verify subscription belongs to the user
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (subscription.customer !== customer.id) {
        return new Response(
          JSON.stringify({ error: "Subscription does not belong to the authenticated user" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        );
      }

      // Cancel the subscription at period end (doesn't immediately cancel, waits until current period ends)
      const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Update status in our database
      await supabaseClient
        .from('payments_cutmod')
        .upsert({
          user_id: user.id,
          status: 'canceling',
          stripe_session_id: subscription.id
        }, {
          onConflict: 'user_id'
        });

      return new Response(
        JSON.stringify({ 
          success: true,
          subscription: canceledSubscription
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
          error: stripeError.message || "Error communicating with Stripe"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 to prevent client-side errors but include error message
        }
      );
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
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
