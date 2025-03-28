
import { useState, useEffect, useCallback } from "react";
import { checkSubscriptionStatus, SubscriptionStatus } from "@/services/subscriptionService";
import { useAuthContext } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      
      // First try with a more specific query
      const { data, error } = await supabase
        .from('payments_cutmod')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching payment status:", error);
        
        // If the specific query failed, try a more general one
        const { data: allPayments, error: allError } = await supabase
          .from('payments_cutmod')
          .select('*')
          .eq('user_id', user.id);
          
        if (allError) {
          console.error("Error fetching all payments:", allError);
          return null;
        }
        
        if (allPayments && allPayments.length > 0) {
          console.log("Found payments using general query:", allPayments);
          // Return the most recent payment
          return allPayments[0];
        }
        
        console.log("No payment records found for user");
        return null;
      }
      
      console.log("Latest payment data:", data);
      return data;
    } catch (error) {
      console.error("Exception fetching payment status:", error);
      return null;
    }
  }, [user]);

  // Function to get payment history for the current user
  const getPaymentHistory = useCallback(async () => {
    if (!user) return [];
    
    try {
      console.log("Fetching payment history for user:", user.id);
      // In our current implementation, we only have one payment record per user
      // but this function can be expanded to fetch multiple records if needed
      const { data, error } = await supabase
        .from('payments_cutmod')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching payment history:", error);
        return [];
      }
      
      console.log("Payment history:", data);
      return data || [];
    } catch (error) {
      console.error("Exception fetching payment history:", error);
      return [];
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
      
      // If we have conflicting information, prefer the Stripe source of truth
      // but keep our payment record information
      const isSubscribed = status.subscribed || (paymentRecord?.status === 'active');
      
      // Update subscription status
      setSubscriptionStatus({
        ...status,
        subscribed: isSubscribed,
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
    
    // Additionally, let's check if there are any issues with the payments table
    if (user) {
      // Check if the table exists and we have permissions
      supabase
        .from('payments_cutmod')
        .select('count(*)', { count: 'exact' })
        .then(({ count, error }) => {
          if (error) {
            console.error("Error accessing payments table:", error);
            if (error.code === '42P01') {
              // Table doesn't exist
              toast({
                variant: "destructive",
                title: "Database configuration issue",
                description: "The payments table doesn't exist. Please contact support.",
              });
            } else if (error.code === '42501') {
              // Permission denied
              toast({
                variant: "destructive",
                title: "Permission issue",
                description: "You don't have permission to access payment data.",
              });
            }
          } else {
            console.log(`Found ${count} total payments in the system`);
          }
        });
    }
  }, [checkStatus, user]);
  
  return {
    ...subscriptionStatus,
    refetch: checkStatus,
    checkPaymentStatus,
    getPaymentHistory
  };
}
