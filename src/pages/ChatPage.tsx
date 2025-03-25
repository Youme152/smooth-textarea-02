
import { useState, useEffect } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deepResearchCategory, setDeepResearchCategory] = useState<string | null>(null);
  
  useEffect(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const initialMessage = {
        id: Date.now().toString(),
        content: "It seems like your message might be incomplete. Could you please provide more context or clarify your request? I'm here to assist!",
        sender: "assistant" as const,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      setIsGenerating(false);
    }, 300);
  }, []);

  const handleSendMessage = (input: string) => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    setIsGenerating(true);
    setTimeout(() => {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your message. Is there anything specific you'd like me to help you with?",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
      setIsGenerating(false);
    }, 300);
  };

  const handleDeepSearchCategorySelect = (category: string) => {
    setDeepResearchCategory(category);
    // You could add functionality here to perform a deep search based on the selected category
    console.log(`Deep search selected category: ${category}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#131314] text-white overflow-hidden">
      <MessageList 
        messages={messages}
        isGenerating={isGenerating}
      />
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onDeepSearchCategorySelect={handleDeepSearchCategorySelect}
      />
    </div>
  );
};

export default ChatPage;
