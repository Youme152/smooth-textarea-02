
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
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-neutral-400">
            Upgrade to Premium for unlimited chats
          </p>
          <SubscriptionButton />
        </div>
      )}
    </div>
  );
}
