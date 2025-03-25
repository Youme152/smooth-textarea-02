
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Settings, User, Download, Share2, HelpCircle } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="border-b border-gray-800 bg-[#121212] p-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white mr-2">
              <circle cx="12" cy="12" r="10" />
              <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
              <line x1="9.69" y1="8" x2="21.17" y2="8" />
              <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
              <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
              <line x1="14.31" y1="16" x2="2.83" y2="16" />
              <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
            </svg>
            <span className="font-semibold text-white text-lg">Grok</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <Download className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8 bg-gray-700">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gray-700 text-white">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
