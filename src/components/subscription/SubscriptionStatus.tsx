
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { formatDate } from "./utils";

interface SubscriptionStatusProps {
  subscribed: boolean;
  subscription: any;
  paymentRecord: any;
}

export function SubscriptionStatus({ subscribed, subscription, paymentRecord }: SubscriptionStatusProps) {
  return (
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
            {subscription.cancel_at_period_end && (
              <p className="text-orange-600">
                <span className="font-medium">Cancellation:</span> Subscription will end on {formatDate(subscription.current_period_end)}
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
    </>
  );
}
