
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchAIResponse } from "@/services/chatService";

export type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

// Constants
const MESSAGES_PER_PAGE = 20;
const DUPLICATE_PREVENTION_TIMEOUT = 5000; // 5 seconds cooldown between identical messages

export const useChatMessages = (conversationId: string | null, user: any | null, initialMessage: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<string>>(new Set());
  const [recentMessages, setRecentMessages] = useState<Map<string, number>>(new Map());
  const [deepSearchActive, setDeepSearchActive] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reset state when conversation changes
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
    setRecentMessages(new Map());
    setInitialLoadComplete(false);
    setIsFirstLoad(true);
    
    fetchMessages(0);
    fetchConversationTitle();
  }, [conversationId, user]);

  // Handle initial message with better duplicate protection
  useEffect(() => {
    // Only proceed if we have completed the initial data loading
    if (conversationId && initialMessage && !initialMessageProcessed && !isGenerating && initialLoadComplete && isFirstLoad) {
      const decodedMessage = decodeURIComponent(initialMessage);
      setIsFirstLoad(false);
      
      // Only process if not already processed and not a duplicate
      if (!isDuplicateMessage(decodedMessage)) {
        handleSendMessage(decodedMessage);
        
        // Clear the initial message from the URL to prevent re-processing on refresh
        const newUrl = `/chat?id=${conversationId}`;
        window.history.replaceState({}, document.title, newUrl);
        setInitialMessageProcessed(true);
      } else {
        // If it's a duplicate, mark as processed without sending
        const newUrl = `/chat?id=${conversationId}`;
        window.history.replaceState({}, document.title, newUrl);
        setInitialMessageProcessed(true);
      }
    }
  }, [conversationId, initialMessage, initialMessageProcessed, isGenerating, initialLoadComplete, isFirstLoad]);

  // Check if a message is a duplicate (sent recently)
  const isDuplicateMessage = (content: string) => {
    const normalizedContent = content.trim().toLowerCase();
    const now = Date.now();
    
    // Check if this exact message was sent recently
    if (recentMessages.has(normalizedContent)) {
      const lastSentTime = recentMessages.get(normalizedContent) || 0;
      
      // Consider it a duplicate if sent within the prevention timeout
      if (now - lastSentTime < DUPLICATE_PREVENTION_TIMEOUT) {
        console.log("Preventing duplicate message:", normalizedContent);
        return true;
      }
    }
    
    // Not a duplicate or timeout has passed
    return false;
  };

  // Add message to recent messages tracking
  const trackMessageSent = (content: string) => {
    const normalizedContent = content.trim().toLowerCase();
    const now = Date.now();
    
    // Update the recent messages map
    setRecentMessages(prev => {
      const updated = new Map(prev);
      updated.set(normalizedContent, now);
      
      // Clean up old entries (older than 1 minute)
      for (const [key, timestamp] of updated.entries()) {
        if (now - timestamp > 60000) {
          updated.delete(key);
        }
      }
      
      return updated;
    });
  };

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
      
      // Mark initial load as complete after first page is loaded
      if (page === 0) {
        setInitialLoadComplete(true);
      }
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
    
    // Check for duplicate message
    if (isDuplicateMessage(input)) {
      console.log("Prevented duplicate message submission:", input);
      toast({
        title: "Duplicate message",
        description: "Please wait a moment before sending the same message again.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate a temporary ID for the message
    const tempId = Date.now().toString();
    
    // Check if this message has already been processed
    if (processedMessageIds.has(tempId)) {
      console.log("Preventing duplicate message with ID:", tempId);
      return;
    }
    
    // Track this message to prevent duplicates
    trackMessageSent(input);
    
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
      
      // Get AI response, passing the DeepSearch state
      const aiResponse = await fetchAIResponse(input, deepSearchActive);
      
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

  const toggleDeepSearch = () => {
    setDeepSearchActive(prev => !prev);
  };

  return {
    messages,
    isGenerating,
    conversationTitle,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    handleSendMessage,
    deepSearchActive,
    toggleDeepSearch
  };
};
