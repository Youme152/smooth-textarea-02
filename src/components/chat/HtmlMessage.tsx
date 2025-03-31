
import React, { useEffect, useRef, useState } from "react";

interface HtmlMessageProps {
  content: string;
}

export function HtmlMessage({ content }: HtmlMessageProps) {
  // Always initialize all hooks at the top level
  const [isExpanded, setIsExpanded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(300);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  useEffect(() => {
    if (!iframeRef.current) return;
    
    const handleIframeLoad = () => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow?.document.body) {
        const body = iframe.contentWindow.document.body;
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
      
      // Force load handler to run if iframe is already loaded
      if (iframe.contentWindow?.document.readyState === 'complete') {
        handleIframeLoad();
      }
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
