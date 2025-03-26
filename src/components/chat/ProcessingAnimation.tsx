
import { useEffect, useRef, useState } from "react";

interface ProcessingAnimationProps {
  isVisible: boolean;
}

export function ProcessingAnimation({ isVisible }: ProcessingAnimationProps) {
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [tweets, setTweets] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");

  const codeLines = [
    "import tweepy",
    "auth = tweepy.OAuth2BearerHandler(TOKEN)",
    "api = tweepy.API(auth)",
    "results = api.search_tweets('viral content', count=2500)",
    "for tweet in results:",
    "    process_tweet(tweet.id, tweet.text)",
    "    user = extract_user_data(tweet.user)",
    "    store_profile(user.id, user.name, user.location)",
    "df = pd.DataFrame(collected_data)",
    "df.drop_duplicates(inplace=True)",
    "calculate_statistics(df)",
    "export_data(df, 'viral_content.json')",
    "print('Data collection complete')"
  ];

  const totalTweets = 2500;

  useEffect(() => {
    if (!isVisible) return;
    
    let animationFrameId: number;
    
    // Reset states when becoming visible
    setCurrentLine(0);
    setTweets(0);
    setProgress(0);
    setStatusText("Initializing...");
    
    const addCodeLine = () => {
      if (currentLine < codeLines.length) {
        setCurrentLine(prev => prev + 1);
        
        // Scroll to bottom
        if (codeContainerRef.current) {
          codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
        }
        
        // Schedule next line
        setTimeout(addCodeLine, Math.random() * 150 + 50);
      } else {
        // When we reach the end, start over for continuous effect
        setTimeout(() => {
          setCurrentLine(0);
        }, 500);
      }
    };

    const updateProgress = () => {
      if (progress < 100) {
        // Increase progress
        const increment = Math.random() * 2 + 1;
        const newProgress = Math.min(progress + increment, 100);
        setProgress(newProgress);
        
        // Calculate tweets scanned based on progress
        const newTweets = Math.floor((newProgress / 100) * totalTweets);
        setTweets(newTweets);
        
        // Update status text based on progress
        if (newProgress < 20) {
          setStatusText("Initializing...");
        } else if (newProgress < 40) {
          setStatusText("Scanning...");
        } else if (newProgress < 60) {
          setStatusText("Processing...");
        } else if (newProgress < 80) {
          setStatusText("Analyzing...");
        } else {
          setStatusText("Finalizing...");
        }
        
        // Schedule next update using requestAnimationFrame for smoother animation
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    // Start animations
    setTimeout(addCodeLine, 100);
    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVisible, progress, currentLine, codeLines.length]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center w-full py-10 max-w-md mx-auto">
      <div className="logo-container flex justify-center items-center mb-12">
        <div className="text-white text-8xl font-bold text-center">𝕏</div>
      </div>
      
      <div 
        ref={codeContainerRef} 
        className="w-4/5 h-36 overflow-hidden p-3 bg-neutral-900/50 rounded-lg font-mono text-white text-xs leading-normal shadow-lg"
      >
        {codeLines.slice(0, currentLine).map((line, index) => (
          <div key={index} className="whitespace-nowrap my-0.5 animate-fade-in opacity-70">
            {line}
          </div>
        ))}
      </div>
      
      <div className="mt-12 w-4/5">
        <div className="flex justify-between text-white text-sm mb-2.5">
          <div className="font-bold text-[#1DA1F2]">{tweets.toLocaleString()} tweets</div>
          <div className="font-medium tracking-wider">{statusText}</div>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#1DA1F2] to-[#38B6FF] rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
