
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatInputArea } from "./chat/ChatInputArea";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";

export function VercelV0Chat() {
  const [value, setValue] = useState("");
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const navigate = useNavigate();
  
  const placeholders = [
    "Ask a question...",
    "Help me create a landing page...",
    "Design a sign-up form...",
    "Build me a portfolio site...",
    "Create a responsive dashboard...",
  ];

  const { placeholderText } = usePlaceholderTyping({ placeholders });
  
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
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 space-y-8">
      <h1 className="text-5xl font-playfair font-bold tracking-tight leading-tight text-white bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
        What will you make viral today?
      </h1>

      <div className="w-full max-w-xl">
        <TooltipProvider>
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
        </TooltipProvider>
      </div>
    </div>
  );
}
