
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Paperclip, RotateCcw, Download, ThumbsUp, ThumbsDown, Settings, User, Menu } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 24,
    maxHeight: 200,
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1A1B1E] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1A1B1E] p-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5 text-gray-400" />
            </Button>
            <span className="font-semibold text-white">Grok AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-400" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gray-700">
                <User className="h-4 w-4 text-gray-300" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      {/* Main chat area taking most of the screen with messages */}
      <div className="flex-1 overflow-y-auto p-0">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "mb-8",
                message.sender === "user" ? "flex justify-end" : "flex justify-start"
              )}
            >
              {message.sender === "user" ? (
                <div className="max-w-sm rounded-lg p-2 bg-[#303136] text-white">
                  <p>{message.content}</p>
                </div>
              ) : (
                <div className="max-w-2xl">
                  <div className="rounded-lg p-2 bg-[#303136] text-white mb-2">
                    <p>{message.content}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button className="p-1 rounded hover:bg-gray-700">
                      <RotateCcw className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-700">
                      <Download className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-700">
                      <ThumbsUp className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-700">
                      <ThumbsDown className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area fixed at the bottom */}
      <div className="border-t border-gray-800 bg-[#1A1B1E] p-4">
        <div className="max-w-4xl mx-auto">
          <div className={cn(
            "relative bg-[#27272A] rounded-lg transition-all duration-300",
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
                "w-full px-4 py-3",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-white text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-gray-400 placeholder:text-sm",
                "min-h-[24px]",
                "transition-all duration-200"
              )}
              style={{
                overflow: "hidden",
              }}
            />

            <div className="flex items-center justify-between px-3 py-2">
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
                  <span>Grok 3</span>
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
                  <Send className="h-5 w-5" />
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
