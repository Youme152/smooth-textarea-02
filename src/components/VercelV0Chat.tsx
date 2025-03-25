
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatInputArea } from "./chat/ChatInputArea";
import { ActionButtonsRow } from "./chat/ActionButtonsRow";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";

export function VercelV0Chat() {
  const [value, setValue] = useState("");
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
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-black dark:text-white">
        What can I help you ship?
      </h1>

      <div className="w-full">
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

        <ActionButtonsRow />
      </div>
    </div>
  );
}
