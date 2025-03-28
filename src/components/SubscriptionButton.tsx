
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/services/subscriptionService";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Sparkles, AlertCircle, Loader2 } from "lucide-react";
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

    // Prevent multiple clicks
    if (isLoading) return;
    
    setIsLoading(true);
    setCheckoutError(null);
    
    // Show loading notification immediately
    toast({
      title: "Opening Checkout",
      description: "Preparing your secure payment page...",
      variant: "default"
    });
    
    // We'll open the window only after we have the session URL
    // to prevent the blank page flashing
    try {
      const session = await createCheckoutSession();
      
      if (session?.url) {
        // Only open the window once we have the URL
        checkoutWindowRef.current = window.open(session.url, "_blank");
        
        if (!checkoutWindowRef.current) {
          // If popup was blocked
          toast({
            title: "Popup Blocked",
            description: "Please allow popups for this site and try again.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Checkout Ready",
            description: "Payment page opened in a new tab.",
            variant: "default"
          });
        }
      } else {
        setCheckoutError("Unable to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Error in subscription button:", error);
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
        className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
          shadow-lg border border-blue-400/20 transition-all duration-300 
          ${!isLoading ? "animate-pulse hover:animate-none" : ""}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Opening Checkout...
          </>
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
