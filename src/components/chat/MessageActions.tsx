
import React from "react";
import { RotateCcw, Download, ThumbsUp, ThumbsDown } from "lucide-react";

export function MessageActions() {
  return (
    <div className="flex items-center space-x-1 ml-2">
      <button className="p-1 rounded hover:bg-gray-700">
        <RotateCcw className="h-4 w-4 text-gray-400" />
      </button>
      <button className="p-1 rounded hover:bg-gray-700">
        <Download className="h-4 w-4 text-gray-400" />
      </button>
      <button className="p-1 rounded hover:bg-gray-700">
        <ThumbsUp className="h-4 w-4 text-gray-400" />
      </button>
      <button className="p-1 rounded hover:bg-gray-700">
        <ThumbsDown className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  );
}
