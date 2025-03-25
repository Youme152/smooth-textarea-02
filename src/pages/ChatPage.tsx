
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Paperclip, FileSearch, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAutoResizeTextarea } from "@/components/AutoResizeTextarea";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
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
    
    // Simulate assistant reply
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm processing your request about "${input.substring(0, 30)}${input.length > 30 ? '...' : ''}"`,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleDeepResearch = () => {
    if (!input.trim()) {
      toast({
        title: "Please enter a query first",
        description: "Enter what you'd like to research before starting deep research.",
        duration: 3000,
      });
      return;
    }
    
    // Toggle deep research mode
    setDeepResearchActive(!deepResearchActive);
    
    if (!deepResearchActive) {
      setIsSearching(true);
      
      // Simulate search process
      setTimeout(() => {
        setIsSearching(false);
        toast({
          title: "Deep Research Complete",
          description: "Found detailed information about your query.",
          duration: 3000,
        });
        
        // Add a message about the research
        const researchMessage: Message = {
          id: Date.now().toString(),
          content: `I've completed a deep research on "${input.substring(0, 30)}${input.length > 30 ? '...' : ''}" and found some relevant information. Feel free to ask for specific details.`,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, researchMessage]);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chat Assistant</h1>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={cn(
              "flex max-w-[80%] rounded-lg p-4",
              message.sender === "user" 
                ? "bg-blue-100 dark:bg-blue-900/30 ml-auto" 
                : "bg-gray-100 dark:bg-gray-800"
            )}
          >
            <p className="text-gray-800 dark:text-gray-200">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className={cn(
          "relative bg-white dark:bg-neutral-900 rounded-xl border transition-all duration-300",
          isInputFocused 
            ? "border-neutral-400 dark:border-neutral-600 shadow-md" 
            : "border-neutral-200 dark:border-neutral-800 shadow-sm"
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
            placeholder="How can I help?"
            className={cn(
              "w-full px-4 py-3",
              "resize-none",
              "bg-transparent",
              "border-none",
              "text-neutral-900 dark:text-white text-sm",
              "focus:outline-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-neutral-500 placeholder:text-sm",
              "min-h-[60px]",
              "transition-all duration-200"
            )}
            style={{
              overflow: "hidden",
            }}
          />

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="group p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <Paperclip className="w-4 h-4 text-neutral-500 dark:text-white" />
                <span className="text-xs text-neutral-500 dark:text-zinc-400 hidden group-hover:inline transition-opacity">
                  Attach
                </span>
              </button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn(
                        "ml-2 px-3 py-1.5 h-8 rounded-lg text-xs transition-all flex items-center gap-1",
                        (deepResearchActive || isSearching) ? 
                          "bg-blue-500/10 border-blue-500/30 text-blue-500" :
                          "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                      onClick={handleDeepResearch}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Researching...</span>
                        </>
                      ) : (
                        <>
                          <FileSearch className="h-3.5 w-3.5" />
                          <span>Deep Research</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="z-50">
                    <p className="text-xs">Search the web for deeper insights</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Button
              onClick={handleSendMessage}
              className={cn(
                "px-3 py-1.5 h-8 rounded-lg text-xs transition-all flex items-center gap-1",
                input.trim() ? 
                  "bg-black text-white dark:bg-white dark:text-black" :
                  "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
              )}
              disabled={!input.trim()}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
