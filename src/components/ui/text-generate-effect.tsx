
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TextGenerateEffectProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  showCursor?: boolean;
}

export const TextGenerateEffect: React.FC<TextGenerateEffectProps> = ({
  text,
  className = "",
  typingSpeed = 40,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when text changes entirely
    if (text !== displayedText && currentIndex === 0) {
      setDisplayedText("");
    }

    let timeout: ReturnType<typeof setTimeout>;
    
    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed); // Configurable speed
    } else {
      setIsComplete(true);
    }
    
    return () => clearTimeout(timeout);
  }, [text, currentIndex, displayedText, typingSpeed]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      aria-live="polite"
      aria-label={text}
    >
      <div className="leading-relaxed">
        {displayedText}
        {!isComplete && showCursor && (
          <span className="inline-block w-[2px] h-5 bg-white/70 ml-[1px] animate-pulse" />
        )}
      </div>
    </div>
  );
};

// Updated loading message component with a more modern design
export const MessageLoadingEffect = () => {
  return (
    <div className="flex items-center gap-2 text-neutral-400 p-3">
      <div className="flex space-x-1.5">
        <div className="h-2 w-2 rounded-full bg-neutral-400 animate-[bounce_0.7s_infinite_0s]"></div>
        <div className="h-2 w-2 rounded-full bg-neutral-400 animate-[bounce_0.7s_infinite_0.1s]"></div>
        <div className="h-2 w-2 rounded-full bg-neutral-400 animate-[bounce_0.7s_infinite_0.2s]"></div>
      </div>
    </div>
  );
};

// Add animated text with gradient effect
export const AnimatedGradientText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <span 
      className={cn(
        "inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent",
        "animate-[gradient_3s_ease_infinite]",
        "bg-[length:200%_auto]",
        className
      )}
      style={{
        animation: "gradient 3s ease infinite",
        backgroundSize: "200% auto",
      }}
    >
      {text}
    </span>
  );
};
