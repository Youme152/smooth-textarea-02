
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionButton } from "@/components/SubscriptionButton";
import { useAuthContext } from "@/components/auth/AuthContext";

export function ActionButtonsRow() {
  const { subscribed, loading } = useSubscription();
  const { user } = useAuthContext();

  if (!user || loading) return null;

  return (
    <div className="flex justify-center my-4">
      {!subscribed && (
        <div className="flex flex-col items-center space-y-2 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 w-full max-w-md">
          <h3 className="text-lg font-medium text-white">Upgrade to Premium</h3>
          <p className="text-sm text-neutral-300 text-center">
            Get unlimited chats and exclusive premium features
          </p>
          <SubscriptionButton />
        </div>
      )}
      
      {subscribed && (
        <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="text-green-400 font-medium">Premium Subscription Active</span>
          </div>
        </div>
      )}
    </div>
  );
}
