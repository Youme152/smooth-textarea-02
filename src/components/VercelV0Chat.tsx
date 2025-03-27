
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChatInputArea } from "./chat/ChatInputArea";
import { usePlaceholderTyping } from "@/hooks/usePlaceholderTyping";
import { toast } from "@/components/ui/use-toast";
import { AnimatedGradientText } from "@/components/ui/text-generate-effect";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthContext";

export function VercelV0Chat() {
  const [value, setValue] = useState("");
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const isMobile = useIsMobile();
  
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const placeholders = [
    "Ask a question...",
    "Help me create a landing page...",
    "Design a sign-up form...",
    "Build me a portfolio site...",
    "Create a responsive dashboard...",
    "Implement a contact form...",
    "Draw a river otter playing a ukulele...",
  ];

  const { placeholderText } = usePlaceholderTyping({ 
    placeholders,
    typingSpeed: 70,
    deletingSpeed: 40, 
    pauseDuration: 2000
  });
  
  const createNewConversation = async (initialMessage) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      setIsCreatingChat(true);
      
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert([{ 
          user_id: user.id,
          title: initialMessage.length > 30 ? initialMessage.substring(0, 30) + "..." : initialMessage 
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Redirect to the chat page with the new conversation ID and the initial message
      navigate(`/chat?id=${data.id}&initialMessage=${encodeURIComponent(initialMessage)}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        variant: "destructive",
        title: "Failed to create conversation",
        description: error.message || "An error occurred while creating a new conversation."
      });
      setIsCreatingChat(false);
    }
  };

  const handleInputChange = (newValue) => {
    setValue(newValue);
  };
  
  const handleSendClick = () => {
    if (value.trim()) {
      createNewConversation(value.trim());
    }
  };
  
  const handleDeepResearch = () => {
    setDeepResearchActive(!deepResearchActive);
  };

  // Handle key press to create chat immediately
  const handleKeyDown = (e) => {
    // If Enter is pressed and not with Shift, create the chat
    if (e.key === "Enter" && !e.shiftKey && value.trim() && !isCreatingChat) {
      e.preventDefault();
      createNewConversation(value.trim());
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 space-y-6 md:space-y-8">
      <h1 className={cn(
        "font-playfair font-bold tracking-tight leading-tight text-center",
        isMobile ? "text-3xl" : "text-5xl"
      )}>
        Welcome to Timeline.
        <div className="mt-2">
          <AnimatedGradientText text="What will you make viral today?" />
        </div>
      </h1>

      <div className="w-full max-w-xl">
        <ChatInputArea 
          value={value}
          setValue={handleInputChange}
          onSend={handleSendClick}
          isInputFocused={isInputFocused}
          setIsInputFocused={setIsInputFocused}
          deepResearchActive={deepResearchActive}
          toggleDeepResearch={handleDeepResearch}
          placeholderText={placeholderText}
          onKeyDown={handleKeyDown}
          isCreatingChat={isCreatingChat}
        />
      </div>
    </div>
  );
}
