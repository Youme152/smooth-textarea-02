
import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { Message } from "@/types/chat";

interface ChatMessageListProps {
  messages: Message[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-0">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            id={message.id}
            content={message.content}
            sender={message.sender}
            timestamp={message.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
