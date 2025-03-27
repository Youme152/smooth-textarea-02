
import { cn } from "@/lib/utils";
import { MessageLoadingEffect, TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { PDFMessage } from "./PDFMessage";
import { HtmlMessage } from "./HtmlMessage";
import { useEffect, useState } from "react";

interface MessageItemProps {
  id: string;
  content: string;
  sender: "user" | "assistant";
  type?: "text" | "pdf" | "html";
  filename?: string;
}

export function MessageItem({ id, content, sender, type = "text", filename }: MessageItemProps) {
  const { toast } = useToast();
  const [skipAnimation, setSkipAnimation] = useState(true);
  
  // Skip animation for any message - always set to true
  // This ensures animation is skipped even when returning to the page
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      duration: 2000,
    });
  };

  if (sender === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-[#1E1E1E] text-white px-4 py-3 rounded-md max-w-md shadow-md">
          {content}
        </div>
      </div>
    );
  }

  if (type === "pdf" && content) {
    return (
      <div className="max-w-2xl">
        <PDFMessage url={content} filename={filename || "document.pdf"} />
      </div>
    );
  }

  if (type === "html" && content) {
    return (
      <div className="max-w-2xl w-full">
        <HtmlMessage content={content} />
        <div className="flex items-center space-x-2 mt-4">
          <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
            <Copy className="h-4 w-4 text-gray-400" onClick={() => copyToClipboard(content)} />
          </button>
        </div>
      </div>
    );
  }

  return (
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
