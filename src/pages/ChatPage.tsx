
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, ArrowUp, Copy, RotateCcw, Download, ThumbsUp, ThumbsDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextGenerateEffect, MessageLoadingEffect } from "@/components/ui/text-generate-effect";
import { ChatInputArea } from "@/components/chat/ChatInputArea";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);
  
  // Simulate initial assistant message
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
    }, 1200);
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
    
    // Simulate assistant response after a short delay
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
    }, 2000);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      duration: 2000,
    });
  };

  const toggleDeepResearch = () => {
    setDeepResearchActive(!deepResearchActive);
  };

  return (
    <div className="flex flex-col h-screen bg-[#131314] text-white overflow-hidden">
      {/* Main chat area */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto py-8 px-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "mb-10 group focus:outline-none",
                message.sender === "user" ? "flex justify-end" : "flex justify-start"
              )}
            >
              {message.sender === "user" ? (
                <div className="bg-[#1E1E1E] text-white px-4 py-2 rounded-md max-w-md outline-none shadow-md hover:shadow-lg transition-shadow duration-200 focus:outline-none ring-0">
                  {message.content}
                </div>
              ) : (
                <div className="max-w-2xl outline-none focus:outline-none ring-0">
                  <div className="text-white mb-2">
                    <div className="mb-2">
                      <TextGenerateEffect text={message.content} typingSpeed={30} />
                    </div>
                    <div className="flex items-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
                        <RotateCcw className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
                        <Copy className="h-4 w-4 text-gray-400" onClick={() => copyToClipboard(message.content)} />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
                        <Download className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
                        <ThumbsUp className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-800 focus:outline-none">
                        <ThumbsDown className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start mb-10">
              <div className="max-w-2xl outline-none">
                <MessageLoadingEffect />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input area fixed at the bottom */}
      <div className="bg-[#131314] p-4 pb-8 flex justify-center">
        <div className="w-full max-w-3xl">
          <ChatInputArea
            value={input}
            setValue={setInput}
            onSend={handleSendMessage}
            isInputFocused={isInputFocused}
            setIsInputFocused={setIsInputFocused}
            deepResearchActive={deepResearchActive}
            toggleDeepResearch={toggleDeepResearch}
            placeholderText="How can I help you today?"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
