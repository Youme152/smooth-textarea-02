
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, XCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createCheckoutSession, cancelSubscription } from "@/services/subscriptionService";

interface SubscriptionActionsProps {
  subscribed: boolean;
  subscription: any;
  onSubscriptionChange: () => Promise<void>;
}

export function SubscriptionActions({ subscribed, subscription, onSubscriptionChange }: SubscriptionActionsProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    const session = await createCheckoutSession();
    if (session?.url) {
      window.open(session.url, "_blank");
    }
    setCheckoutLoading(false);
  };

  const handleCancelSubscription = async () => {
    console.log("Cancel subscription button clicked");
    console.log("Subscription ID:", subscription?.id);
    
    if (!subscription?.id) {
      return;
    }
    
    setCancelLoading(true);
    try {
      const result = await cancelSubscription(subscription.id);
      console.log("Cancel subscription result:", result);
      
      if (result.success) {
        setCancelDialogOpen(false);
        // Add a small delay before refreshing to allow the backend to process
        setTimeout(async () => {
          await onSubscriptionChange();
        }, 1000);
      }
    } catch (error) {
      console.error("Error in handleCancelSubscription:", error);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {!subscribed ? (
        <Button 
          onClick={handleSubscribe}
          disabled={checkoutLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {checkoutLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Opening Checkout...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Subscribe Now
            </>
          )}
        </Button>
      ) : (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="ml-auto">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Yes, Cancel Subscription
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
