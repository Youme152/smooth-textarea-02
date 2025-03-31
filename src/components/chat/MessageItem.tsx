
import { cn } from "@/lib/utils";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { PDFMessage } from "./PDFMessage";
import { HtmlMessage } from "./HtmlMessage";
import { useState, memo } from "react";

interface MessageItemProps {
  id: string;
  content: string;
  sender: "user" | "assistant";
  type?: "text" | "pdf" | "html";
  filename?: string;
}

// Use memo to prevent unnecessary re-renders when parent components update
export const MessageItem = memo(function MessageItem({ 
  id, 
  content, 
  sender, 
  type = "text", 
  filename 
}: MessageItemProps) {
  // Always initialize hooks at the top level
  const { toast } = useToast();
  const [skipAnimation, setSkipAnimation] = useState(true);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      duration: 2000,
    });
  };

  // Determine which content to render based on props
  let messageContent;
  
  if (sender === "user") {
    messageContent = (
      <div className="flex justify-end">
        <div className="bg-[#1E1E1E] text-white px-4 py-3 rounded-md max-w-md shadow-md">
          {content}
        </div>
      </div>
    );
  } else if (type === "pdf" && content) {
    messageContent = (
      <div className="max-w-2xl">
        <PDFMessage url={content} filename={filename || "document.pdf"} />
      </div>
    );
  } else if (type === "html" && content) {
    messageContent = (
      <div className="max-w-2xl w-full">
        <HtmlMessage content={content} />
        <div className="flex items-center space-x-2 mt-4">
          <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
            <Copy className="h-4 w-4 text-gray-400" onClick={() => copyToClipboard(content)} />
          </button>
        </div>
      </div>
    );
  } else {
    messageContent = (
      <div className="max-w-2xl">
        <div className="text-white mb-4">
          <div className="mb-2">
            <TextGenerateEffect 
              text={content} 
              typingSpeed={1} 
              skipAnimation={skipAnimation}
            />
          </div>
          <div className="flex items-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
              <RotateCcw className="h-4 w-4 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
              <Copy className="h-4 w-4 text-gray-400" onClick={() => copyToClipboard(content)} />
            </button>
            <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
              <Download className="h-4 w-4 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
              <ThumbsUp className="h-4 w-4 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
              <ThumbsDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Always return the rendered message from the component
  return (
    <div className={cn(
      "mb-10 group focus:outline-none",
      sender === "user" ? "flex justify-end" : "flex justify-start"
    )}>
      {messageContent}
    </div>
  );
});
