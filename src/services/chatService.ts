
// Single webhook URL - using the real webhook
const WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook/4958690b-eb4d-4f82-8f52-49e13e56b7eb";
const MAX_RETRIES = 2; // Increase to two retry attempts
const WEBHOOK_TIMEOUT = 10000; // 10 seconds timeout

// Status tracking for webhook availability
let isWebhookAvailable = true; // Default to true to always try the webhook first
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
  // Always attempt to use the webhook
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount <= MAX_RETRIES) {
    try {
      console.log(`Sending message to webhook (attempt ${retryCount + 1}):`, userMessage);
      
      // Using GET method with message as a query parameter as required by the webhook
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
        return "I'm sorry, I couldn't process that request properly.";
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
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Progressive delay
      }
    }
  }
  
  // If all webhook attempts fail, return a clear error message
  return "I'm sorry, I couldn't connect to the AI service after multiple attempts. Please try again in a moment.";
};
