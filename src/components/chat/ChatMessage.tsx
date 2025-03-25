
import React from "react";
import { cn } from "@/lib/utils";
import { MessageActions } from "./MessageActions";
import { Message } from "@/types/chat";

type ChatMessageProps = Message;

export function ChatMessage({ id, content, sender, timestamp }: ChatMessageProps) {
  return (
    <div 
      className={cn(
        "mb-8",
        sender === "user" ? "flex justify-end" : "flex justify-start"
      )}
    >
      {sender === "user" ? (
        <div className="max-w-sm rounded-lg p-2 bg-[#303136] text-white">
          <p>{content}</p>
        </div>
      ) : (
        <div className="max-w-2xl">
          <div className="rounded-lg p-2 bg-[#303136] text-white mb-2">
            <p>{content}</p>
          </div>
          <MessageActions />
        </div>
      )}
    </div>
  );
}
