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
  typingSpeed = 1,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (text !== displayedText && currentIndex === 0) {
      setDisplayedText("");
    }

    let timeout: ReturnType<typeof setTimeout>;
    
    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
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
