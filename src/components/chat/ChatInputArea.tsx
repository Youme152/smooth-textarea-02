
import { useEffect, useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, ChevronDown, Eye, Palette, Video, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAutoResizeTextarea } from "../AutoResizeTextarea";
import { SuggestionDropdown } from "./SuggestionDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [deepSearchCategory, setDeepSearchCategory] = useState<string>("All");

  // Generate suggestions based on input
  useEffect(() => {
    if (value.trim().length > 0) {
      const firstChar = value.trim().toLowerCase().charAt(0);
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

  const handleDeepSearchCategorySelect = (category: string) => {
    setDeepSearchCategory(category);
    toggleDeepResearch();
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl transition-all duration-300",
      isInputFocused
        ? "bg-black/90 shadow-lg border border-neutral-800/50"
        : "bg-black/90 border border-neutral-800/50"
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
            // Small delay before hiding suggestions to allow for clicking them
            setTimeout(() => {
              if (!document.activeElement?.closest('.suggestion-dropdown')) {
                setIsInputFocused(false);
                setShowSuggestions(false);
              }
            }, 150);
          }}
          placeholder={placeholderText}
          className={cn(
            "w-full px-4 py-3",
            "resize-none",
            "bg-transparent",
            "border-none",
            "text-white text-xl", 
            "focus:outline-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
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

      {/* Suggestions Dropdown - Styled to be more integrated */}
      <SuggestionDropdown
        inputValue={value}
        suggestions={suggestions}
        visible={showSuggestions && isInputFocused}
        onSuggestionClick={handleSuggestionClick}
      />

      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "px-2 py-1 rounded-lg text-sm transition-all duration-200 flex items-center justify-between gap-1",
                  deepResearchActive 
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/20"
                    : "text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50 active:bg-blue-600/20 active:text-blue-200"
                )}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(
                  deepResearchActive && "animate-pulse"
                )}>
                  <path d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21l-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>DeepSearch</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/90 backdrop-blur-lg border border-neutral-800/50 text-white shadow-xl z-50">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleDeepSearchCategorySelect("Thumbnails")}>
                <Palette className="w-4 h-4" /> Thumbnails
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleDeepSearchCategorySelect("Titles")}>
                <Hash className="w-4 h-4" /> Titles
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleDeepSearchCategorySelect("Channels")}>
                <Video className="w-4 h-4" /> Channels
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleDeepSearchCategorySelect("Topics")}>
                <Eye className="w-4 h-4" /> Topics
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <button
          type="button"
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
            value.trim() 
              ? "bg-white text-black hover:bg-gray-200 active:scale-95" 
              : "bg-neutral-600/50 text-white/50 opacity-80 cursor-not-allowed"
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
