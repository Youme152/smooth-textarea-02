
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ChevronDown, ArrowUp, Search, MoveHorizontal, Heart, BarChart2, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";

const Index = () => {
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 24,
    maxHeight: 200,
  });

  const placeholders = [
    "What do you want to know?",
    "How can I help you today?",
    "Ask me anything...",
    "Looking for information?",
    "Need some assistance?",
    "What can I research for you?",
    "Let's explore a topic together..."
  ];

  const { placeholderText } = usePlaceholderTyping({
    placeholders,
    typingSpeed: 70,
    deletingSpeed: 40,
    pauseDuration: 2000
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeepResearch = () => {
    setDeepResearchActive(!deepResearchActive);
    toast({
      title: deepResearchActive ? "Deep Research Disabled" : "Deep Research Enabled",
      description: deepResearchActive 
        ? "Responses will be faster but may have less depth." 
        : "Your queries will be researched more thoroughly.",
      duration: 3000
    });
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    navigate("/chat");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-[#e5e5e5] p-5">
      <div className="flex flex-col items-center w-full max-w-[800px]">
        {/* Welcome Text */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Welcome to Grok.</h1>
          <p className="text-xl md:text-2xl text-[#9ca3af]">How can I help you today?</p>
        </div>

        {/* Chat Input Container */}
        <div className="w-full mb-5">
          <div className={cn(
            "w-full rounded-2xl overflow-hidden transition-all duration-300",
            isInputFocused
              ? "bg-[rgba(39,39,42,0.6)] shadow-lg ring-2 ring-purple-500/40"
              : "bg-[rgba(39,39,42,0.5)] shadow-md"
          )}>
            {/* Input Area */}
            <div className="p-3.5 sm:p-4">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={placeholderText}
                className={cn(
                  "w-full bg-transparent border-none text-white text-base outline-none resize-none p-0",
                  "placeholder:text-neutral-500 placeholder:opacity-70 transition-all duration-300",
                  isInputFocused && "placeholder:text-purple-300 placeholder:opacity-50"
                )}
                style={{ overflow: "hidden" }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-2.5 py-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDeepResearch}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm transition-all",
                    deepResearchActive 
                      ? "bg-blue-600/30 text-blue-300 shadow-sm shadow-blue-500/20"
                      : "text-[#9ca3af] hover:bg-white/10 active:bg-blue-600/20 active:text-blue-200"
                  )}
                >
                  <Search className="w-[18px] h-[18px]" />
                  DeepSearch
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                    input.trim() 
                      ? "bg-white text-black hover:bg-gray-200 active:scale-95" 
                      : "bg-[#555] text-white opacity-80 cursor-not-allowed"
                  )}
                >
                  <ArrowUp className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-3.5">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white active:scale-95 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"></path>
            </svg>
            Research
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white active:scale-95 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Create images
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white active:scale-95 transition-all">
            <Heart className="w-4 h-4" />
            How to
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white active:scale-95 transition-all">
            <BarChart2 className="w-4 h-4" />
            Analyze
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white active:scale-95 transition-all">
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;

