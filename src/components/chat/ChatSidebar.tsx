
import { useState, useEffect } from "react";
import { MessageSquare, Plus, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

export function ChatSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();

  // Extract the current conversation ID from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const currentId = queryParams.get("id");
    if (currentId) {
      setActiveConversationId(currentId);
    }
  }, [location]);

  // Fetch conversations when user logs in or navigates to the page
  useEffect(() => {
    if (!user) return;
    fetchConversations();

    // Listen for changes to chat_conversations table
    const channel = supabase
      .channel('sidebar-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_conversations' }, 
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setConversations(data || []);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      toast({
        variant: "destructive",
        title: "Failed to load conversations",
        description: error.message || "An error occurred while loading your conversations."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert([
          { 
            user_id: user.id,
            title: "New Conversation" 
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      setConversations([data, ...conversations]);
      navigate(`/chat?id=${data.id}`);
      setActiveConversationId(data.id);
    } catch (error: any) {
      console.error("Error creating new conversation:", error);
      toast({
        variant: "destructive",
        title: "Failed to create conversation",
        description: error.message || "An error occurred while creating a new conversation."
      });
    }
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    navigate(`/chat?id=${id}`);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost"
        size="icon"
        className="absolute top-4 right-[-40px] z-20"
        onClick={toggleSidebar}
      >
        <Menu />
      </Button>
      
      <div className={cn(
        "h-screen w-64 bg-[#0f0f0f] border-r border-neutral-800 flex flex-col transition-all duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between border-b border-neutral-800">
          <h2 className="text-lg font-medium text-white">Conversations</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={createNewConversation}
            className="hover:bg-neutral-800"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-4 mt-8 text-neutral-400">
              <MessageSquare className="h-10 w-10 mb-3 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start a new conversation to get going!</p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-center p-3 rounded-md cursor-pointer transition-colors",
                    activeConversationId === conversation.id 
                      ? "bg-blue-600/20 text-blue-300" 
                      : "hover:bg-neutral-800 text-neutral-300"
                  )}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate text-sm">
                    {conversation.title || "New Conversation"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
