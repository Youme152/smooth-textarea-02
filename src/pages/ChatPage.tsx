
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Paperclip, RotateCcw, Download, ThumbsUp, ThumbsDown, Settings, User, Menu, Copy, ArrowUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [modelVersion, setModelVersion] = useState("Grok 3");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 36,
    maxHeight: 240,
  });
  
  const { toast } = useToast();

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Simulate initial assistant message
  useEffect(() => {
    const initialMessage = {
      id: Date.now().toString(),
      content: "It seems like your message might be incomplete. Could you please provide more context or clarify your request? I'm here to assist!",
      sender: "assistant" as const,
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
    adjustHeight();
    
    // Simulate assistant response after a short delay
    setTimeout(() => {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your message. Is there anything specific you'd like me to help you with?",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#131314] text-white overflow-hidden">
      {/* Header */}
      <header className="bg-[#131314] p-3 border-b border-gray-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5 text-gray-400" />
            </Button>
            <span className="font-semibold text-white">Grok</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v8" />
                <path d="m16 6-4 4-4-4" />
                <path d="M8 14h8" />
                <path d="M15 18H9" />
                <path d="M12 22v-4" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                <line x1="18" x2="12" y1="9" y2="15" />
                <line x1="12" x2="18" y1="9" y2="15" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="rounded-full px-3 py-1 h-8 text-sm bg-transparent border-gray-700 text-white hover:bg-gray-800">
              Sign up
            </Button>
            <Button variant="ghost" className="text-sm px-3 py-1 h-8">
              Sign in
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main chat area */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto py-8 px-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "mb-10",
                message.sender === "user" ? "flex justify-end" : "flex justify-start"
              )}
            >
              {message.sender === "user" ? (
                <div className="bg-[#1E1E1E] text-white px-4 py-2 rounded-md max-w-md">
                  {message.content}
                </div>
              ) : (
                <div className="max-w-2xl">
                  <div className="text-white mb-2">
                    <p className="mb-2">{message.content}</p>
                    <div className="flex items-center space-x-2 mt-4">
                      <button className="p-1 rounded hover:bg-gray-800">
                        <RotateCcw className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-800">
                        <Copy className="h-4 w-4 text-gray-400" onClick={() => copyToClipboard(message.content)} />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-800">
                        <Download className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-800">
                        <ThumbsUp className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-800">
                        <ThumbsDown className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input area fixed at the bottom */}
      <div className="bg-[#131314] p-4 pb-8 flex justify-center">
        <div className="w-full max-w-3xl relative">
          <div className={cn(
            "relative bg-[#1E1E1E] rounded-lg transition-all duration-300",
            isInputFocused ? "ring-1 ring-gray-500" : ""
          )}>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="How can Grok help?"
              className={cn(
                "w-full px-5 py-4",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-white text-base",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-gray-500 placeholder:text-base",
                "min-h-[36px]",
                "transition-all duration-200"
              )}
              style={{
                overflow: "hidden",
              }}
            />

            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-200 rounded transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center text-gray-400 text-sm">
                  <span>{modelVersion}</span>
                  <svg 
                    className="w-4 h-4 ml-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className={cn(
                    "p-1 rounded text-white transition-all",
                    input.trim() ? "opacity-100" : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
