
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
import { tempMessageStore } from "@/pages/Index";
import { SubscriptionButton } from "@/components/SubscriptionButton";
import { useSubscription } from "@/hooks/useSubscription";

// Prevent duplicates within this time window
const DUPLICATE_PREVENTION_TIMEOUT = 5000; // 5 seconds

export function VercelV0Chat() {
  // Always initialize all hooks at the top level of your component
  const [value, setValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState({ content: "", timestamp: 0 });
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  
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
  
  // Check if a message is a duplicate of the recently sent one
  const isDuplicateMessage = (message: string) => {
    const normalizedMessage = message.trim().toLowerCase();
    const normalizedLastMessage = lastSentMessage.content.trim().toLowerCase();
    const now = Date.now();
    
    // Check if this is the same message and was sent recently
    if (normalizedMessage === normalizedLastMessage && 
        now - lastSentMessage.timestamp < DUPLICATE_PREVENTION_TIMEOUT) {
      return true;
    }
    
    return false;
  };
  
  const createNewConversation = async (initialMessage: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Check subscription status for conversation limit
    if (!subscribed) {
      // Allow limited usage or show subscription prompt
      // You can customize this logic based on your business model
      toast({
        title: "Monthly Subscription Required",
        description: "Please subscribe to access unlimited chats and premium features.",
        variant: "default"
      });
    }
    
    // Prevent duplicate submissions
    if (isDuplicateMessage(initialMessage)) {
      toast({
        title: "Duplicate message",
        description: "Please wait a moment before sending the same message again.",
        variant: "destructive"
      });
      setIsCreatingChat(false);
      return;
    }

    try {
      setIsCreatingChat(true);
      
      // Record this message as sent
      setLastSentMessage({
        content: initialMessage,
        timestamp: Date.now()
      });
      
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert([{ 
          user_id: user.id,
          title: initialMessage.length > 30 ? initialMessage.substring(0, 30) + "..." : initialMessage 
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Explicitly set the message in our temporary store
      tempMessageStore.setPendingMessage(initialMessage);
      console.log("Setting pending message from VercelV0Chat:", initialMessage);
      
      // Clear the input BEFORE navigating
      setValue("");
      
      // Redirect to the chat page with the new conversation ID only
      navigate(`/chat?id=${data.id}`);
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
    if (value.trim() && !isCreatingChat) {
      createNewConversation(value.trim());
    }
  };
  
  // Handle key press to create chat immediately
  const handleKeyDown = (e: any) => {
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
          placeholderText={placeholderText}
          onKeyDown={handleKeyDown}
          isCreatingChat={isCreatingChat}
        />
      </div>
      
      {user && !subscriptionLoading && (
        <div className="mt-4 text-center">
          {subscribed ? (
            <div className="text-green-400 font-medium text-sm">
              ✓ Premium Subscriber
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-neutral-400 text-sm">
                Unlock unlimited chats and premium features
              </p>
              <SubscriptionButton />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
