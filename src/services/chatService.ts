
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
  
  if (lowercaseMessage.startsWith("deepsearch:")) {
    return "I'm currently in offline mode and cannot perform DeepSearch queries. Please try again when online connectivity is restored.";
  }
  
  return "I'm currently operating in offline mode. The webhook service appears to be unavailable. Your message has been saved to the conversation.";
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

// DeepSearch webhook URL
const DEEPSEARCH_WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook-test/a59d2e26-06ce-48cc-b8f7-cdba88f1996c";

// Function to call DeepSearch webhook
export const callDeepSearchWebhook = async (query: string, category: string): Promise<string> => {
  try {
    console.log("Calling DeepSearch webhook with:", query, "Category:", category);
    
    // Using GET method as required by the webhook
    const url = new URL(DEEPSEARCH_WEBHOOK_URL);
    url.searchParams.append('query', query);
    url.searchParams.append('category', category);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log("DeepSearch webhook response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`DeepSearch webhook responded with status code ${response.status}`);
    }
    
    // Try to parse the response as text first
    const responseText = await response.text();
    console.log("Raw DeepSearch webhook response:", responseText);
    
    try {
      // Try to parse as JSON if possible
      const data = JSON.parse(responseText);
      console.log("Parsed JSON response from DeepSearch:", data);
      
      // Handle various response formats
      if (typeof data === 'object') {
        if (data.output) return data.output;
        if (data.response) return data.response;
        if (data.message) return data.message;
        if (data.result) return data.result;
      }
      
      // If it's a string directly
      if (typeof data === 'string') {
        return data;
      }
      
      // Fallback to stringified JSON
      return "DeepSearch results: " + JSON.stringify(data);
    } catch (jsonError) {
      // If it's not valid JSON, just return the raw text
      console.log("Not valid JSON from DeepSearch, using text response");
      return responseText;
    }
  } catch (error) {
    console.error("DeepSearch webhook error:", error);
    return getMockResponse(`DeepSearch: ${category} ${query}`);
  }
};

// Using GET method based on webhook requirements
const WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook/4958690b-eb4d-4f82-8f52-49e13e56b7eb";
const USE_MOCK_RESPONSES = true; // Changed to true to use mock responses as fallback
const MAX_RETRIES = 1; // One retry attempt

export const fetchAIResponse = async (userMessage: string): Promise<string> => {
  // Check if this is a DeepSearch query
  if (userMessage.toLowerCase().startsWith("deepsearch:")) {
    const parts = userMessage.split(" ");
    const category = parts[0].trim(); // "DeepSearch:Category"
    const query = parts.slice(1).join(" ").trim(); // Everything after the category
    
    if (query) {
      try {
        return await callDeepSearchWebhook(query, category);
      } catch (error) {
        console.error("DeepSearch webhook error:", error);
        return getMockResponse(userMessage);
      }
    } else {
      return "Please provide a search query after the DeepSearch category.";
    }
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
        signal: AbortSignal.timeout(10000) // 10 second timeout
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
