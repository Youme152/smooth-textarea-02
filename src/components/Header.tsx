
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export function Header() {
  const [showChatHistory, setShowChatHistory] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-neutral-800 shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <h1 className="font-playfair font-bold text-2xl text-white">Timeline</h1>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowChatHistory(true)}
            className="text-white hover:bg-white/10"
          >
            <History className="h-5 w-5" />
          </Button>
          <UserMenu />
        </div>
      </div>

      <Dialog open={showChatHistory} onOpenChange={setShowChatHistory}>
        <DialogContent className="bg-[#0f0f0f] border-neutral-700 text-white sm:max-w-[425px] p-0 overflow-hidden">
          <DialogTitle className="p-4 border-b border-neutral-800">Chat History</DialogTitle>
          <div className="relative h-[500px]">
            <ChatSidebar />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
