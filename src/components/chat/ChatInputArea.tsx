
import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAutoResizeTextarea } from "../AutoResizeTextarea";

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
      "relative bg-neutral-800 dark:bg-neutral-900 overflow-hidden rounded-xl border transition-all duration-300",
      isInputFocused
        ? "border-neutral-600 shadow-md"
        : "border-neutral-700 shadow-sm"
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
            "text-white text-xl", // Increased font size here
            "focus:outline-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-neutral-500 placeholder:text-xl", // Increased placeholder font size
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
          <button
            type="button"
            className={cn(
              "px-2 py-1 rounded-lg text-sm text-neutral-400 transition-colors border border-dashed border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800 flex items-center justify-between gap-1"
            )}
          >
            <PlusIcon className="w-4 h-4" />
            Project
          </button>
        </div>
        
        <button
          type="button"
          className={cn(
            "px-3 py-2 rounded-lg text-sm transition-all border flex items-center justify-between gap-1",
            value.trim() ? (
              "bg-orange-500 text-white border-orange-500 cursor-pointer hover:bg-orange-600"
            ) : (
              "text-neutral-500 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800"
            )
          )}
          onClick={onSend}
        >
          <Send
            className={cn(
              "w-4 h-4",
              value.trim() ? "text-white" : "text-neutral-500"
            )}
          />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
