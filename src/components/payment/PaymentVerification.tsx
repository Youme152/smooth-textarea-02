
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { syncSubscriptionData } from "@/services/subscriptionService";
import { supabase } from "@/integrations/supabase/client";

interface PaymentVerificationProps {
  onComplete: (paymentRecord: any) => void;
}

export function PaymentVerification({ onComplete }: PaymentVerificationProps) {
  const { user, updateUserPayment } = useAuthContext();
  const { refetch, checkPaymentStatus } = useSubscription();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingData, setSyncingData] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Show success toast
    toast({
      title: "Payment Received!",
      description: "Thank you for your subscription!",
      duration: 5000,
    });

    const verifyAndRecordPayment = async () => {
      if (!user) {
        setVerifying(false);
        setError("User not logged in. Please sign in to verify your subscription.");
        return;
      }
      
      if (!sessionId) {
        setVerifying(false);
        setError("No session ID found. Cannot verify payment.");
        return;
      }
      
      try {
        console.log("Verifying payment with session ID:", sessionId);
        console.log("User ID:", user.id);
        
        // Store the payment data in our database using the new auth method
        await updateUserPayment({
          sessionId: sessionId,
          status: 'active'
        });
        
        console.log("Payment recorded successfully via auth context.");
        toast({
          title: "Payment Recorded",
          description: "Your payment has been successfully recorded in our system.",
          duration: 5000,
        });
        
        // Also try the original method as a backup - redundancy to ensure data is saved
        const { data, error: upsertError } = await supabase
          .from('payments_timeline')
          .upsert({
            user_id: user.id,
            status: 'active',
            stripe_session_id: sessionId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (upsertError) {
          console.error("Error recording payment (backup method):", upsertError);
          // Don't throw error here since we already tried the primary method
        } else {
          console.log("Payment recorded successfully (backup method).");
        }
        
        // Sync with Stripe to get the most accurate data
        await handleSyncSubscription();
        
        // Fetch the latest payment record to verify it was saved
        await refetch();
        const latestPayment = await checkPaymentStatus();
        onComplete(latestPayment);
        console.log("Latest payment record:", latestPayment);
        
      } catch (error) {
        console.error("Exception recording payment:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setVerifying(false);
      }
    };

    verifyAndRecordPayment();
  }, [user, sessionId, refetch, checkPaymentStatus, updateUserPayment, onComplete]);

  const handleSyncSubscription = async () => {
    setSyncingData(true);
    try {
      const result = await syncSubscriptionData();
      if (result.success) {
        toast({
          title: "Subscription Synchronized",
          description: "Your subscription data has been synchronized with Stripe.",
        });
        await refetch();
        const latestPayment = await checkPaymentStatus();
        onComplete(latestPayment);
      } else {
        toast({
          variant: "destructive",
          title: "Sync Error",
          description: result.error || "Failed to synchronize subscription data.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setSyncingData(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Verifying subscription...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
