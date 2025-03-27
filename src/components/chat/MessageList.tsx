
import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./MessageItem";
import { cn } from "@/lib/utils";
import { MessageLoadingEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "pdf";
  filename?: string;
};

interface MessageListProps {
  messages: Message[];
  isGenerating: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export function MessageList({ 
  messages, 
  isGenerating, 
  onLoadMore, 
  isLoading = false, 
  hasMore = false 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Only auto-scroll to bottom on first render or when new messages are added (not when loading older messages)
    if (isFirstRender.current || !isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isFirstRender.current = false;
    }
  }, [messages, isGenerating, isLoading]);

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-3xl mx-auto py-4 px-4">
        {hasMore && (
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load older messages"
              )}
            </Button>
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={cn(
              "mb-10 group focus:outline-none",
              message.sender === "user" ? "flex justify-end" : "flex justify-start"
            )}
          >
            <MessageItem 
              id={message.id}
              content={message.content}
              sender={message.sender}
              type={message.type}
              filename={message.filename}
            />
          </div>
        ))}
        
        {isGenerating && (
          <div className="mb-10 flex justify-start">
            <MessageLoadingEffect />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
