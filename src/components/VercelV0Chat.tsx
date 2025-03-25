
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  FileUp,
  Figma,
  MonitorIcon,
  CircleUserRound,
  Paperclip,
  PlusIcon,
  FileSearch,
  Send,
} from "lucide-react";
import { ActionButton } from "./ActionButton";
import { useAutoResizeTextarea } from "./AutoResizeTextarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function VercelV0Chat() {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  
  const [placeholderText, setPlaceholderText] = useState("");
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const navigate = useNavigate();
  
  const placeholders = [
    "Ask v0 a question...",
    "Help me create a landing page...",
    "Design a sign-up form...",
    "Build me a portfolio site...",
    "Create a responsive dashboard...",
  ];

  // Effect for typing animation
  useEffect(() => {
    const placeholder = placeholders[currentPlaceholderIndex];
    
    if (isTyping) {
      if (placeholderText.length < placeholder.length) {
        const timer = setTimeout(() => {
          setPlaceholderText(placeholder.substring(0, placeholderText.length + 1));
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Wait a bit before starting to delete
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else {
      if (placeholderText.length > 0) {
        const timer = setTimeout(() => {
          setPlaceholderText(placeholderText.substring(0, placeholderText.length - 1));
        }, 50);
        return () => clearTimeout(timer);
      } else {
        // Move to the next placeholder
        const timer = setTimeout(() => {
          setCurrentPlaceholderIndex((currentPlaceholderIndex + 1) % placeholders.length);
          setIsTyping(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [placeholderText, isTyping, currentPlaceholderIndex, placeholders]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        // Navigate to the chat page
        navigate("/chat");
      }
    }
  };
  
  const handleSendClick = () => {
    if (value.trim()) {
      // Navigate to the chat page
      navigate("/chat");
    }
  };
  
  const handleDeepResearch = () => {
    // Just toggle deep research mode without toast
    setDeepResearchActive(!deepResearchActive);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-black dark:text-white">
        What can I help you ship?
      </h1>

      <div className="w-full">
        <div className={cn(
          "relative bg-white dark:bg-neutral-900 rounded-xl border transition-all duration-300",
          isInputFocused 
            ? "border-neutral-400 dark:border-neutral-600 shadow-md" 
            : "border-neutral-200 dark:border-neutral-800 shadow-sm"
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
                "text-neutral-900 dark:text-white text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-neutral-500 placeholder:text-sm",
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
                className="group p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <Paperclip className="w-4 h-4 text-neutral-500 dark:text-white" />
                <span className="text-xs text-neutral-500 dark:text-zinc-400 hidden group-hover:inline transition-opacity">
                  Attach
                </span>
              </button>
              
              <TooltipProvider>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "ml-2 px-3 py-1.5 h-8 rounded-lg text-xs transition-all flex items-center gap-1",
                    deepResearchActive ? 
                      "bg-blue-500/10 border-blue-500/30 text-blue-500" :
                      "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                  onClick={handleDeepResearch}
                >
                  <FileSearch className="h-3.5 w-3.5" />
                  <span>Deep Research</span>
                </Button>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "px-2 py-1 rounded-lg text-sm text-neutral-500 dark:text-zinc-400 transition-colors border border-dashed border-neutral-300 dark:border-zinc-700 hover:border-neutral-400 dark:hover:border-zinc-600 hover:bg-neutral-50 dark:hover:bg-zinc-800 flex items-center justify-between gap-1"
                )}
              >
                <PlusIcon className="w-4 h-4" />
                Project
              </button>
              
              <button
                type="button"
                className={cn(
                  "px-1.5 py-1.5 rounded-lg text-sm transition-all border flex items-center justify-between gap-1",
                  value.trim() ? (
                    "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white cursor-pointer"
                  ) : (
                    "text-neutral-500 dark:text-zinc-400 border-neutral-300 dark:border-zinc-700 hover:border-neutral-400 dark:hover:border-zinc-600 hover:bg-neutral-50 dark:hover:bg-zinc-800"
                  )
                )}
                onClick={handleSendClick}
              >
                <Send
                  className={cn(
                    "w-4 h-4",
                    value.trim() ? "text-white dark:text-black" : "text-neutral-500 dark:text-zinc-400"
                  )}
                />
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <ActionButton
            icon={<ImageIcon className="w-4 h-4" />}
            label="Clone a Screenshot"
          />
          <ActionButton
            icon={<Figma className="w-4 h-4" />}
            label="Import from Figma"
          />
          <ActionButton
            icon={<FileUp className="w-4 h-4" />}
            label="Upload a Project"
          />
          <ActionButton
            icon={<MonitorIcon className="w-4 h-4" />}
            label="Landing Page"
          />
          <ActionButton
            icon={<CircleUserRound className="w-4 h-4" />}
            label="Sign Up Form"
          />
        </div>
      </div>
    </div>
  );
}
