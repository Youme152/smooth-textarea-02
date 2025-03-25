
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ChevronDown, ArrowUp, Paperclip, Search, MoveHorizontal, Heart, BarChart2, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";

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
          <div className="w-full bg-[rgba(39,39,42,0.5)] rounded-2xl overflow-hidden">
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
                placeholder="What do you want to know?"
                className="w-full bg-transparent border-none text-white text-base outline-none resize-none p-0"
                style={{ overflow: "hidden" }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-2.5 py-2">
              <div className="flex items-center gap-3">
                <button className="p-2 text-[#9ca3af] rounded-full hover:bg-white/10">
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
                
                <button 
                  onClick={handleDeepResearch}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm",
                    "text-[#9ca3af] hover:bg-white/10 transition-colors"
                  )}
                >
                  <Search className="w-[18px] h-[18px]" />
                  DeepSearch
                  <ChevronDown className="w-[14px] h-[14px]" />
                </button>
                
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm text-[#9ca3af] hover:bg-white/10">
                  <MoveHorizontal className="w-[18px] h-[18px]" />
                  Think
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm text-[#9ca3af] hover:bg-white/10">
                  Grok 3
                  <ChevronDown className="w-[14px] h-[14px]" />
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                    input.trim() 
                      ? "bg-white text-black" 
                      : "bg-[#555] text-white opacity-80"
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
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"></path>
            </svg>
            Research
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Create images
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white">
            <Heart className="w-4 h-4" />
            How to
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white">
            <BarChart2 className="w-4 h-4" />
            Analyze
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(39,39,42,0.7)] text-[#9ca3af] rounded-full hover:bg-[rgba(55,55,60,0.7)] hover:text-white">
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>

        <button className="mt-5 mb-2.5 text-sm text-[#9ca3af] bg-transparent border-none cursor-pointer hover:text-white hover:underline">
          Switch to Personas
        </button>

        <div className="text-xs text-[#6b7280] text-center mt-2.5">
          By messaging Grok, you agree to our <a href="#" className="text-[#9ca3af] no-underline hover:underline">Terms</a> and <a href="#" className="text-[#9ca3af] no-underline hover:underline">Privacy Policy</a>.
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
