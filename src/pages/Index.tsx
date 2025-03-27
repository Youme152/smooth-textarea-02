
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ArrowUp, Brain, Youtube, Image, LineChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";
import { SuggestionDropdown } from "@/components/chat/SuggestionDropdown";
import SquaresBackground from "@/components/SquaresBackground";
import { HighlightedText } from "@/components/ui/highlighted-text";
import { useAuthContext } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// We'll create a global variable to store temporary messages
// This avoids using URL parameters which can cause issues
export const tempMessageStore = {
  pendingMessage: null as string | null,
  consumeMessage: function() {
    const message = this.pendingMessage;
    this.pendingMessage = null;
    return message;
  }
};

const Index = () => {
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthContext();

  const placeholders = [
    "What do you want to know?",
    "How can I help you today?",
    "Ask me anything...",
    "Looking for information?",
    "Need some assistance?",
    "What can I research for you?",
    "Let's explore a topic together..."
  ];

  const { placeholderText } = usePlaceholderTyping({
    placeholders,
    typingSpeed: 70,
    deletingSpeed: 40,
    pauseDuration: 2000
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simplified chat creation function - no more URL parameter approach
  const createNewConversation = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!input.trim() || isCreatingChat) return;
    
    try {
      setIsCreatingChat(true);
      
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert([
          { 
            user_id: user.id,
            title: input.length > 30 ? input.substring(0, 30) + "..." : input 
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      if (!data.id) {
        toast({
          variant: "destructive",
          title: "Failed to create conversation",
          description: "Could not generate conversation ID"
        });
        setIsCreatingChat(false);
        return;
      }
      
      // Store the message in our temporary store instead of URL
      tempMessageStore.pendingMessage = input;
      
      // Clear the input BEFORE navigating
      const messageToSend = input.trim();
      setInput("");
      
      // Navigate directly to chat without URL parameters
      navigate(`/chat?id=${data.id}`);
      
    } catch (error: any) {
      console.error("Error creating new conversation:", error);
      toast({
        variant: "destructive",
        title: "Failed to create conversation",
        description: error.message || "An error occurred while creating a new conversation."
      });
      setIsCreatingChat(false);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || isCreatingChat) return;
    createNewConversation();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-[#e5e5e5] p-5 relative overflow-hidden pt-24">
      <SquaresBackground />
      
      <div className="flex flex-col items-center w-full max-w-[800px] relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-6xl text-white tracking-tight leading-tight mb-0">
            What will you make{" "}
            <HighlightedText color="magenta" className="font-bold">viral</HighlightedText>{" "}
            <HighlightedText color="blue" className="font-bold">today</HighlightedText>?
          </h1>
          
          {!user && (
            <p className="mt-4 text-lg text-neutral-400">
              <a href="/auth" className="text-blue-400 hover:text-blue-300 underline">Sign in</a> or <a href="/auth" className="text-blue-400 hover:text-blue-300 underline">create an account</a> to save your work
            </p>
          )}
        </div>

        <div className="w-full mb-5 relative">
          <div className="w-full rounded-2xl overflow-hidden transition-all duration-300 bg-[rgba(39,39,42,0.6)] shadow-lg border border-neutral-700">
            <div className="p-3.5 sm:p-4">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => {
                  setIsInputFocused(false);
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder={placeholderText}
                className={cn(
                  "w-full bg-transparent border-none text-white text-base outline-none resize-none p-0",
                  "placeholder:text-neutral-500 placeholder:opacity-70 transition-all duration-300",
                  "h-[24px] min-h-[24px] max-h-[24px]",
                  "overflow-hidden"
                )}
                disabled={isCreatingChat}
              />
            </div>

            <div className="flex items-center justify-between px-2.5 py-2">
              <div className="flex items-center gap-3">
                {/* DeepSearch button removed */}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isCreatingChat}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                    input.trim() && !isCreatingChat
                      ? "bg-white text-black hover:bg-gray-200 active:scale-95" 
                      : "bg-[#555] text-white opacity-80 cursor-not-allowed"
                  )}
                >
                  <ArrowUp className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
          
          <SuggestionDropdown
            inputValue={input}
            suggestions={suggestions}
            visible={showSuggestions && isInputFocused}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2.5 mt-3.5">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <Brain className="w-4 h-4" />
            Brainstorm
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <Youtube className="w-4 h-4" />
            Create a YouTube Channel
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <Image className="w-4 h-4" />
            Make me a Thumbnail
          </button>
          
          <button className="flex items-center gap-2 px-3.5 py-2 bg-[#1e1e1e] text-[#e5e5e5] rounded-full hover:bg-[#2a2a2a] active:scale-95 transition-all">
            <LineChart className="w-4 h-4" />
            Market Research
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
