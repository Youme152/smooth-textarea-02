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

// This mock function provides responses when the webhook is unavailable
const getMockResponse = (userMessage: string) => {
  const lowercaseMessage = userMessage.toLowerCase();
  
  if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
    return "Hello! I'm a local AI assistant. How can I help you today?";
  }
  
  if (lowercaseMessage.includes("help")) {
    return "I can help answer questions, provide information, or just chat. What would you like to know?";
  }
  
  if (lowercaseMessage.includes("weather")) {
    return "I don't have access to real-time weather data in this local mode. Please check a weather service for current conditions.";
  }
  
  return "I'm currently operating in offline mode. The webhook service appears to be unavailable. Your message has been saved to the conversation.";
};

// Using GET method based on webhook requirements
const WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook-test/4958690b-eb4d-4f82-8f52-49e13e56b7eb";
const USE_MOCK_RESPONSES = false; // Changed to false to try to use the webhook first
const MESSAGES_PER_PAGE = 20;
const MAX_RETRIES = 0; // No retries to prevent duplicate messages

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<string>>(new Set());
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const queryParams = new URLSearchParams(location.search);
  const conversationId = queryParams.get("id");
  const initialMessage = queryParams.get("initialMessage");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!conversationId) {
      createNewConversation();
      return;
    }

    setCurrentPage(0);
    setMessages([]);
    setInitialMessageProcessed(false);
    setProcessedMessageIds(new Set());
    
    fetchMessages(0);
    fetchConversationTitle();
  }, [conversationId, user]);

  useEffect(() => {
    if (conversationId && initialMessage && !initialMessageProcessed && !isGenerating) {
      const timer = setTimeout(() => {
        handleSendMessage(decodeURIComponent(initialMessage));
        const newUrl = `/chat?id=${conversationId}`;
        window.history.replaceState({}, document.title, newUrl);
        setInitialMessageProcessed(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [conversationId, initialMessage, initialMessageProcessed, messages, isGenerating]);

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

  const fetchMessages = async (page = 0) => {
    if (!conversationId) return;
    
    try {
      setIsLoadingMessages(true);
      
      const from = page * MESSAGES_PER_PAGE;
      const to = from + MESSAGES_PER_PAGE - 1;
      
      const { count, error: countError } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("chat_id", conversationId);
      
      if (countError) throw countError;
      
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_id", conversationId)
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setHasMoreMessages(count !== null && from + data.length < count);
      
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.is_user_message ? "user" as const : "assistant" as const,
        timestamp: new Date(msg.created_at)
      })).reverse();
      
      if (page === 0) {
        setMessages(formattedMessages);
      } else {
        setMessages(prev => (page === 0 ? formattedMessages : [...formattedMessages, ...prev]));
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadMoreMessages = () => {
    if (!isLoadingMessages && hasMoreMessages) {
      fetchMessages(currentPage + 1);
    }
  };

  const fetchAIResponse = async (userMessage: string): Promise<string> => {
    try {
      console.log("Sending message to webhook:", userMessage);
      
      // Using GET method as required by the webhook
      const url = new URL(WEBHOOK_URL);
      url.searchParams.append('message', userMessage);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log("Webhook response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Webhook responded with status code ${response.status}`);
      }
      
      // Try to parse the response as text first, then decide if it's JSON
      const responseText = await response.text();
      console.log("Raw webhook response:", responseText);
      
      try {
        // Try to parse as JSON if possible
        const data = JSON.parse(responseText);
        console.log("Parsed JSON response:", data);
        
        if (data && data.output) {
          return data.output;
        } else if (data && data.response) {
          return data.response;
        } else if (data && typeof data === 'string') {
          return data;
        } else if (data && data.message) {
          return data.message;
        } else if (typeof data === 'string') {
          return data;
        } else {
          // If it's JSON but doesn't have expected fields
          console.log("Using the raw JSON stringified as response");
          return JSON.stringify(data);
        }
      } catch (jsonError) {
        // If it's not valid JSON, just return the raw text
        console.log("Not valid JSON, using text response");
        return responseText;
      }
    } catch (error) {
      console.error("Webhook error:", error);
      
      if (USE_MOCK_RESPONSES) {
        console.log("Using mock response due to webhook failure");
        return getMockResponse(userMessage);
      }
      
      return `I'm sorry, I couldn't connect to the AI service. The message has been saved, but I'm unable to generate a response at this time.`;
    }
  };

  const updateConversationTitle = async (content: string) => {
    if (!conversationId || !user) return;
    
    try {
      if (messages.length === 0 || conversationTitle === "New Conversation") {
        const title = content.length > 30 ? content.substring(0, 30) + "..." : content;
        
        const { error } = await supabase
          .from("chat_conversations")
          .update({ title })
          .eq("id", conversationId);
        
        if (!error) {
          setConversationTitle(title);
        }
      }
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  const saveMessageToSupabase = async (content: string, isUserMessage: boolean) => {
    if (!conversationId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([{ 
          chat_id: conversationId,
          user_id: user.id,
          content: content,
          is_user_message: isUserMessage
        }])
        .select("id")
        .single();
      
      if (error) throw error;
      
      if (isUserMessage) {
        await updateConversationTitle(content);
      }
      
      return data.id;
    } catch (error) {
      console.error("Error saving message:", error);
      return null;
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isGenerating) return;
    
    // Generate a temporary ID for the message
    const tempId = Date.now().toString();
    
    // Check if this message has already been processed
    if (processedMessageIds.has(tempId)) {
      console.log("Preventing duplicate message with ID:", tempId);
      return;
    }
    
    // Add to processed messages to prevent duplicates
    setProcessedMessageIds(prev => new Set(prev).add(tempId));
    
    setIsGenerating(true);
    
    // Add user message to UI immediately
    const userMessage: Message = {
      id: tempId,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Save user message to database
      const savedMsgId = await saveMessageToSupabase(input, true);
      if (savedMsgId) {
        // Update the temporary message with the real ID
        setMessages(prev => 
          prev.map(msg => msg.id === tempId ? {...msg, id: savedMsgId} : msg)
        );
      }
      
      // Get AI response
      const aiResponse = await fetchAIResponse(input);
      
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantResponse]);
      await saveMessageToSupabase(aiResponse, false);
    } catch (error: any) {
      console.error("Error in message flow:", error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
      await saveMessageToSupabase(errorResponse.content, false);
    } finally {
      setIsGenerating(false);
      // We don't remove from processedMessageIds to ensure this temp ID is never processed again
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
          onLoadMore={loadMoreMessages}
          isLoading={isLoadingMessages}
          hasMore={hasMoreMessages}
        />
        
        <ChatInput onSendMessage={handleSendMessage} isGenerating={isGenerating} />
      </div>
    </div>
  );
};

export default ChatPage;
