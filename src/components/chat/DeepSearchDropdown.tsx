
import { cn } from "@/lib/utils";

interface DeepSearchButtonProps {
  deepResearchActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function DeepSearchDropdown({
  deepResearchActive,
  onClick,
  disabled = false
}: DeepSearchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-2 py-1 rounded-lg text-sm transition-all duration-200 flex items-center justify-between gap-1",
        deepResearchActive 
          ? "bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/20"
          : "text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50 active:bg-blue-600/20 active:text-blue-200",
        disabled ? "opacity-60 cursor-not-allowed" : ""
      )}
    >
      <img 
        src="/lovable-uploads/b2e4bf4c-23d2-439c-aaf2-a005b5465610.png" 
        alt="DeepSearch" 
        className="w-6 h-6" 
      />
      <span>DeepSearch</span>
    </button>
  );
}
