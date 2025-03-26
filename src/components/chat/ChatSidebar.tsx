
import { useState } from 'react';
import { User, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/components/auth/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';

type ChatEntry = {
  id: string;
  title: string;
  date: Date;
};

export function ChatSidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  
  // Mock data for saved chats - would come from database in a real implementation
  const [savedChats] = useState<ChatEntry[]>([
    { id: 'chat-1', title: 'My first chat', date: new Date() },
    { id: 'chat-2', title: 'AI assistant help', date: new Date(Date.now() - 86400000) },
    { id: 'chat-3', title: 'Web design ideas', date: new Date(Date.now() - 172800000) },
  ]);

  const handleChatSelect = (chatId: string) => {
    // In a real implementation, this would navigate to the specific chat
    toast({
      title: "Chat selected",
      description: `Loading chat ${chatId}...`,
    });
    // Navigate to chat page with id as parameter
    navigate(`/chat?id=${chatId}`);
  };

  const initials = user?.email
    ? user.email
        .split('@')[0]
        .split('.')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <Sidebar side="left">
      <SidebarHeader className="border-b border-neutral-800 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-neutral-700">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || ''} />
            <AvatarFallback className="bg-neutral-800 text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-xs text-neutral-400">{user?.email}</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {savedChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton 
                    onClick={() => handleChatSelect(chat.id)}
                    tooltip={chat.title}
                  >
                    <MessageSquare className="text-neutral-400" />
                    <span>{chat.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-neutral-800 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Profile">
              <User className="text-neutral-400" />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="text-neutral-400" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut}
              tooltip="Sign out"
            >
              <LogOut className="text-neutral-400" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
