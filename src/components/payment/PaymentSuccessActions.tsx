
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentSuccessActions() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col gap-3 mt-8 w-full">
      <Button
        onClick={() => navigate("/")}
        className="px-8 py-3 font-medium rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Start Exploring
      </Button>
      
      <Button
        onClick={() => navigate("/settings")}
        variant="outline"
        className="px-8 py-3 font-medium rounded-md text-white border-white/20 hover:bg-white/10"
      >
        View Subscription Status
      </Button>
    </div>
  );
}
