
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HtmlMessageProps {
  content: string;
  className?: string;
}

export function HtmlMessage({ content, className }: HtmlMessageProps) {
  // Always initialize all hooks at the top level
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [contentLength, setContentLength] = useState(content.length);

  // Always render HTML content on mount or when content changes
  useEffect(() => {
    // Update content length to track changes
    setContentLength(content.length);
    
    if (containerRef.current) {
      containerRef.current.innerHTML = content;
      setHasRendered(true);
    }
  }, [content]);

  return (
    <div 
      className={cn("p-4 rounded-md bg-[#1A1A1C] overflow-auto max-h-[600px]", className)}
    >
      <div ref={containerRef} className="html-content prose prose-invert max-w-none" />
    </div>
  );
}
