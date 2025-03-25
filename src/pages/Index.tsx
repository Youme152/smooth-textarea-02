import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ArrowUp, Search, Brain, BarChart2, Youtube, Image, LineChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";
import { SuggestionDropdown } from "@/components/chat/SuggestionDropdown";

const Index = () => {
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
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
        'b': [
          "brainstorm ideas for a new project",
          "generate a list of potential topics",
          "create a mind map for a presentation",
          "generate a list of potential solutions"
        ],
        't': [
          "top trends in technology this week",
          "top news stories of the week",
          "top business news of the week",
          "top entertainment news of the week"
        ],
        'y': [
          "create a youtube channel",
          "post a video on youtube",
          "create a playlist on youtube",
          "create a channel on youtube"
        ],
        'i': [
          "make a thumbnail for a video",
          "create a cover image for a video",
          "create a logo for a video",
          "create a banner for a video"
        ],
        'm': [
          "market research for a new product",
          "market analysis for my business idea",
          "market trends in the tech industry",
          "market opportunities in e-commerce"
        ]
      };

      if (suggestionsMap[firstChar]) {
        setSuggestions(suggestionsMap[firstChar]);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  return (
    <div>
      <input
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        placeholder={placeholderText}
        style={{ height: textareaRef.current?.clientHeight }}
      />
      {showSuggestions && (
        <SuggestionDropdown suggestions={suggestions} />
      )}
    </div>
  );
};

export default Index;
