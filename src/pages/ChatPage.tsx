
import { useState, useEffect } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

const WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook/e2d00243-1d2b-4ebd-bdf8-c0ee6a64a1da";

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    // Initialize with a user greeting and AI response
    const initialMessages = [
      {
        id: "user-init",
        content: "hi",
        sender: "user" as const,
        timestamp: new Date(),
      },
      {
        id: "ai-init",
        content: "Hey hey! 😊 What's up?",
        sender: "assistant" as const,
        timestamp: new Date(),
      }
    ];
    setMessages(initialMessages);
  }, []);

  const fetchAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        console.error('Error from webhook:', response.status);
        return "I'm sorry, I couldn't process your request at the moment. Please try again later.";
      }
      
      const data = await response.json();
      return data.response || "I understand your message. Is there anything specific you'd like me to help you with?";
    } catch (error) {
      console.error('Error calling webhook:', error);
      return "I'm having trouble connecting to my services. Please try again in a moment.";
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsGenerating(true);
    
    try {
      const aiResponse = await fetchAIResponse(input);
      
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#131314] text-white overflow-hidden">
      <MessageList 
        messages={messages}
        isGenerating={isGenerating}
      />
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatPage;
