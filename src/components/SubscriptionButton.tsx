
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/services/subscriptionService";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Sparkles } from "lucide-react";

export function SubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "default"
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const session = await createCheckoutSession();
      if (session?.url) {
        window.location.href = session.url;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSubscribe} 
      disabled={isLoading}
      size="lg"
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg border border-blue-400/20 transition-all duration-300 animate-pulse hover:animate-none"
    >
      {isLoading ? (
        "Redirecting..."
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Subscribe Now
          <Sparkles className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
}
