
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HtmlMessageProps {
  content: string;
  className?: string;
}

export function HtmlMessage({ content, className }: HtmlMessageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = content;
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
