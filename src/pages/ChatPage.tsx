
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useChatMessages } from "@/hooks/useChatMessages";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { tempMessageStore } from "@/pages/Index";

const ChatPage = () => {
  // Always initialize all hooks at the top level
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  
  // Get the conversationId from query params
  const queryParams = new URLSearchParams(location.search);
  const conversationId = queryParams.get("id");
  
  // Initialize the initialMessage state with the pending message once
  useEffect(() => {
    const pendingMessage = tempMessageStore.consumeMessage();
    if (pendingMessage) {
      console.log("Retrieved pending message:", pendingMessage);
      setInitialMessage(pendingMessage);
    }
  }, [conversationId]); // Add conversationId as dependency to reset on chat change

  // Use the custom hook to manage chat messages and state
  const {
    messages,
    isGenerating,
    conversationTitle,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    handleSendMessage,
    resetChatState
  } = useChatMessages(conversationId, user, initialMessage);

  // Handle page visibility changes to prevent unnecessary reloads
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);
      
      // Only reset state when coming back to the page if necessary
      if (isVisible && messages.length === 0 && conversationId) {
        resetChatState();
      }
    };

    // Add event listener for tab visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [conversationId, messages.length, resetChatState]);

  return (
    <ChatContainer
      conversationTitle={conversationTitle}
      messages={messages}
      isGenerating={isGenerating}
      isLoadingMessages={isLoadingMessages}
      hasMoreMessages={hasMoreMessages}
      onLoadMore={loadMoreMessages}
      onSendMessage={handleSendMessage}
    />
  );
}

export default ChatPage;
