
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Sparkles, CheckCircle } from "lucide-react";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { subscribed, loading } = useSubscription();

  useEffect(() => {
    // Show success toast
    toast({
      title: "Payment Successful!",
      description: "Thank you for your subscription!",
      duration: 5000,
    });

    // If not logged in or no subscription detected after 5 seconds, redirect to home
    const timeout = setTimeout(() => {
      if (!user || (!loading && !subscribed)) {
        navigate("/");
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [subscribed, loading, user, navigate]);

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
