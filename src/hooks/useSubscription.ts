
import { useState, useEffect, useCallback } from "react";
import { checkSubscriptionStatus, SubscriptionStatus } from "@/services/subscriptionService";
import { useAuthContext } from "@/components/auth/AuthContext";

export function useSubscription() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    loading: true
  });
  const { user } = useAuthContext();
  
  const checkStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus({
        subscribed: false,
        loading: false
      });
      return;
    }
    
    try {
      const status = await checkSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Error in useSubscription hook:", error);
      setSubscriptionStatus({
        subscribed: false,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to check subscription"
      });
    }
  }, [user]);
  
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);
  
  return {
    ...subscriptionStatus,
    refetch: checkStatus
  };
}
