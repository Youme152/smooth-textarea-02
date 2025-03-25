
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAutoResizeTextarea } from "../AutoResizeTextarea";
import { SuggestionDropdown } from "./SuggestionDropdown";

interface ChatInputAreaProps {
  value: string;
  setValue: (value: string) => void;
  onSend: () => void;
  isInputFocused: boolean;
  setIsInputFocused: (value: boolean) => void;
  deepResearchActive: boolean;
  toggleDeepResearch: () => void;
  placeholderText: string;
}

export function ChatInputArea({
  value,
  setValue,
  onSend,
  isInputFocused,
  setIsInputFocused,
  deepResearchActive,
  toggleDeepResearch,
  placeholderText
}: ChatInputAreaProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Generate suggestions based on input
  useEffect(() => {
    if (value.trim().length > 0) {
      const firstChar = value.trim().toLowerCase().charAt(0);
      const suggestionsMap: Record<string, string[]> = {
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
        // Add more first letters with their suggestions as needed
      };
      
      // Get suggestions for the first character, or provide generic ones
      const newSuggestions = suggestionsMap[firstChar] || [
        `${value} - analysis and insights`,
        `${value} - step by step guide`,
        `${value} - comparison with alternatives`,
        `${value} - best practices`
      ];
      
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl transition-all duration-300",
      isInputFocused
        ? "bg-neutral-800 dark:bg-neutral-900 shadow-lg border border-neutral-700 shadow-neutral-900/20"
        : "bg-neutral-800 dark:bg-neutral-900 border border-neutral-700 shadow-md"
    )}>
      <div className="overflow-y-auto">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => {
            setIsInputFocused(false);
            // Small delay before hiding suggestions to allow for clicking them
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholderText}
          className={cn(
            "w-full px-4 py-3",
            "resize-none",
            "bg-transparent",
            "border-none outline-none",
            "text-white text-xl", 
            "focus:outline-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none",
            "placeholder:text-neutral-500 placeholder:text-xl",
            "placeholder:transition-opacity placeholder:duration-200",
            isInputFocused ? "placeholder:opacity-80" : "placeholder:text-neutral-500",
            "min-h-[60px]",
            "transition-all duration-200"
          )}
          style={{
            overflow: "hidden",
          }}
        />
      </div>

      {/* Suggestions Dropdown */}
      <SuggestionDropdown
        inputValue={value}
        suggestions={suggestions}
        visible={showSuggestions && isInputFocused}
        onSuggestionClick={handleSuggestionClick}
      />

      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "px-2 py-1 rounded-lg text-sm transition-all duration-200 flex items-center justify-between gap-1",
              deepResearchActive 
                ? "bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/20"
                : "text-neutral-400 hover:text-neutral-300 hover:bg-neutral-700 active:bg-blue-600/20 active:text-blue-200"
            )}
            onClick={toggleDeepResearch}
          >
            <Sparkles className={cn(
              "w-4 h-4",
              deepResearchActive && "animate-pulse"
            )} />
            <span>Deep Research</span>
          </button>
        </div>
        
        <button
          type="button"
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
            value.trim() 
              ? "bg-white text-black hover:bg-gray-200 active:scale-95" 
              : "bg-neutral-600 text-white opacity-80 cursor-not-allowed"
          )}
          onClick={onSend}
          disabled={!value.trim()}
        >
          <Send className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
}
