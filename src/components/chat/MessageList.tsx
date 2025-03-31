
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
  type?: "text" | "pdf" | "html";
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
  // Always initialize all hooks at the top level
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Use useEffect consistently
  useEffect(() => {
    // Only auto-scroll to bottom on first render or when new messages are added (not when loading older messages)
    if (isFirstRender.current || !isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isFirstRender.current = false;
    }
  }, [messages, isGenerating, isLoading]);

  // Render content with proper message item wrapping
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
        
        {/* Ensure we're rendering each message in a consistent way */}
        {messages.map((message) => (
          <MessageItem 
            key={message.id}
            id={message.id}
            content={message.content}
            sender={message.sender}
            type={message.type}
            filename={message.filename}
          />
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
