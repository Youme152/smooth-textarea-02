
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "../AutoResizeTextarea";
import { SuggestionDropdown } from "./SuggestionDropdown";
import { ChatInputField } from "./ChatInputField";
import { ChatInputControls } from "./ChatInputControls";

interface ChatInputAreaProps {
  value: string;
  setValue: (value: string) => void;
  onSend: () => void;
  isInputFocused: boolean;
  setIsInputFocused: (value: boolean) => void;
  placeholderText: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isCreatingChat?: boolean;
}

export function ChatInputArea({
  value,
  setValue,
  onSend,
  isInputFocused,
  setIsInputFocused,
  placeholderText,
  onKeyDown,
  isCreatingChat = false
}: ChatInputAreaProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Generate suggestions based on input
  const updateSuggestions = (input: string) => {
    if (input.trim().length > 0) {
      const firstChar = input.trim().toLowerCase().charAt(0);
      const suggestionsMap: Record<string, string[]> = {
        'd': [
          "draw a river otter playing a ukulele",
          "draw Isaac Newton with an apple falling from his hand",
          "draw astronauts on the surface of the moon having a picnic in spacesuits",
          "design a modern logo for my tech company"
        ],
        'h': [
          "help me analyze Bitcoin during downturns",
          "help me understand successful hedge fund strategies",
          "help me predict interest rates",
          "how can I save on grocery bills each month?"
        ],
        'w': [
          "what is the best way to invest in stocks?",
          "what programming language should I learn first?",
          "what are the top AI trends in 2023?",
          "where can I find reliable market data?"
        ],
        'c': [
          "create a business plan for my startup",
          "compare different investment strategies",
          "can you explain how blockchain works?",
          "calculate my potential retirement savings"
        ],
      };
      
      // Get suggestions for the first character, or provide generic ones
      const newSuggestions = suggestionsMap[firstChar] || [
        `${input} - analysis and insights`,
        `${input} - step by step guide`,
        `${input} - comparison with alternatives`,
        `${input} - best practices`
      ];
      
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Update suggestions when input changes
  useEffect(() => {
    updateSuggestions(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Pass to parent component if provided
    if (onKeyDown) {
      onKeyDown(e);
    }
    
    // Default Enter key handling if not handled by parent
    if (e.key === "Enter" && !e.shiftKey && !onKeyDown) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    setShowSuggestions(false);
    // Adjust textarea height for the new content
    setTimeout(adjustHeight, 0);
    // Focus back on textarea
    textareaRef.current?.focus();
  };

  const handleInputChange = (newValue: string) => {
    setValue(newValue);
    updateSuggestions(newValue);
  };

  const handleInputBlur = () => {
    // Small delay before hiding suggestions to allow for clicking them
    setTimeout(() => {
      if (!document.activeElement?.closest('.suggestion-dropdown')) {
        setIsInputFocused(false);
        setShowSuggestions(false);
      }
    }, 150);
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl transition-all duration-300",
      isInputFocused
        ? "bg-black/90 shadow-lg border border-neutral-800/50"
        : "bg-black/90 border border-neutral-800/50"
    )}>
      <ChatInputField
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsInputFocused(true)}
        onBlur={handleInputBlur}
        textareaRef={textareaRef}
        isInputFocused={isInputFocused}
        adjustHeight={adjustHeight}
        placeholderText={placeholderText}
        disabled={isCreatingChat}
      />

      {/* Suggestions Dropdown */}
      <SuggestionDropdown
        inputValue={value}
        suggestions={suggestions}
        visible={showSuggestions && isInputFocused}
        onSuggestionClick={handleSuggestionClick}
      />

      <ChatInputControls
        value={value}
        onSend={onSend}
        disabled={isCreatingChat}
      />
    </div>
  );
}
