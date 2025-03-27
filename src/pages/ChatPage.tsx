
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useChatMessages } from "@/hooks/useChatMessages";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { tempMessageStore } from "@/pages/Index";

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [isPageVisible, setIsPageVisible] = useState(true);
  
  const queryParams = new URLSearchParams(location.search);
  const conversationId = queryParams.get("id");
  
  // Use the pending message from our store instead of URL
  const initialMessage = tempMessageStore.consumeMessage();

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

  // Log for debugging
  useEffect(() => {
    if (initialMessage) {
      console.log("Initial message detected:", initialMessage);
    }
  }, [initialMessage]);

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
