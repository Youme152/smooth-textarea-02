
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isGenerating?: boolean;
}

export function ChatInput({ onSendMessage, isGenerating = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (!input.trim() || isGenerating || isSending) return;
    
    setIsSending(true);
    onSendMessage(input);
    setInput("");
    
    // Reset the sending state after a short delay to prevent multiple submissions
    setTimeout(() => {
      setIsSending(false);
    }, 1500); // Increased to 1.5 seconds to prevent rapid clicking
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
            disabled={isGenerating || isSending}
            className={cn(
              "w-full px-5 py-4",
              "resize-none",
              "bg-transparent",
              "border-none outline-none",
              "text-white text-base",
              "focus:outline-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none",
              "placeholder:text-gray-500 placeholder:text-base",
              "h-[36px] min-h-[36px] max-h-[36px]",
              "transition-all duration-300",
              "overflow-hidden",
              (isGenerating || isSending) && "opacity-70"
            )}
          />

          <div className="flex items-center justify-between px-4 py-3">
            <div></div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isGenerating || isSending}
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                  input.trim() && !isGenerating && !isSending
                    ? "bg-white text-black hover:bg-gray-200 active:scale-95" 
                    : "bg-neutral-600/50 text-white/50 opacity-80 cursor-not-allowed"
                )}
              >
                {isGenerating || isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
