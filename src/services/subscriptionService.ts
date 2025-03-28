
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription?: any;
  loading: boolean;
  error?: string;
}

export const createCheckoutSession = async (): Promise<{ url: string } | null> => {
  try {
    // Show loading toast
    const loadingToast = toast({
      title: "Creating checkout session",
      description: "Please wait...",
    });

    const { data: sessionData, error } = await supabase.functions.invoke("stripe-checkout");
    
    // Dismiss loading toast regardless of result
    toast({
      id: loadingToast.id,
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

    return { 
      subscribed: data?.subscribed || false,
      subscription: data?.subscription,
      loading: false
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
