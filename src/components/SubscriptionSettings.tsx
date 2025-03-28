
import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { SubscriptionStatus } from "./subscription/SubscriptionStatus";
import { PaymentHistory } from "./subscription/PaymentHistory";
import { SubscriptionActions } from "./subscription/SubscriptionActions";
import { RefreshButton } from "./subscription/RefreshButton";

export function SubscriptionSettings() {
  const { subscribed, loading, error, subscription, paymentRecord, refetch, getPaymentHistory } = useSubscription();
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch payment history on component mount
  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getPaymentHistory();
      setPaymentHistory(history);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRefresh = async () => {
    // Show refresh toast
    toast({
      title: "Refreshing subscription data",
      description: "Getting the latest information from Stripe...",
    });
    
    await refetch();
    // Reload payment history
    const history = await getPaymentHistory();
    setPaymentHistory(history);
    
    // Show success toast
    toast({
      title: "Refresh complete",
      description: "Subscription information has been updated.",
    });
  };

  const handleSubscriptionChange = async () => {
    toast({
      title: "Subscription updated",
      description: "Your subscription status has been updated.",
    });
    await refetch();
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Subscription Status</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </div>
          <RefreshButton onRefresh={handleRefresh} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <SubscriptionStatus 
              subscribed={subscribed} 
              subscription={subscription} 
              paymentRecord={paymentRecord} 
            />
            
            <Separator />
            
            <PaymentHistory 
              paymentHistory={paymentHistory} 
              isLoadingHistory={isLoadingHistory} 
            />
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <SubscriptionActions 
          subscribed={subscribed} 
          subscription={subscription} 
          onSubscriptionChange={handleSubscriptionChange}
        />
      </CardFooter>
    </Card>
  );
}
