
// Single webhook URL
const WEBHOOK_URL = "https://ydo453.app.n8n.cloud/webhook/4958690b-eb4d-4f82-8f52-49e13e56b7eb";

export interface AIResponse {
  type: 'text' | 'pdf' | 'html';
  content: string;
  filename?: string;
}

// Simple function to fetch response from the webhook
export const fetchAIResponse = async (userMessage: string): Promise<AIResponse> => {
  try {
    console.log("Sending message to webhook:", userMessage);
    
    // Prepare URL with message parameter
    const url = new URL(WEBHOOK_URL);
    url.searchParams.append('message', userMessage);
    
    // Make a fetch request without a timeout
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json, application/pdf, text/html',
      },
    });
    
    console.log("Webhook response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Webhook responded with status code ${response.status}`);
    }
    
    // Check content type to determine how to handle the response
    const contentType = response.headers.get('Content-Type') || '';
    
    // Handle PDF response
    if (contentType.includes('application/pdf')) {
      console.log("Detected PDF response");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `document-${Date.now()}.pdf`;
      
      return {
        type: 'pdf',
        content: objectUrl,
        filename
      };
    }
    
    // Handle HTML response
    if (contentType.includes('text/html')) {
      console.log("Detected HTML response");
      const htmlContent = await response.text();
      
      return {
        type: 'html',
        content: htmlContent
      };
    }
    
    // Handle text/JSON response
    const responseText = await response.text();
    console.log("Raw webhook response:", responseText);
    
    // Check if the response looks like HTML (even if not properly content-typed)
    if (responseText.trim().startsWith('<!DOCTYPE html>') || 
        responseText.trim().startsWith('<html') || 
        (responseText.includes('<') && responseText.includes('</') && 
        (responseText.includes('<div') || responseText.includes('<p')))) {
      console.log("Detected HTML-like content in response");
      return {
        type: 'html',
        content: responseText
      };
    }
    
    // Safety check for empty response
    if (!responseText || responseText.trim() === '') {
      return { 
        type: 'text', 
        content: "The AI service returned an empty response. Please try again with a different query."
      };
    }
    
    try {
      // Try to parse as JSON if possible
      const data = JSON.parse(responseText);
      console.log("Parsed JSON response:", data);
      
      // Handle array response with output field
      if (Array.isArray(data) && data.length > 0) {
        if (data[0] && data[0].output !== undefined) {
          return { type: 'text', content: data[0].output };
        }
      }
      
      // Handle direct object with output field
      if (data && data.output !== undefined) {
        return { type: 'text', content: data.output };
      }
      
      // Handle direct object with response field
      if (data && data.response !== undefined) {
        return { type: 'text', content: data.response };
      }
      
      // Handle direct message field
      if (data && data.message !== undefined) {
        return { type: 'text', content: data.message };
      }
      
      // If it's a string directly
      if (typeof data === 'string') {
        return { type: 'text', content: data };
      }
      
      // Check if there might be a parts property that's causing the error
      if (data && data.parts) {
        // Safely handle the parts property
        return { 
          type: 'text', 
          content: Array.isArray(data.parts) ? data.parts.join('\n') : String(data.parts) 
        };
      }
      
      // Fallback to a generic message with the raw data as string
      return { 
        type: 'text', 
        content: "I received your message but couldn't format the response properly. Raw response: " + JSON.stringify(data)
      };
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      
      // If it's not valid JSON, just return the raw text
      return { type: 'text', content: responseText };
    }
  } catch (error) {
    console.error("Webhook error:", error);
    
    return { 
      type: 'text', 
      content: "I'm having trouble connecting to the AI service. Please wait as I continue trying to process your request. This might take a moment." 
    };
  }
};
