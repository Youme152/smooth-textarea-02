
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ChevronDown, ArrowUp, Brain, BarChart2, Youtube, Image, LineChart, DollarSign, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";
import { SuggestionDropdown } from "@/components/chat/SuggestionDropdown";
import { AnimatedGradientText } from "@/components/ui/text-generate-effect";

const Index = () => {
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (input.trim().length > 0) {
      const firstChar = input.trim().toLowerCase().charAt(0);
      const suggestionsMap: Record<string, string[]> = {
        'h': [
          "help me analyze Bitcoin during downturns",
          "help me understand successful hedge fund strategies",
          "help me predict interest rates",
          "how can I save on grocery bills each month?"
        ],
        'w': [
          "what is the best way to invest in stocks?",
          "what programming language should I learn first?",
          "what are the top AI trends in 2023?",
          "where can I find reliable market data?"
        ],
        'c': [
          "create a business plan for my startup",
          "compare different investment strategies",
          "can you explain how blockchain works?",
          "calculate my potential retirement savings"
        ],
      };
      
      const newSuggestions = suggestionsMap[firstChar] || [
        `${input} - analysis and insights`,
        `${input} - step by step guide`,
        `${input} - comparison with alternatives`,
        `${input} - best practices`
      ];
      
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeepResearch = () => {
    setDeepResearchActive(!deepResearchActive);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    navigate("/chat");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-[#e5e5e5] p-5">
      <div className="flex flex-col items-center w-full max-w-[800px]">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Welcome to Timeline.</h1>
          <p className="text-xl md:text-2xl text-[#9ca3af]">
            <AnimatedGradientText text="What will you make viral today?" />
          </p>
        </div>

        <div className="w-full mb-5 relative">
          <div className="w-full rounded-2xl overflow-hidden transition-all duration-300 bg-[rgba(39,39,42,0.6)] shadow-lg border border-neutral-700">
            <div className="p-3.5 sm:p-4">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => {
                  setIsInputFocused(false);
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder={placeholderText}
                className={cn(
                  "w-full bg-transparent border-none text-white text-base outline-none resize-none p-0",
                  "placeholder:text-neutral-500 placeholder:opacity-70 transition-all duration-300",
                  "h-[24px] min-h-[24px] max-h-[24px]",
                  "overflow-hidden"
                )}
              />
            </div>

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
                  <img 
                    src="/lovable-uploads/b2e4bf4c-23d2-439c-aaf2-a005b5465610.png" 
                    alt="DeepSearch" 
                    className="w-5 h-5" 
                  />
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
          
          <SuggestionDropdown
            inputValue={input}
            suggestions={suggestions}
            visible={showSuggestions && isInputFocused}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2.5 mt-3.5">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <Brain className="w-4 h-4" />
            Brainstorm
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <BarChart2 className="w-4 h-4" />
            Top Trends This Week
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <Youtube className="w-4 h-4" />
            Create a YouTube Channel
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <Image className="w-4 h-4" />
            Make me a Thumbnail
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <LineChart className="w-4 h-4" />
            Market Research
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <DollarSign className="w-4 h-4" />
            Earn $100 Challenge
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <Instagram className="w-4 h-4" />
            Plan IG Content For mY tRIP
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
