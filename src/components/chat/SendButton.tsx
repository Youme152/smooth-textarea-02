
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
        !disabled 
          ? "bg-white text-black hover:bg-gray-200 active:scale-95" 
          : "bg-neutral-600/50 text-white/50 opacity-80 cursor-not-allowed"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Send className="w-[18px] h-[18px]" />
    </button>
  );
}
