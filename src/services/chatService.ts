
// Single webhook URL
const WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook/4958690b-eb4d-4f82-8f52-49e13e56b7eb";
const WEBHOOK_TIMEOUT = 600000; // 10 minutes timeout (600,000 ms)

// Simple function to fetch response from the webhook
export const fetchAIResponse = async (userMessage: string): Promise<string> => {
  try {
    console.log("Sending message to webhook:", userMessage);
    
    // Prepare URL with message parameter
    const url = new URL(WEBHOOK_URL);
    url.searchParams.append('message', userMessage);
    
    // Make a single fetch request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT)
    });
    
    console.log("Webhook response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Webhook responded with status code ${response.status}`);
    }
    
    // Get the raw response text
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
      
      // Fallback to a generic message
      return "I received your message but couldn't format the response properly.";
    } catch (jsonError) {
      // If it's not valid JSON, just return the raw text
      return responseText;
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return "I'm having trouble connecting to the AI service. Please try again in a moment.";
  }
};
