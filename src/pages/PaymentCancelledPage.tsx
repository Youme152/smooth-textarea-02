
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { XCircle, ArrowLeft } from "lucide-react";

const PaymentCancelledPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show cancelled toast
    toast({
      variant: "destructive",
      title: "Payment Cancelled",
      description: "Your payment process was cancelled.",
      duration: 5000,
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 pt-24 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">Payment Cancelled</h1>
        
        <p className="text-lg text-gray-300">
          Your payment process was cancelled. No charges were made.
        </p>
        
        <div className="flex flex-col gap-3 mt-8 w-full">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 font-medium rounded-md bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelledPage;
