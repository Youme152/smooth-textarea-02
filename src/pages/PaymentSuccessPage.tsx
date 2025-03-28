
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Sparkles, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { subscribed, loading, refetch, checkPaymentStatus } = useSubscription();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [error, setError] = useState<string | null>(null);
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
        
        // Record the payment in our database
        const { data, error: upsertError } = await supabase
          .from('payments_cutmod')
          .upsert({
            user_id: user.id,
            status: 'active',
            stripe_session_id: sessionId,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (upsertError) {
          console.error("Error recording payment:", upsertError);
          setError(`Failed to record payment: ${upsertError.message}`);
        } else {
          console.log("Payment recorded successfully.");
        }
        
        // Fetch the latest payment record to verify it was saved
        const latestPayment = await checkPaymentStatus();
        setPaymentRecord(latestPayment);
        console.log("Latest payment record:", latestPayment);
        
        // Refetch subscription status from Stripe
        await refetch();
        
      } catch (error) {
        console.error("Exception recording payment:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setVerifying(false);
      }
    };

    verifyAndRecordPayment();

    // If not logged in or no subscription detected after 5 seconds, redirect to home
    const timeout = setTimeout(() => {
      if (!user) {
        navigate("/");
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [subscribed, loading, user, navigate, sessionId, refetch, checkPaymentStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 pt-24 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">Payment Successful!</h1>
        
        <p className="text-lg text-gray-300">
          Thank you for your subscription. Your account has been upgraded!
        </p>
        
        {verifying && (
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verifying subscription...</span>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!verifying && (
          <div className="p-4 bg-gray-800/50 rounded-lg w-full text-left">
            <h3 className="font-medium mb-2">Subscription Status</h3>
            <div className="text-sm space-y-1">
              <p>User: {user ? user.email : 'Not logged in'}</p>
              <p>Session ID: {sessionId || 'Not found'}</p>
              <p>Subscription: {subscribed ? 'Active' : 'Pending verification'}</p>
              <p>Payment recorded: {paymentRecord ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-3 mt-8 w-full">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 font-medium rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
