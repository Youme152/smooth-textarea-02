
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HtmlMessageProps {
  content: string;
  className?: string;
}

export function HtmlMessage({ content, className }: HtmlMessageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (containerRef.current && !hasRendered) {
      containerRef.current.innerHTML = content;
      setHasRendered(true);
    }
  }, [content, hasRendered]);

  // Prevent unnecessary re-renders on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && containerRef.current && !hasRendered) {
        containerRef.current.innerHTML = content;
        setHasRendered(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [content, hasRendered]);

  return (
    <div 
      className={cn("p-4 rounded-md bg-[#1A1A1C] overflow-auto max-h-[600px]", className)}
    >
      <div ref={containerRef} className="html-content prose prose-invert max-w-none" />
    </div>
  );
}
