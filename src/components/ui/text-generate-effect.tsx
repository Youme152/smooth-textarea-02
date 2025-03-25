
"use client";

import { useEffect, useRef, useState } from "react";

interface TextGenerateEffectProps {
  text: string;
  className?: string;
}

export const TextGenerateEffect: React.FC<TextGenerateEffectProps> = ({
  text,
  className = "",
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 15); // Adjust speed as needed
    } else {
      setIsComplete(true);
    }
    
    return () => clearTimeout(timeout);
  }, [text, currentIndex]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-live="polite"
      aria-label={text}
    >
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-1 h-4 bg-gray-400 ml-0.5 animate-pulse" />
      )}
    </div>
  );
};
