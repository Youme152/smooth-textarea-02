
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Settings, User } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="border-b border-gray-800 bg-[#1A1B1E] p-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5 text-gray-400" />
          </Button>
          <span className="font-semibold text-white">Grok AI</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-gray-400" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gray-700">
              <User className="h-4 w-4 text-gray-300" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
