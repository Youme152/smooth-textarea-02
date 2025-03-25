
import { useEffect, RefObject } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  isInputFocused: boolean;
  adjustHeight: () => void;
  placeholderText: string;
}

export function ChatInputField({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  textareaRef,
  isInputFocused,
  adjustHeight,
  placeholderText
}: ChatInputFieldProps) {
  return (
    <div className="overflow-hidden">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          // No height adjustment
        }}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
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
          "h-[60px] min-h-[60px] max-h-[60px]", // Fixed height
          "transition-all duration-200",
          "overflow-y-auto" // Allow scrolling within the fixed height
        )}
      />
    </div>
  );
}
