
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncSubscriptionData } from "@/services/subscriptionService";
import { toast } from "@/hooks/use-toast";

interface PaymentStatusDisplayProps {
  user: any;
  sessionId: string | null;
  subscribed: boolean;
  paymentRecord: any;
  onSync: () => Promise<void>;
  syncingData: boolean;
}

export function PaymentStatusDisplay({ 
  user, 
  sessionId, 
  subscribed, 
  paymentRecord,
  onSync,
  syncingData
}: PaymentStatusDisplayProps) {
  // Format date helper
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "PPP");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg w-full text-left">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Subscription Status</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSync}
          disabled={syncingData}
          className="h-8 text-xs"
        >
          {syncingData ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Sync
        </Button>
      </div>
      <div className="text-sm space-y-1">
        <p>User: {user ? user.email : 'Not logged in'}</p>
        <p>Session ID: {sessionId || 'Not found'}</p>
        <p>Subscription: {subscribed ? 'Active' : 'Pending verification'}</p>
        <p>Payment recorded: {paymentRecord ? 'Yes' : 'No'}</p>
        {paymentRecord && (
          <>
            <p>Status: {paymentRecord.status}</p>
            <p>Created: {formatDate(paymentRecord.created_at)}</p>
            {paymentRecord.current_period_end && (
              <p>Valid until: {formatDate(paymentRecord.current_period_end)}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
