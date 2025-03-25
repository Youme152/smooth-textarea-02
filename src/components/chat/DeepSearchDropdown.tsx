
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
}

export function DeepSearchDropdown({
  deepResearchActive,
  onCategorySelect
}: DeepSearchDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "px-2 py-1 rounded-lg text-sm transition-all duration-200 flex items-center justify-between gap-1",
            deepResearchActive 
              ? "bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/20"
              : "text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50 active:bg-blue-600/20 active:text-blue-200"
          )}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(
            deepResearchActive && "animate-pulse"
          )}>
            <path d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21l-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>DeepSearch</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-black/90 backdrop-blur-lg border border-neutral-800/50 text-white shadow-xl z-50">
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onCategorySelect("Thumbnails")}>
          <Palette className="w-4 h-4" /> Thumbnails
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onCategorySelect("Titles")}>
          <Hash className="w-4 h-4" /> Titles
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onCategorySelect("Channels")}>
          <Video className="w-4 h-4" /> Channels
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onCategorySelect("Topics")}>
          <Eye className="w-4 h-4" /> Topics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
