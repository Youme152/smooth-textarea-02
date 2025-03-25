
import React from "react";
import { cn } from "@/lib/utils";
import { MessageActions } from "./MessageActions";
import { Message } from "@/types/chat";

type ChatMessageProps = Message;

export function ChatMessage({ id, content, sender, timestamp }: ChatMessageProps) {
  return (
    <div 
      className={cn(
        "mb-8 max-w-4xl mx-auto",
        sender === "user" ? "bg-[#1E1E1E] p-4 rounded-lg w-fit ml-auto mr-8" : ""
      )}
    >
      {sender === "user" ? (
        <div className="text-white text-sm">
          <p>{content}</p>
        </div>
      ) : (
        <div className="max-w-full">
          <div className="text-white text-sm mb-2 flex flex-col space-y-2">
            <p>{content}</p>
          </div>
          <MessageActions />
        </div>
      )}
    </div>
  );
}
