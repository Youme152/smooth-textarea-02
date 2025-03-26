
import { useState, useRef } from "react";
import { Send, Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionButtonsRow } from "./ActionButtonsRow";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";
import { DeepSearchDropdown } from "./DeepSearchDropdown";

interface ChatInputProps {
  onSendMessage: (message: string, isDeepResearch?: boolean) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const placeholders = [
    "Ask anything...",
    "What do you want to know?",
    "How can I help you?",
    "Ask about creating viral content...",
    "Looking for YouTube ideas?",
    "Need help with a thumbnail design?",
  ];

  const { placeholderText } = usePlaceholderTyping({
    placeholders,
    typingSpeed: 70,
    deletingSpeed: 40,
    pauseDuration: 2000,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    setIsLoading(true);
    
    try {
      await onSendMessage(inputValue, deepResearchActive);
      setInputValue("");
    } finally {
      setIsLoading(false);
      setDeepResearchActive(false);
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDeepSearchCategorySelect = (category: string) => {
    setDeepResearchActive(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className={cn(
        "relative rounded-xl",
        "bg-black/80 border border-neutral-800/50",
      )}>
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          rows={1}
          className={cn(
            "w-full px-4 py-3.5",
            "resize-none",
            "bg-transparent",
            "border-none",
            "text-white",
            "focus:outline-none focus:ring-0",
            "placeholder:text-neutral-500"
          )}
        />

        <div className="flex items-center justify-between p-2 border-t border-neutral-800/50">
          <div className="flex items-center">
            <DeepSearchDropdown 
              deepResearchActive={deepResearchActive}
              onCategorySelect={handleDeepSearchCategorySelect}
            />
          </div>
          
          <div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={cn(
                "p-2 rounded-lg",
                "transition-all duration-200",
                inputValue.trim() && !isLoading
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-neutral-800 text-neutral-400 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      <ActionButtonsRow />
    </div>
  );
}
