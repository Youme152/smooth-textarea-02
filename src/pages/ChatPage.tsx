
import { useState, useEffect } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Message } from "@/types/chat";

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Simulate initial assistant message
  useEffect(() => {
    const initialMessage: Message = {
      id: Date.now().toString(),
      content: "It seems like your message might be incomplete. Could you please provide more context or clarify your request? I'm here to assist!",
      sender: "assistant",
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, []);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput("");

    // Simulate assistant thinking and respond after a brief delay
    setTimeout(() => {
      const assistantResponse: Message = {
        id: Date.now().toString(),
        content: "I'm processing your request. How can I help you further?",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white">
      <ChatHeader />
      <ChatMessageList messages={messages} />
      <ChatInput 
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatPage;
