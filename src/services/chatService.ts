
import { v4 as uuidv4 } from 'uuid';

// For simulating AI responses in development environment
const mockResponses = [
  "I'm sorry, I don't understand. Could you please clarify?",
  "That's an interesting question. Here's what I think...",
  "Based on the latest research, the answer is more complex than it seems.",
  "According to my knowledge, that would be correct.",
  "I'd recommend considering several factors before making that decision."
];

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://timelineai-server-v1.onrender.com';

/**
 * Fetches a response from the AI based on the user's message
 */
export const fetchAIResponse = async (userMessage: string) => {
  console.log("Sending message to webhook:", userMessage);
  try {
    // Generate a unique message ID
    const messageId = uuidv4();
    console.log("Generated message ID:", messageId);
    
    // Send the request to the webhook endpoint
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, application/pdf, text/html',
      },
      body: JSON.stringify({ 
        message: userMessage,
        messageId: messageId
      }),
    });
    
    console.log("Webhook response status:", response.status);
    
    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from webhook:", errorText);
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }
    
    // Check content type to determine how to handle the response
    const contentType = response.headers.get('Content-Type') || '';
    console.log("Response content type:", contentType);
    
    // Handle PDF responses
    if (contentType.includes('application/pdf')) {
      console.log("Detected PDF response");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : 'document.pdf';
      
      return {
        type: 'pdf',
        content: url,
        filename: filename
      };
    }
    
    // Handle HTML responses
    if (contentType.includes('text/html')) {
      console.log("Detected HTML response");
      const htmlContent = await response.text();
      return {
        type: 'html',
        content: htmlContent
      };
    }
    
    // Get the response text for further processing
    const responseText = await response.text();
    console.log("Response text:", responseText.substring(0, 150) + "...");
    
    // Check if the content appears to be HTML based on its structure
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
        if (data[0].output) {
          return { type: 'text', content: data[0].output };
        }
        if (typeof data[0] === 'string') {
          return { type: 'text', content: data[0] };
        }
      }
      
      // Handle standard API response formats
      if (data.output) {
        return { type: 'text', content: data.output };
      }
      
      if (data.content) {
        return { type: 'text', content: data.content };
      }
      
      if (data.message) {
        return { type: 'text', content: data.message };
      }
      
      if (data.text) {
        return { type: 'text', content: data.text };
      }
      
      // If it's a string directly
      if (typeof data === 'string') {
        return { type: 'text', content: data };
      }
      
      // Fallback for other JSON structures
      return { 
        type: 'text', 
        content: "Received a JSON response that doesn't match expected format: " + JSON.stringify(data).substring(0, 200)
      };
    } catch (parseError) {
      console.log("Response is not valid JSON, treating as plain text");
      // Not JSON, treat as plain text
      return { type: 'text', content: responseText };
    }
  } catch (error) {
    console.error("Error fetching response:", error);
    throw error;
  }
};
