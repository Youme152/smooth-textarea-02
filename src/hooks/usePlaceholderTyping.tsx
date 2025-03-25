
import { useState, useEffect } from "react";

interface UsePlaceholderTypingProps {
  placeholders: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  nextPlaceholderDelay?: number;
}

export function usePlaceholderTyping({
  placeholders,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 1500,
  nextPlaceholderDelay = 500
}: UsePlaceholderTypingProps) {
  const [placeholderText, setPlaceholderText] = useState("");
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const placeholder = placeholders[currentPlaceholderIndex];
    
    if (isTyping) {
      if (placeholderText.length < placeholder.length) {
        const timer = setTimeout(() => {
          setPlaceholderText(placeholder.substring(0, placeholderText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Wait a bit before starting to delete
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
        return () => clearTimeout(timer);
      }
    } else {
      if (placeholderText.length > 0) {
        const timer = setTimeout(() => {
          setPlaceholderText(placeholderText.substring(0, placeholderText.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Move to the next placeholder
        const timer = setTimeout(() => {
          setCurrentPlaceholderIndex((currentPlaceholderIndex + 1) % placeholders.length);
          setIsTyping(true);
        }, nextPlaceholderDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [placeholderText, isTyping, currentPlaceholderIndex, placeholders, typingSpeed, deletingSpeed, pauseDuration, nextPlaceholderDelay]);

  return { placeholderText };
}
