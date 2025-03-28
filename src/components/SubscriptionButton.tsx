
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/services/subscriptionService";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const checkoutWindowRef = useRef<Window | null>(null);

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

    // First, open a new window immediately to prevent popup blockers
    checkoutWindowRef.current = window.open("about:blank", "_blank");
    
    // Show loading notification
    toast({
      title: "Preparing Checkout",
      description: "Setting up your secure payment page...",
      variant: "default"
    });
    
    setIsLoading(true);
    setCheckoutError(null);
    
    try {
      const session = await createCheckoutSession();
      
      if (session?.url && checkoutWindowRef.current) {
        // Redirect the already-opened window to the checkout URL
        checkoutWindowRef.current.location.href = session.url;
        
        toast({
          title: "Checkout Ready",
          description: "We've opened the secure payment page for you.",
          variant: "default"
        });
      } else {
        // Close the blank window if we couldn't get a checkout URL
        if (checkoutWindowRef.current) {
          checkoutWindowRef.current.close();
        }
        setCheckoutError("Unable to create checkout session. Please try again later.");
      }
    } catch (error) {
      console.error("Error in subscription button:", error);
      // Close the blank window if there was an error
      if (checkoutWindowRef.current) {
        checkoutWindowRef.current.close();
      }
      setCheckoutError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <Button 
        onClick={handleSubscribe} 
        disabled={isLoading}
        size="lg"
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg border border-blue-400/20 transition-all duration-300 animate-pulse hover:animate-none"
      >
        {isLoading ? (
          "Processing..."
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Subscribe Now
            <Sparkles className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
      
      {checkoutError && (
        <Alert variant="destructive" className="mt-2 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {checkoutError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
