
import React from "react";
import { RotateCcw, Download, ThumbsUp, ThumbsDown, Copy } from "lucide-react";

export function MessageActions() {
  return (
    <div className="flex items-center space-x-1 ml-2">
      <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors">
        <RotateCcw className="h-4 w-4" />
      </button>
      <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors">
        <Copy className="h-4 w-4" />
      </button>
      <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors">
        <ThumbsUp className="h-4 w-4" />
      </button>
      <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors">
        <ThumbsDown className="h-4 w-4" />
      </button>
    </div>
  );
}
