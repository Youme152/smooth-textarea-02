
// This mock function provides responses when the webhook is unavailable
export const getMockResponse = (userMessage: string) => {
  const lowercaseMessage = userMessage.toLowerCase();
  
  if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
    return "Hello! I'm a local AI assistant. How can I help you today?";
  }
  
  if (lowercaseMessage.includes("help")) {
    return "I can help answer questions, provide information, or just chat. What would you like to know?";
  }
  
  if (lowercaseMessage.includes("weather")) {
    return "I don't have access to real-time weather data in this local mode. Please check a weather service for current conditions.";
  }
  
  if (lowercaseMessage.includes("roblox")) {
    return "Roblox is a popular online platform where users can create and play games made by other users. Some popular Roblox game ideas include obstacle courses, roleplaying games, tycoon games, and simulators. To make your Roblox game more engaging, focus on unique gameplay, attractive visuals, and regular updates.";
  }
  
  if (lowercaseMessage.includes("viral") || lowercaseMessage.includes("trending")) {
    return "To create viral content, focus on emotional impact, relatability, and timing. Keep content short, engaging, and shareable. Use trending sounds, challenges, or formats, but add your unique twist. Consistency is key - post regularly and engage with your audience.";
  }
  
  return "I'm currently operating in offline mode. The webhook service appears to be unavailable. I can still chat with you using my local knowledge, but my responses will be limited. What would you like to talk about?";
};

// Format view counts to be more readable (e.g., 1.2M instead of 1200000)
const formatViews = (viewCount: number): string => {
  if (viewCount >= 1000000) {
    return (viewCount / 1000000).toFixed(1) + 'M';
  } else if (viewCount >= 1000) {
    return (viewCount / 1000).toFixed(1) + 'K';
  }
  return viewCount.toString();
};

// Single webhook URL - updated to the real webhook
const WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook/4958690b-eb4d-4f82-8f52-49e13e56b7eb";
const USE_MOCK_RESPONSES = false; // Set to false to actually use the webhook
const MAX_RETRIES = 1; // One retry attempt
const WEBHOOK_TIMEOUT = 5000; // 5 seconds timeout

// Status tracking for webhook availability
let isWebhookAvailable = false;
let lastWebhookCheckTime = 0;
const ONLINE_STATUS_CHECK_INTERVAL = 60000; // Check online status every minute

// Function to check if the webhook is available
const checkWebhookAvailability = async (): Promise<boolean> => {
  // Only check once per minute to avoid excessive requests
  const now = Date.now();
  if (now - lastWebhookCheckTime < ONLINE_STATUS_CHECK_INTERVAL) {
    return isWebhookAvailable;
  }
  
  lastWebhookCheckTime = now;
  
  try {
    // Simple HEAD request to check if the webhook is responding
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for availability check
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    isWebhookAvailable = response.ok;
    console.log(`Webhook availability check: ${isWebhookAvailable ? 'ONLINE' : 'OFFLINE'}`);
    return isWebhookAvailable;
  } catch (error) {
    console.log("Webhook availability check failed:", error);
    isWebhookAvailable = false;
    return false;
  }
};

export const fetchAIResponse = async (userMessage: string): Promise<string> => {
  // Check if we're in forced mock mode or the webhook is known to be down
  if (USE_MOCK_RESPONSES || !(await checkWebhookAvailability())) {
    console.log("Using immediate mock response due to webhook likely being down");
    return getMockResponse(userMessage);
  }
  
  // Regular chat flow with retry logic
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount <= MAX_RETRIES) {
    try {
      console.log(`Sending message to webhook (attempt ${retryCount + 1}):`, userMessage);
      
      // Using GET method as required by the webhook
      const url = new URL(WEBHOOK_URL);
      url.searchParams.append('message', userMessage);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent long-hanging requests
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT)
      });
      
      console.log("Webhook response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Webhook responded with status code ${response.status}`);
      }
      
      // Try to parse the response as text first, then decide if it's JSON
      const responseText = await response.text();
      console.log("Raw webhook response:", responseText);
      
      try {
        // Try to parse as JSON if possible
        const data = JSON.parse(responseText);
        console.log("Parsed JSON response:", data);
        
        // Handle array response with output field
        if (Array.isArray(data) && data.length > 0 && data[0].output) {
          return data[0].output;
        }
        
        // Handle direct object with output field
        if (data && data.output) {
          return data.output;
        }
        
        // Handle direct object with response field
        if (data && data.response) {
          return data.response;
        }
        
        // Handle direct message field
        if (data && data.message) {
          return data.message;
        }
        
        // If it's a string directly
        if (typeof data === 'string') {
          return data;
        }
        
        // Fallback to stringified JSON only if we have no other option
        console.log("No recognized response format, returning error message");
        return "Sorry, I couldn't process that request properly.";
      } catch (jsonError) {
        // If it's not valid JSON, just return the raw text
        console.log("Not valid JSON, using text response");
        return responseText;
      }
    } catch (error) {
      console.error(`Webhook error (attempt ${retryCount + 1}):`, error);
      lastError = error;
      retryCount++;
      
      // Small delay before retry
      if (retryCount <= MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }
  }
  
  console.log("All retry attempts failed, using mock response");
  
  // If we're here, all attempts failed
  if (USE_MOCK_RESPONSES) {
    console.log("Using mock response due to webhook failure");
    return getMockResponse(userMessage);
  }
  
  return `I'm sorry, I couldn't connect to the AI service after multiple attempts. Your message has been saved, but I'm unable to generate a response at this time.`;
};
