
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

interface ChatContainerProps {
  conversationTitle: string;
  messages: any[];
  isGenerating: boolean;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  onLoadMore: () => void;
  onSendMessage: (message: string) => void;
}

export function ChatContainer({
  conversationTitle,
  messages,
  isGenerating,
  isLoadingMessages,
  hasMoreMessages,
  onLoadMore,
  onSendMessage
}: ChatContainerProps) {
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
          onLoadMore={onLoadMore}
          isLoading={isLoadingMessages}
          hasMore={hasMoreMessages}
        />
        
        <ChatInput 
          onSendMessage={onSendMessage} 
          isGenerating={isGenerating} 
        />
      </div>
    </div>
  );
}
