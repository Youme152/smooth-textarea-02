
import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAutoResizeTextarea } from "../AutoResizeTextarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl transition-all duration-300",
      isInputFocused
        ? "bg-neutral-800 dark:bg-neutral-900 shadow-lg border border-purple-500/30 ring-2 ring-purple-500/20 shadow-neutral-900/20"
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
          onBlur={() => setIsInputFocused(false)}
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
            isInputFocused ? "placeholder:text-purple-300/50" : "placeholder:text-neutral-500",
            "min-h-[60px]",
            "transition-all duration-200"
          )}
          style={{
            overflow: "hidden",
          }}
        />
      </div>

      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "px-2 py-1 rounded-lg text-sm transition-all duration-200 flex items-center justify-between gap-1",
                  deepResearchActive 
                    ? "bg-blue-600 text-white border border-blue-500 shadow-sm shadow-blue-500/20"
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
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Use Deep Research for more comprehensive results
            </TooltipContent>
          </Tooltip>
        </div>
        
        <button
          type="button"
          className={cn(
            "px-3 py-2 rounded-lg text-sm transition-all duration-200 border flex items-center justify-between gap-1",
            value.trim() ? (
              "bg-white text-black border-gray-300 cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-95 shadow-sm"
            ) : (
              "text-neutral-500 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800 cursor-not-allowed"
            )
          )}
          onClick={onSend}
        >
          <Send
            className={cn(
              "w-4 h-4",
              value.trim() ? "text-black" : "text-neutral-500"
            )}
          />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
