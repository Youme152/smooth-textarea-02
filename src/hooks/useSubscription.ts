
import { useState, useEffect, useCallback } from "react";
import { checkSubscriptionStatus, SubscriptionStatus } from "@/services/subscriptionService";
import { useAuthContext } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useSubscription() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    loading: true
  });
  const { user } = useAuthContext();
  
  // Function to check the latest payment status directly from database
  const checkPaymentStatus = useCallback(async () => {
    if (!user) return null;
    
    try {
      console.log("Checking payment status for user:", user.id);
      const { data, error } = await supabase
        .from('payments_cutmod')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching payment status:", error);
        return null;
      }
      
      console.log("Latest payment data:", data);
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("Exception fetching payment status:", error);
      return null;
    }
  }, [user]);
  
  const checkStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus({
        subscribed: false,
        loading: false
      });
      return;
    }
    
    try {
      // First check payment record in our database
      const paymentRecord = await checkPaymentStatus();
      console.log("Payment record from database:", paymentRecord);
      
      // Then check subscription status with Stripe
      const status = await checkSubscriptionStatus();
      console.log("Subscription status from Stripe:", status);
      
      // Update subscription status
      setSubscriptionStatus({
        ...status,
        paymentRecord
      });
    } catch (error) {
      console.error("Error in useSubscription hook:", error);
      setSubscriptionStatus({
        subscribed: false,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to check subscription"
      });
    }
  }, [user, checkPaymentStatus]);
  
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);
  
  return {
    ...subscriptionStatus,
    refetch: checkStatus,
    checkPaymentStatus
  };
}
