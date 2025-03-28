
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };
  
  return (
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
  );
}
