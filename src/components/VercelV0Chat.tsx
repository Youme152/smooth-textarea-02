
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatInputArea } from "./chat/ChatInputArea";
import { ActionButtonsRow } from "./chat/ActionButtonsRow";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";
import { ArrowUp, Paperclip, Github, Image } from "lucide-react";

export function VercelV0Chat() {
  const [value, setValue] = useState("");
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const navigate = useNavigate();
  
  const placeholders = [
    "How can I help you today?",
    "Ask me anything...",
    "What would you like to create?",
    "Need help with a project?",
    "What can I assist you with?",
  ];

  const { placeholderText } = usePlaceholderTyping({ placeholders });
  
  const handleSendClick = () => {
    if (value.trim()) {
      // Navigate to the chat page
      navigate("/chat");
    }
  };
  
  const handleDeepResearch = () => {
    setDeepResearchActive(!deepResearchActive);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full relative">
        <div className={cn(
          "rounded-xl bg-[#222222] shadow-lg overflow-hidden",
          isInputFocused ? "ring-1 ring-gray-600" : ""
        )}>
          <div className="px-4 py-3 flex-grow">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendClick();
                }
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={placeholderText}
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-white resize-none py-2 placeholder-gray-500 text-lg"
              rows={3}
            />
          </div>
          
          <div className="border-t border-gray-700 px-4 py-2 flex justify-between items-center">
            <div className="flex space-x-3">
              <button className="text-gray-400 hover:text-gray-300 transition p-1">
                <Paperclip size={18} />
              </button>
              <button className="text-gray-400 hover:text-gray-300 transition p-1">
                <Image size={18} />
              </button>
              <button className="text-gray-400 hover:text-gray-300 transition p-1">
                <Github size={18} />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">GPT 3.5</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
              
              <button 
                onClick={handleSendClick}
                disabled={!value.trim()}
                className={cn(
                  "p-2 rounded-full transition",
                  value.trim() 
                    ? "bg-orange-500 hover:bg-orange-600" 
                    : "bg-gray-700 cursor-not-allowed"
                )}
              >
                <ArrowUp className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-3">
        <div className="px-3 py-1.5 bg-[#1a1a1a] border border-gray-700 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-400">Use a project</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 ml-1">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
