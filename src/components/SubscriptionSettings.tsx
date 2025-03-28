
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, fromUnixTime } from "date-fns";
import { createCheckoutSession } from "@/services/subscriptionService";
import { useNavigate } from "react-router-dom";

export function SubscriptionSettings() {
  const { subscribed, loading, error, subscription, paymentRecord, refetch, checkPaymentStatus } = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    // Double-check the payment record
    await checkPaymentStatus();
    setIsRefreshing(false);
  };

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    const session = await createCheckoutSession();
    if (session?.url) {
      window.open(session.url, "_blank");
    }
    setCheckoutLoading(false);
  };

  // Format date function - properly handles Unix timestamps and ISO strings
  const formatDate = (timestamp: string | number | undefined | null) => {
    if (!timestamp) return "N/A";
    
    try {
      // Check if it's a Unix timestamp (number or numeric string)
      if (typeof timestamp === 'number' || (typeof timestamp === 'string' && !isNaN(Number(timestamp)))) {
        const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
        
        // If timestamp is in seconds (Unix timestamp), convert to milliseconds
        // Unix timestamps are typically 10 digits (seconds) while JS timestamps are 13 digits (milliseconds)
        if (numericTimestamp < 10000000000) {
          return format(fromUnixTime(numericTimestamp), "PPP");
        } else {
          return format(new Date(numericTimestamp), "PPP");
        }
      }
      
      // Handle ISO date strings
      return format(new Date(timestamp), "PPP");
    } catch (e) {
      console.error("Error formatting date:", e, "Value was:", timestamp);
      return "Invalid date";
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Subscription Status</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
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
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium">Status:</h3>
              {subscribed ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  <AlertCircle className="h-3 w-3 mr-1" /> Inactive
                </Badge>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Subscription Details:</h3>
              {subscribed && subscription ? (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Plan:</span> Premium</p>
                  <p><span className="font-medium">Status:</span> {subscription.status}</p>
                  <p><span className="font-medium">Started:</span> {formatDate(subscription.start_date)}</p>
                  <p><span className="font-medium">Next billing:</span> {formatDate(subscription.current_period_end)}</p>
                  <p><span className="font-medium">Subscription ID:</span> {subscription.id}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active subscription found.</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Payment History:</h3>
              {paymentRecord ? (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Last payment status:</span> {paymentRecord.status}</p>
                  <p><span className="font-medium">Payment date:</span> {formatDate(paymentRecord.created_at)}</p>
                  <p><span className="font-medium">Session ID:</span> {paymentRecord.stripe_session_id}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payment records found.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter>
        {!subscribed && (
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
        )}
      </CardFooter>
    </Card>
  );
}
