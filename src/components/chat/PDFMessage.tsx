
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileIcon, Download, ExternalLink } from "lucide-react";

interface PDFMessageProps {
  url: string;
  filename: string;
}

export function PDFMessage({ url, filename }: PDFMessageProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-4 max-w-md">
      <div className="flex items-start gap-3 mb-2">
        <FileIcon className="w-8 h-8 text-red-400" />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-white truncate">{filename}</p>
          <p className="text-xs text-neutral-400">PDF Document</p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleOpenInNewTab}
        >
          <ExternalLink className="w-4 h-4" />
          View
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
