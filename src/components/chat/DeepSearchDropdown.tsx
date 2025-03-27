
import { useState } from "react";
import { ChevronDown, Eye, Palette, Video, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DeepSearchDropdownProps {
  deepResearchActive: boolean;
  onCategorySelect: (category: string) => void;
  disabled?: boolean;
}

export function DeepSearchDropdown({
  deepResearchActive,
  onCategorySelect,
  disabled = false
}: DeepSearchDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
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
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-black/90 backdrop-blur-lg border border-neutral-800/50 text-white shadow-xl z-50">
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onCategorySelect("DeepSearch: Thumbnails")}>
          <Palette className="w-4 h-4" /> Thumbnails
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onCategorySelect("DeepSearch: Titles")}>
          <Hash className="w-4 h-4" /> Titles
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onCategorySelect("DeepSearch: Channels")}>
          <Video className="w-4 h-4" /> Channels
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onCategorySelect("DeepSearch: Topics")}>
          <Eye className="w-4 h-4" /> Topics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
