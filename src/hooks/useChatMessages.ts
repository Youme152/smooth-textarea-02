
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchAIResponse } from "@/services/chatService";

export type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "pdf" | "html";
  filename?: string;
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Add a ref to track current conversation ID to prevent state leaking across conversations
  const currentConversationIdRef = useRef<string | null>(null);
  const activeRequestRef = useRef<{ id: string, conversationId: string | null } | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update the current conversation ID ref when it changes
  useEffect(() => {
    currentConversationIdRef.current = conversationId;
  }, [conversationId]);

  // Debug initial message
  useEffect(() => {
    if (initialMessage) {
      console.log("useChatMessages received initial message:", initialMessage);
    }
  }, [initialMessage]);

  // Reset state function that can be called when returning to the page
  const resetChatState = useCallback(() => {
    if (!conversationId) return;
    
    setCurrentPage(0);
    setInitialMessageProcessed(false);
    setInitialLoadComplete(false);
    // Reset the isGenerating state when chat changes
    setIsGenerating(false);
    fetchMessages(0, true); // force refresh
    fetchConversationTitle();
  }, [conversationId]);

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
    // Reset the isGenerating state when conversation changes
    setIsGenerating(false);
    
    fetchMessages(0);
    fetchConversationTitle();
  }, [conversationId, user]);

  // Process initial message after conversation is loaded
  useEffect(() => {
    if (conversationId && initialMessage && !initialMessageProcessed && !isGenerating && initialLoadComplete) {
      console.log("Processing initial message:", initialMessage);
      
      // Check if the messages list is empty or the first message doesn't match our initial message
      const shouldProcessInitialMessage = messages.length === 0 || 
        (messages.length > 0 && messages[0].content !== initialMessage);
      
      if (shouldProcessInitialMessage && !isDuplicateMessage(initialMessage)) {
        console.log("Sending initial message as it's not already in the chat");
        handleSendMessage(initialMessage);
      } else {
        console.log("Initial message already exists in chat or is a duplicate");
      }
      
      setInitialMessageProcessed(true);
    }
  }, [conversationId, initialMessage, initialMessageProcessed, isGenerating, initialLoadComplete, messages]);

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

  const fetchMessages = async (page = 0, forceRefresh = false) => {
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
        timestamp: new Date(msg.created_at),
        // Make sure to cast the message_type to our specific type
        type: (msg.message_type as "text" | "pdf" | "html" | undefined) || "text",
        filename: msg.filename
      }));
      
      if (page === 0 || forceRefresh) {
        setMessages(formattedMessages.reverse());
      } else {
        setMessages(prev => [...formattedMessages.reverse(), ...prev]);
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

  const saveMessageToSupabase = async (content: string, isUserMessage: boolean, type: "text" | "pdf" | "html" = "text", filename?: string) => {
    if (!conversationId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([{ 
          chat_id: conversationId,
          user_id: user.id,
          content: content,
          is_user_message: isUserMessage,
          message_type: type,
          filename: filename
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
    
    console.log("Handling send message:", input);
    
    // Capture the current conversation ID for this message flow
    const targetConversationId = currentConversationIdRef.current;
    
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
    
    // Create a unique ID for this request
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if this message has already been processed
    if (processedMessageIds.has(tempId)) {
      console.log("Preventing duplicate message with ID:", tempId);
      return;
    }
    
    // Track this message to prevent duplicates
    trackMessageSent(input);
    
    // Add to processed messages to prevent duplicates
    setProcessedMessageIds(prev => new Set(prev).add(tempId));
    
    // Only set isGenerating if this is the active conversation
    if (currentConversationIdRef.current === targetConversationId) {
      setIsGenerating(true);
    }
    
    // Store the active request reference
    activeRequestRef.current = { id: requestId, conversationId: targetConversationId };
    
    // Add user message to UI immediately
    const userMessage: Message = {
      id: tempId,
      content: input,
      sender: "user",
      timestamp: new Date(),
      type: "text"
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
      
      // Check if this request is still active and for the current conversation
      if (
        activeRequestRef.current?.id !== requestId || 
        activeRequestRef.current?.conversationId !== targetConversationId ||
        targetConversationId !== currentConversationIdRef.current
      ) {
        console.log("Conversation changed during AI response generation, aborting update");
        
        // Only reset isGenerating if we're in the same conversation that initiated the request
        if (targetConversationId === currentConversationIdRef.current) {
          setIsGenerating(false);
        }
        return;
      }
      
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: "assistant",
        timestamp: new Date(),
        type: (aiResponse.type as "text" | "pdf" | "html"),
        filename: aiResponse.filename
      };
      
      setMessages(prev => [...prev, assistantResponse]);
      await saveMessageToSupabase(
        aiResponse.content, 
        false, 
        (aiResponse.type as "text" | "pdf" | "html"), 
        aiResponse.filename
      );
    } catch (error: any) {
      console.error("Error in message flow:", error);
      
      // Check if this request is still active and for the current conversation
      if (
        activeRequestRef.current?.id !== requestId || 
        activeRequestRef.current?.conversationId !== targetConversationId ||
        targetConversationId !== currentConversationIdRef.current
      ) {
        console.log("Conversation changed during error handling, aborting update");
        
        // Only reset isGenerating if we're in the same conversation that initiated the request
        if (targetConversationId === currentConversationIdRef.current) {
          setIsGenerating(false);
        }
        return;
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev, errorResponse]);
      await saveMessageToSupabase(errorResponse.content, false);
    } finally {
      // Only update isGenerating state if we're still in the same conversation
      // and this is still the active request
      if (
        targetConversationId === currentConversationIdRef.current &&
        activeRequestRef.current?.id === requestId
      ) {
        setIsGenerating(false);
        activeRequestRef.current = null;
      }
    }
  };

  return {
    messages,
    isGenerating,
    conversationTitle,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    handleSendMessage,
    resetChatState
  };
};
