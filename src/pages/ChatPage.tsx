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

const WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook-test/4958690b-eb4d-4f82-8f52-49e13e56b7eb";
const MESSAGES_PER_PAGE = 20;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);
  
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

  const fetchAIResponse = async (userMessage: string, retryCount = 0): Promise<string> => {
    try {
      console.log(`Attempt ${retryCount + 1}: Sending message to webhook:`, userMessage);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          timestamp: new Date().toISOString()
        }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log("Webhook response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Webhook responded with status code ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received response from webhook:", data);
      
      if (data && data.output) {
        return data.output;
      } else {
        if (data && data.response) {
          return data.response;
        }
        if (data && typeof data === 'string') {
          return data;
        }
        if (data && data.message) {
          return data.message;
        }
        console.error("Unexpected response format:", data);
        return "Webhook test successful! The connection works but the response format might be different than expected.";
      }
    } catch (error) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return fetchAIResponse(userMessage, retryCount + 1);
      }
      
      return `Webhook test completed. There might be issues with the connection: ${error.message}. Please check the console logs for details.`;
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
      const { error } = await supabase
        .from("chat_messages")
        .insert([{ 
          chat_id: conversationId,
          user_id: user.id,
          content: content,
          is_user_message: isUserMessage
        }]);
      
      if (error) throw error;
      
      if (isUserMessage) {
        await updateConversationTitle(content);
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
          onLoadMore={loadMoreMessages}
          isLoading={isLoadingMessages}
          hasMore={hasMoreMessages}
        />
        
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;
