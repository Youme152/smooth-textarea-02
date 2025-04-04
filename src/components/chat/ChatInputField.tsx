
import { useEffect, RefObject } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  disabled?: boolean;
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
  placeholderText,
  disabled = false
}: ChatInputFieldProps) {
  const isMobile = useIsMobile();
  
  // Always call adjustHeight when value changes to ensure consistency
  useEffect(() => {
    if (adjustHeight) {
      adjustHeight();
    }
  }, [value, adjustHeight]);
  
  return (
    <div className="overflow-hidden">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          // Don't call adjustHeight here - we handle it in the useEffect
        }}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholderText}
        disabled={disabled}
        className={cn(
          "w-full",
          isMobile ? "px-3 py-2" : "px-4 py-3",
          "resize-none",
          "bg-transparent",
          "border-none",
          "text-white", 
          isMobile ? "text-lg" : "text-xl",
          "focus:outline-none",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
          "placeholder:text-neutral-500", 
          isMobile ? "placeholder:text-lg" : "placeholder:text-xl",
          "placeholder:transition-opacity placeholder:duration-200",
          isInputFocused ? "placeholder:opacity-80" : "placeholder:placeholder-neutral-500",
          "h-[60px] min-h-[60px] max-h-[60px]", // Fixed height
          "transition-all duration-200",
          "overflow-hidden", // Changed from overflow-y-auto to overflow-hidden
          disabled ? "opacity-60 cursor-not-allowed" : ""
        )}
      />
    </div>
  );
}
