
import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, CheckCircle, AlertCircle, RefreshCw, XCircle, Clock, ReceiptText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, fromUnixTime } from "date-fns";
import { createCheckoutSession, cancelSubscription } from "@/services/subscriptionService";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function SubscriptionSettings() {
  const { subscribed, loading, error, subscription, paymentRecord, refetch, checkPaymentStatus, getPaymentHistory } = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const navigate = useNavigate();

  // Fetch payment history on component mount
  useEffect(() => {
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
    
    fetchPaymentHistory();
  }, [getPaymentHistory]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Show refresh toast
    toast({
      title: "Refreshing subscription data",
      description: "Getting the latest information from Stripe...",
    });
    
    await refetch();
    // Reload payment history
    const history = await getPaymentHistory();
    setPaymentHistory(history);
    
    setIsRefreshing(false);
    
    // Show success toast
    toast({
      title: "Refresh complete",
      description: "Subscription information has been updated.",
    });
  };

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    const session = await createCheckoutSession();
    if (session?.url) {
      window.open(session.url, "_blank");
    }
    setCheckoutLoading(false);
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const result = await cancelSubscription(subscription?.id);
      if (result.success) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled successfully.",
        });
        await refetch();
        setCancelDialogOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to cancel subscription.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setCancelLoading(false);
    }
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

  // Format currency
  const formatCurrency = (amount: number | null | undefined, currency: string = 'usd') => {
    if (amount === null || amount === undefined) return 'N/A';
    
    // Stripe amounts are in cents, convert to dollars
    const dollars = amount / 100;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(dollars);
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
              ) : paymentRecord?.cancel_at_period_end ? (
                <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                  <Clock className="h-3 w-3 mr-1" /> Ending Soon
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
                  {paymentRecord?.cancel_at_period_end && (
                    <p className="text-orange-600">
                      <span className="font-medium">Cancellation:</span> Subscription will end on {formatDate(paymentRecord.current_period_end)}
                    </p>
                  )}
                  <p><span className="font-medium">Subscription ID:</span> {subscription.id}</p>
                </div>
              ) : paymentRecord?.status === 'active' ? (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Plan:</span> Premium</p>
                  <p><span className="font-medium">Status:</span> {paymentRecord.status}</p>
                  <p><span className="font-medium">Started:</span> {formatDate(paymentRecord.created_at)}</p>
                  <p><span className="font-medium">Next billing:</span> {formatDate(paymentRecord.current_period_end)}</p>
                  {paymentRecord.cancel_at_period_end && (
                    <p className="text-orange-600">
                      <span className="font-medium">Cancellation:</span> Subscription will end on {formatDate(paymentRecord.current_period_end)}
                    </p>
                  )}
                  <p><span className="font-medium">Subscription ID:</span> {paymentRecord.stripe_subscription_id}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active subscription found.</p>
              )}
            </div>

            <Separator />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="payment-history">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <ReceiptText className="h-4 w-4 mr-2" />
                    Payment History
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {paymentHistory.map((payment, index) => (
                        <div key={index} className="bg-slate-50 p-3 rounded-md text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Payment Date:</span>
                            <span>{formatDate(payment.created_at)}</span>
                          </div>
                          {payment.amount_total && (
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Amount:</span>
                              <span>{formatCurrency(payment.amount_total, payment.currency)}</span>
                            </div>
                          )}
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Status:</span>
                            <span className={payment.status === 'active' ? 'text-green-600' : 'text-gray-600'}>
                              {payment.payment_status || payment.status}
                            </span>
                          </div>
                          {payment.period_start && payment.period_end && (
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Billing Period:</span>
                              <span>{formatDate(payment.period_start)} - {formatDate(payment.period_end)}</span>
                            </div>
                          )}
                          {payment.invoice_id && (
                            <div className="flex justify-between">
                              <span className="font-medium">Invoice ID:</span>
                              <span className="text-xs truncate max-w-[200px]">{payment.invoice_id}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground px-1">
                      No payment records found. This could happen if your subscription was created recently and our system hasn't processed the payment record yet.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-3">
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
      </CardFooter>
    </Card>
  );
}
