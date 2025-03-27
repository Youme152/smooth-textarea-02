
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
    handleSendMessage
  } = useChatMessages(conversationId, user, initialMessage);

  // Log for debugging
  useEffect(() => {
    if (initialMessage) {
      console.log("Initial message detected:", initialMessage);
    }
  }, [initialMessage]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    // Add event listener for tab visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
