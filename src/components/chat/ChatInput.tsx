
import { useState } from "react";
import { SendButton } from "./SendButton";
import { DeepSearchDropdown } from "./DeepSearchDropdown";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onDeepSearchCategorySelect: (category: string) => void;
}

export function ChatInput({ onSendMessage, onDeepSearchCategorySelect }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  
  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleCategorySelect = (category: string) => {
    setDeepResearchActive(true);
    onDeepSearchCategorySelect(category);
  };

  return (
    <div className="border-t border-neutral-800 bg-[#131314]">
      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="bg-[rgba(39,39,42,0.6)] rounded-xl shadow-md border border-neutral-700 overflow-hidden">
          <div className="p-3.5">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Grok..."
              className="w-full bg-transparent border-none text-white text-base outline-none resize-none p-0 placeholder:text-neutral-500"
              rows={1}
              style={{ maxHeight: "200px", overflow: "auto" }}
            />
          </div>
          
          <div className="flex items-center justify-between px-2.5 py-2">
            <div className="flex items-center gap-3">
              <DeepSearchDropdown 
                deepResearchActive={deepResearchActive}
                onCategorySelect={handleCategorySelect}
              />
            </div>
            
            <SendButton 
              onClick={handleSend}
              disabled={!message.trim()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
