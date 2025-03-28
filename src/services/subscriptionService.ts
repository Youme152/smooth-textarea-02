
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription?: any;
  loading: boolean;
  error?: string;
  paymentRecord?: any;
  paymentHistory?: any[];
  billingInfo?: any; // Added this missing property to fix the type error
}

export const createCheckoutSession = async (): Promise<{ url: string } | null> => {
  try {
    // Show loading toast
    const loadingToastId = toast({
      title: "Creating checkout session",
      description: "Please wait...",
    });

    const { data: sessionData, error } = await supabase.functions.invoke("stripe-checkout");
    
    // Dismiss loading toast
    toast({
      title: "",
      description: "",
      duration: 0,
    });
    
    if (error) {
      console.error("Error creating checkout session:", error);
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session"
      });
      return null;
    }

    if (!sessionData?.url) {
      let errorMessage = "No checkout URL returned";
      
      if (sessionData?.error) {
        errorMessage = sessionData.error;
        console.error("Checkout error from edge function:", sessionData.error);
      }
      
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: errorMessage
      });
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Exception during checkout:", error);
    toast({
      variant: "destructive",
      title: "Checkout Error",
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return null;
  }
};

export const cancelSubscription = async (subscriptionId?: string): Promise<{ success: boolean, error?: string }> => {
  if (!subscriptionId) {
    return {
      success: false,
      error: "No subscription ID provided"
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke("cancel-subscription", {
      body: { subscriptionId }
    });

    if (error) {
      console.error("Error cancelling subscription:", error);
      return {
        success: false,
        error: error.message
      };
    }

    if (data?.error) {
      console.error("Subscription cancellation error:", data.error);
      return {
        success: false,
        error: data.error
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error("Exception cancelling subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

export const checkSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const { data, error } = await supabase.functions.invoke("check-subscription");
    
    if (error) {
      console.error("Error checking subscription:", error);
      return { 
        subscribed: false, 
        loading: false,
        error: error.message 
      };
    }

    if (data?.error) {
      console.error("Subscription check error from edge function:", data.error);
      
      // Show a toast notification for configuration errors
      if (data.error.includes("Configuration error")) {
        toast({
          variant: "destructive",
          title: "Subscription Service Error",
          description: data.error
        });
      }
      
      return {
        subscribed: false,
        loading: false,
        error: data.error
      };
    }

    // Also check if there's additional billing information
    const billingInfo = data?.subscription?.billing_details || null;
    
    return { 
      subscribed: data?.subscribed || false,
      subscription: data?.subscription,
      loading: false,
      billingInfo
    };
  } catch (error) {
    console.error("Exception checking subscription:", error);
    return { 
      subscribed: false, 
      loading: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

// New function to sync subscription data
export const syncSubscriptionData = async (): Promise<{ success: boolean, error?: string }> => {
  try {
    const { error } = await supabase.functions.invoke("sync-subscription-data");
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};
