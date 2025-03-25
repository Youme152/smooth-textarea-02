
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
      {!isComplete && (
        <div className="absolute -bottom-4 left-0 opacity-30 text-xs tracking-wider">
          <span className="inline-block animate-pulse">
            Generating...
          </span>
        </div>
      )}
    </div>
  );
};

// Add a loading message component that shows dots animating
export const MessageLoadingEffect = () => {
  return (
    <div className="flex items-center gap-1 text-neutral-400 px-2 py-3">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-neutral-500"></span>
      </span>
      <span className="text-sm">Generating response</span>
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

