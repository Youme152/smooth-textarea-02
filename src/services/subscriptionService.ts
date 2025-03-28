
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
    const { data: sessionData, error } = await supabase.functions.invoke("stripe-checkout");
    
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
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: "No checkout URL returned"
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
