
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[#131314] p-4 pb-8 flex justify-center">
      <div className="w-full max-w-3xl relative">
        <div className={cn(
          "relative bg-[#1E1E1E] rounded-lg transition-all duration-300",
          isInputFocused 
            ? "border border-neutral-700 shadow-lg" 
            : "border border-neutral-800 shadow-md"
        )}>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => {
              setIsInputFocused(false);
            }}
            placeholder="Reply to Ora..."
            className={cn(
              "w-full px-5 py-4",
              "resize-none",
              "bg-transparent",
              "border-none outline-none",
              "text-white text-base",
              "focus:outline-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none",
              "placeholder:text-gray-500 placeholder:text-base",
              "h-[36px] min-h-[36px] max-h-[36px]", // Fixed height
              "transition-all duration-300",
              "overflow-hidden" // Changed from overflow-y-auto to overflow-hidden
            )}
          />

          <div className="flex items-center justify-between px-4 py-3">
            <div></div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                  input.trim() 
                    ? "bg-white text-black hover:bg-gray-200 active:scale-95" 
                    : "bg-neutral-600/50 text-white/50 opacity-80 cursor-not-allowed"
                )}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
