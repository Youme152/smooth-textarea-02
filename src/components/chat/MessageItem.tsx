
import React from "react";
import { cn } from "@/lib/utils";
import { PDFMessage } from "./PDFMessage";
import { HtmlMessage } from "./HtmlMessage";

interface MessageItemProps {
  id: string;
  content: string;
  sender: "user" | "assistant";
  type?: "text" | "pdf" | "html";
  filename?: string;
}

export function MessageItem({ id, content, sender, type = "text", filename }: MessageItemProps) {
  // Render different content based on message type
  const renderContent = () => {
    if (type === "pdf" && content) {
      return <PDFMessage url={content} filename={filename || "document.pdf"} />;
    } 
    
    if (type === "html" && content) {
      return <HtmlMessage content={content} />;
    } 
    
    // Default text rendering
    return (
      <div className="prose prose-invert max-w-none">
        {content.split("\n").map((line, i) => (
          <p key={`${id}-line-${i}`} className={line.trim() === "" ? "my-3" : "my-1"}>
            {line}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "mb-10 group focus:outline-none",
        sender === "user" ? "flex justify-end" : "flex justify-start"
      )}
    >
      <div
        className={cn(
          "relative px-4 py-2 rounded-lg max-w-[90%] md:max-w-[85%]",
          sender === "user"
            ? "bg-blue-600 text-white"
            : "bg-neutral-800 text-neutral-200"
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
}
