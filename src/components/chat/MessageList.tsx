
import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./MessageItem";
import { cn } from "@/lib/utils";
import { MessageLoadingEffect } from "@/components/ui/text-generate-effect";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

interface MessageListProps {
  messages: Message[];
  isGenerating: boolean;
}

export function MessageList({ messages, isGenerating }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-3xl mx-auto py-8 px-4">
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
