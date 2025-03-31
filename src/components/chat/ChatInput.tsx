
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isGenerating?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  isGenerating = false
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const sendCooldown = 2000; // 2 seconds cooldown between sends

  // Function to check if we can send a message (not too soon after last send)
  const canSendMessage = () => {
    const now = Date.now();
    return now - lastSentTime >= sendCooldown;
  };

  // Auto-focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current && !isGenerating && !isSending) {
      textareaRef.current.focus();
    }
  }, [isGenerating, isSending]);
  
  // Handle clicks on the input container to focus the textarea
  const handleContainerClick = () => {
    if (textareaRef.current && !isGenerating && !isSending) {
      textareaRef.current.focus();
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || isGenerating || isSending || !canSendMessage()) return;
    
    setIsSending(true);
    setLastSentTime(Date.now());
    
    // Clone the input value before clearing the input field
    const messageToSend = input.trim();
    setInput("");
    
    // Send the message
    onSendMessage(messageToSend);
    
    // Reset the sending state after a delay
    setTimeout(() => {
      setIsSending(false);
    }, sendCooldown); // Use the same cooldown period
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
        <div 
          ref={inputContainerRef}
          onClick={handleContainerClick}
          className={cn(
            "relative bg-[#1E1E1E] rounded-lg transition-all duration-300 cursor-text",
            isInputFocused 
              ? "border border-neutral-700 shadow-lg" 
              : "border border-neutral-800 shadow-md"
          )}
        >
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
            placeholder="Type a message..."
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
              "caret-white", // Set the cursor color to white
              (isGenerating || isSending) && "opacity-70"
            )}
            spellCheck={false} // Disable spellcheck to avoid the cancel button
          />

          <div className="flex items-center justify-end px-4 py-3">
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isGenerating || isSending || !canSendMessage()}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                input.trim() && !isGenerating && !isSending && canSendMessage()
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
  );
}
