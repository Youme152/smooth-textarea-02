
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthContext";
import { toast } from "@/hooks/use-toast";

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
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // Get conversation ID from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const conversationId = queryParams.get("id");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!conversationId) {
      // Create a new conversation if none is specified
      createNewConversation();
      return;
    }

    // Fetch conversation messages
    fetchMessages();
    // Fetch conversation details
    fetchConversationTitle();
  }, [conversationId, user]);

  const createNewConversation = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert([{ 
          user_id: user?.id,
          title: "New Conversation" 
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      navigate(`/chat?id=${data.id}`);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast({
        variant: "destructive",
        title: "Failed to create conversation",
        description: error.message || "An error occurred while creating a new conversation."
      });
    }
  };

  const fetchConversationTitle = async () => {
    if (!conversationId) return;
    
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("title")
        .eq("id", conversationId)
        .single();
      
      if (error) throw error;
      
      setConversationTitle(data.title || "New Conversation");
    } catch (error) {
      console.error("Error fetching conversation title:", error);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_id", conversationId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.is_user_message ? "user" as const : "assistant" as const,
        timestamp: new Date(msg.created_at)
      }));
      
      setMessages(formattedMessages);
      
      // If no messages, initialize with a greeting
      if (formattedMessages.length === 0) {
        const initialMessages = [
          {
            id: "assistant-init",
            content: "Hey hey! 😊 What's up?",
            sender: "assistant" as const,
            timestamp: new Date(),
          }
        ];
        setMessages(initialMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

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

  const saveMessageToSupabase = async (content: string, isUserMessage: boolean) => {
    if (!conversationId || !user) return;
    
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert([{ 
          chat_id: conversationId,
          user_id: user.id,
          content: content,
          is_user_message: isUserMessage
        }]);
      
      if (error) throw error;
      
      // Update conversation title if it's the first user message
      if (isUserMessage && messages.length <= 1) {
        const title = content.length > 30 ? content.substring(0, 30) + "..." : content;
        
        const { error: titleError } = await supabase
          .from("chat_conversations")
          .update({ title })
          .eq("id", conversationId);
        
        if (!titleError) {
          setConversationTitle(title);
        }
      }
    } catch (error) {
      console.error("Error saving message:", error);
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
    saveMessageToSupabase(input, true);
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
      saveMessageToSupabase(aiResponse, false);
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
      saveMessageToSupabase(errorResponse.content, false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#131314] text-white overflow-hidden">
      <ChatSidebar />
      
      <div className="flex-1 flex flex-col h-full">
        <div className="border-b border-neutral-800 p-3 text-center">
          <h1 className="text-lg font-medium truncate">{conversationTitle}</h1>
        </div>
        
        <MessageList 
          messages={messages}
          isGenerating={isGenerating}
        />
        
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;
