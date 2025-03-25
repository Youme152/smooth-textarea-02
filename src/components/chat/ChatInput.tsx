
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, Paperclip, ArrowUp } from "lucide-react";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
}

export function ChatInput({ input, setInput, handleSendMessage }: ChatInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 24,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-800 bg-[#121212] p-4">
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "relative bg-[#222222] rounded-xl transition-all duration-300",
          isInputFocused ? "ring-1 ring-gray-600" : ""
        )}>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="How can Grok help?"
            className={cn(
              "w-full px-4 py-3",
              "resize-none",
              "bg-transparent",
              "border-none",
              "text-white text-sm",
              "focus:outline-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-gray-400 placeholder:text-sm",
              "min-h-[24px]",
              "transition-all duration-200"
            )}
            style={{
              overflow: "hidden",
            }}
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-200 rounded transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center text-gray-400 text-sm">
                <span>Grok 3</span>
                <svg 
                  className="w-4 h-4 ml-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className={cn(
                  "p-2 rounded-full transition-all",
                  input.trim() 
                    ? "bg-orange-500 hover:bg-orange-600 cursor-pointer" 
                    : "bg-gray-700 opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowUp className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
