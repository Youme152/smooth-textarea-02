
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { PaymentVerification } from "@/components/payment/PaymentVerification";
import { PaymentStatusDisplay } from "@/components/payment/PaymentStatusDisplay";
import { PaymentSuccessActions } from "@/components/payment/PaymentSuccessActions";

const PaymentSuccessPage = () => {
  const { user } = useAuthContext();
  const { subscribed, refetch } = useSubscription();
  const [searchParams] = useSearchParams();
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [syncingData, setSyncingData] = useState(false);
  const sessionId = searchParams.get('session_id');

  const handlePaymentComplete = (record: any) => {
    setPaymentRecord(record);
  };

  const handleSyncData = async () => {
    setSyncingData(true);
    try {
      await refetch();
    } finally {
      setSyncingData(false);
    }
  };

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
        
        <PaymentVerification onComplete={handlePaymentComplete} />
        
        {!syncingData && user && (
          <PaymentStatusDisplay 
            user={user}
            sessionId={sessionId}
            subscribed={subscribed}
            paymentRecord={paymentRecord}
            onSync={handleSyncData}
            syncingData={syncingData}
          />
        )}
        
        <PaymentSuccessActions />
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
