
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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing Stripe secret key');
      return new Response(
        JSON.stringify({ error: "Configuration error: Missing Stripe secret key" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing Stripe signature');
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Missing Stripe webhook secret');
      return new Response(
        JSON.stringify({ error: "Configuration error: Missing Stripe webhook secret" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Get request body as text
    const body = await req.text();
    
    let event;
    try {
      // Verify the event came from Stripe using the webhook secret
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Process different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        // Find the customer & subscription
        if (session.customer && session.subscription) {
          // Get customer details
          const customer = await stripe.customers.retrieve(session.customer);
          if (!customer || customer.deleted) {
            throw new Error('Customer not found or deleted');
          }
          
          // Get user ID from the customer's email
          const { data: userData, error: userError } = await supabaseClient.auth
            .admin.listUsers();
          
          if (userError) {
            console.error('Error fetching users:', userError);
            break;
          }
          
          const user = userData.users.find(u => u.email === customer.email);
          if (!user) {
            console.error('User not found for email:', customer.email);
            break;
          }
          
          // Insert or update payment record
          const { error: paymentError } = await supabaseClient
            .from('payments_cutmod')
            .upsert({
              user_id: user.id,
              status: 'active',
              stripe_session_id: session.id,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              payment_status: 'paid',
              amount_total: session.amount_total,
              currency: session.currency,
              payment_method: session.payment_method_types?.[0] || null,
              created_at: new Date(session.created * 1000).toISOString()
            }, {
              onConflict: 'user_id'
            });
          
          if (paymentError) {
            console.error('Error saving payment record:', paymentError);
          } else {
            console.log('Payment record saved for user:', user.id);
          }
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('Invoice paid:', invoice.id);
        
        if (invoice.customer && invoice.subscription) {
          // Get customer details to find user
          const customer = await stripe.customers.retrieve(invoice.customer);
          if (!customer || customer.deleted) {
            throw new Error('Customer not found or deleted');
          }
          
          // Find user by email
          const { data: userData, error: userError } = await supabaseClient.auth
            .admin.listUsers();
          
          if (userError) {
            console.error('Error fetching users:', userError);
            break;
          }
          
          const user = userData.users.find(u => u.email === customer.email);
          if (!user) {
            console.error('User not found for email:', customer.email);
            break;
          }
          
          // Get existing payment record
          const { data: existingPayment } = await supabaseClient
            .from('payments_cutmod')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          // Update payment record
          const { error: paymentError } = await supabaseClient
            .from('payments_cutmod')
            .upsert({
              user_id: user.id,
              status: 'active',
              stripe_customer_id: invoice.customer,
              stripe_subscription_id: invoice.subscription,
              payment_status: 'paid',
              amount_total: invoice.total,
              currency: invoice.currency,
              invoice_id: invoice.id,
              period_start: new Date(invoice.period_start * 1000).toISOString(),
              period_end: new Date(invoice.period_end * 1000).toISOString(),
              created_at: existingPayment?.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
          
          if (paymentError) {
            console.error('Error updating payment record:', paymentError);
          } else {
            console.log('Payment record updated for user:', user.id);
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer);
        if (!customer || customer.deleted) {
          throw new Error('Customer not found or deleted');
        }
        
        // Find user by email
        const { data: userData, error: userError } = await supabaseClient.auth
          .admin.listUsers();
        
        if (userError) {
          console.error('Error fetching users:', userError);
          break;
        }
        
        const user = userData.users.find(u => u.email === customer.email);
        if (!user) {
          console.error('User not found for email:', customer.email);
          break;
        }
        
        // Update subscription status
        const { error: subscriptionError } = await supabaseClient
          .from('payments_cutmod')
          .upsert({
            user_id: user.id,
            status: subscription.status,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (subscriptionError) {
          console.error('Error updating subscription record:', subscriptionError);
        } else {
          console.log('Subscription record updated for user:', user.id);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription deleted:', subscription.id);
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer);
        if (!customer || customer.deleted) {
          throw new Error('Customer not found or deleted');
        }
        
        // Find user by email
        const { data: userData, error: userError } = await supabaseClient.auth
          .admin.listUsers();
        
        if (userError) {
          console.error('Error fetching users:', userError);
          break;
        }
        
        const user = userData.users.find(u => u.email === customer.email);
        if (!user) {
          console.error('User not found for email:', customer.email);
          break;
        }
        
        // Update subscription status to canceled
        const { error: cancelError } = await supabaseClient
          .from('payments_cutmod')
          .upsert({
            user_id: user.id,
            status: 'canceled',
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            cancel_at_period_end: false,
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (cancelError) {
          console.error('Error updating canceled subscription:', cancelError);
        } else {
          console.log('Subscription marked as canceled for user:', user.id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
