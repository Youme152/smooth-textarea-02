
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
  
  return "I'm currently operating in offline mode. The webhook service appears to be unavailable. Your message has been saved to the conversation.";
};

// Using GET method based on webhook requirements
const WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook/4958690b-eb4d-4f82-8f52-49e13e56b7eb";
const USE_MOCK_RESPONSES = false; // Changed to false to try to use the webhook first
const MAX_RETRIES = 0; // No retries to prevent duplicate messages

export const fetchAIResponse = async (userMessage: string): Promise<string> => {
  try {
    console.log("Sending message to webhook:", userMessage);
    
    // Using GET method as required by the webhook
    const url = new URL(WEBHOOK_URL);
    url.searchParams.append('message', userMessage);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
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
    console.error("Webhook error:", error);
    
    if (USE_MOCK_RESPONSES) {
      console.log("Using mock response due to webhook failure");
      return getMockResponse(userMessage);
    }
    
    return `I'm sorry, I couldn't connect to the AI service. The message has been saved, but I'm unable to generate a response at this time.`;
  }
};
