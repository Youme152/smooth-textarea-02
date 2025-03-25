
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, RotateCcw, Download, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextGenerateEffect, MessageLoadingEffect } from "@/components/ui/text-generate-effect";
import { SuggestionDropdown } from "@/components/chat/SuggestionDropdown";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 36,
    maxHeight: 240,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);
  
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

  // Generate suggestions based on input
  useEffect(() => {
    if (input.trim().length > 0) {
      const firstChar = input.trim().toLowerCase().charAt(0);
      const suggestionsMap: Record<string, string[]> = {
        'h': [
          "help me analyze Bitcoin during downturns",
          "help me understand successful hedge fund strategies",
          "help me predict interest rates",
          "how can I save on grocery bills each month?"
        ],
        'w': [
          "what is the best way to invest in stocks?",
          "what programming language should I learn first?",
          "what are the top AI trends in 2023?",
          "where can I find reliable market data?"
        ],
        'c': [
          "create a business plan for my startup",
          "compare different investment strategies",
          "can you explain how blockchain works?",
          "calculate my potential retirement savings"
        ],
        // Add more first letters with their suggestions as needed
      };
      
      // Get suggestions for the first character, or provide generic ones
      const newSuggestions = suggestionsMap[firstChar] || [
        `${input} - analysis and insights`,
        `${input} - step by step guide`,
        `${input} - comparison with alternatives`,
        `${input} - best practices`
      ];
      
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    adjustHeight();
    setShowSuggestions(false);
    
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

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    // Adjust textarea height for the new content
    setTimeout(adjustHeight, 0);
    // Focus back on textarea
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-[#131314] text-white overflow-hidden">
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
                      <TextGenerateEffect text={message.content} typingSpeed={1} />
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
            <div className="mb-10 flex justify-start">
              <MessageLoadingEffect />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="bg-[#131314] p-4 pb-8 flex justify-center">
        <div className="w-full max-w-3xl relative">
          <div className={cn(
            "relative bg-[#1E1E1E] rounded-lg transition-all duration-300",
            isInputFocused 
              ? "border border-neutral-700 shadow-lg" 
              : "border border-neutral-800 shadow-md"
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
              onBlur={() => {
                setIsInputFocused(false);
                // Small delay before hiding suggestions to allow for clicking them
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="How can I help?"
              className={cn(
                "w-full px-5 py-4",
                "resize-none",
                "bg-transparent",
                "border-none outline-none",
                "text-white text-base",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none",
                "placeholder:text-gray-500 placeholder:text-base",
                "min-h-[36px]",
                "transition-all duration-300"
              )}
              style={{
                overflow: "hidden",
              }}
            />

            {/* Suggestions Dropdown */}
            <SuggestionDropdown
              inputValue={input}
              suggestions={suggestions}
              visible={showSuggestions && isInputFocused}
              onSuggestionClick={handleSuggestionClick}
            />

            <div className="flex items-center justify-between px-4 py-3">
              <div></div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                    input.trim() 
                      ? "bg-white text-black hover:bg-gray-200 active:scale-95" 
                      : "bg-[#555] text-white opacity-80 cursor-not-allowed"
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
