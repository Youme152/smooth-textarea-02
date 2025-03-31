
import React, { useEffect, useRef, useState } from "react";

interface HtmlMessageProps {
  content: string;
}

export function HtmlMessage({ content }: HtmlMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeHeight, setIframeHeight] = useState(300);
  
  useEffect(() => {
    const handleIframeLoad = () => {
      if (iframeRef.current?.contentWindow?.document.body) {
        const body = iframeRef.current.contentWindow.document.body;
        const height = body.scrollHeight;
        setIframeHeight(Math.min(Math.max(height, 200), 800));
        
        // Check content length to determine if controls should be shown
        const contentLength = body.innerHTML.length;
        setShowControls(contentLength > 1000);
      }
    };
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }
    
    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [content]);
  
  return (
    <div className="html-message w-full">
      <iframe
        ref={iframeRef}
        srcDoc={content}
        className="w-full border-0 rounded"
        style={{ 
          height: isExpanded ? '800px' : `${iframeHeight}px`,
          overflow: 'auto',
          transition: 'height 0.3s ease'
        }}
        sandbox="allow-scripts"
        title="HTML Message"
      />
      
      {showControls && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-400 mt-1 hover:text-blue-300"
        >
          {isExpanded ? "Collapse" : "Expand"} content
        </button>
      )}
    </div>
  );
}
