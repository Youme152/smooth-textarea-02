
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChatInputArea } from "./chat/ChatInputArea";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";
import { toast } from "@/components/ui/use-toast";
import { AnimatedGradientText } from "@/components/ui/text-generate-effect";
import { useIsMobile } from "@/hooks/use-mobile";

export function VercelV0Chat() {
  const [value, setValue] = useState("");
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const isMobile = useIsMobile();
  
  const navigate = useNavigate();
  
  const placeholders = [
    "Ask a question...",
    "Help me create a landing page...",
    "Design a sign-up form...",
    "Build me a portfolio site...",
    "Create a responsive dashboard...",
    "Implement a contact form...",
    "Draw a river otter playing a ukulele...",
  ];

  const { placeholderText } = usePlaceholderTyping({ 
    placeholders,
    typingSpeed: 70,
    deletingSpeed: 40, 
    pauseDuration: 2000
  });
  
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
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 space-y-6 md:space-y-8">
      <h1 className={cn(
        "font-playfair font-bold tracking-tight leading-tight text-center",
        isMobile ? "text-3xl" : "text-5xl"
      )}>
        Welcome to Timeline.
        <div className="mt-2">
          <AnimatedGradientText text="What will you make viral today?" />
        </div>
      </h1>

      <div className="w-full max-w-xl">
        <ChatInputArea 
          value={value}
          setValue={setValue}
          onSend={handleSendClick}
          isInputFocused={isInputFocused}
          setIsInputFocused={setIsInputFocused}
          deepResearchActive={deepResearchActive}
          toggleDeepResearch={handleDeepResearch}
          placeholderText={placeholderText}
        />
      </div>
    </div>
  );
}
