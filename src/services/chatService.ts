
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

// Format large numbers to human-readable format (e.g., 1.2M)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Process YouTube data to match the required format
const processYouTubeData = (data: any, searchQuery: string): string => {
  // Check if the response contains YouTube data
  if (!data || !data.items || !Array.isArray(data.items)) {
    return data; // Return original data if it's not in expected format
  }
  
  try {
    // Sort videos by view count (highest to lowest)
    const sortedVideos = [...data.items].sort((a, b) => {
      const viewsA = parseInt(a.statistics?.viewCount || '0');
      const viewsB = parseInt(b.statistics?.viewCount || '0');
      return viewsB - viewsA;
    });

    const topVideos = sortedVideos.slice(0, 10);
    
    // Extract topics from titles
    const allTitles = topVideos.map(video => video.snippet?.title || '');
    const words = allTitles.join(' ').split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.toLowerCase());
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const popularTopics = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
    
    // Identify common patterns
    const patterns = [];
    if (allTitles.filter(title => title.includes('How to')).length > 1) {
      patterns.push(`"How to" tutorials (appears in ${allTitles.filter(title => title.includes('How to')).length} videos)`);
    }
    if (allTitles.filter(title => title.includes('Top ')).length > 1) {
      patterns.push(`"Top" lists (appears in ${allTitles.filter(title => title.includes('Top ')).length} videos)`);
    }
    if (allTitles.filter(title => title.includes('Review')).length > 1) {
      patterns.push(`Product reviews (appears in ${allTitles.filter(title => title.includes('Review')).length} videos)`);
    }
    
    // Extract unique channels
    const channels = [...new Set(topVideos.map(video => video.snippet?.channelTitle))].slice(0, 5);
    
    // Generate content ideas based on top videos
    const contentIdeas = [
      `Create a "${popularTopics[0]}" guide inspired by top-performing videos`,
      `Film a reaction video to "${topVideos[0]?.snippet?.title || 'trending content'}"`,
      `Make a comprehensive list of "${popularTopics[1] || 'trending topics'}" with actionable tips`
    ];
    
    // Format the final output
    return `**YOUTUBE TRENDS: ${searchQuery}**

**TOP TRENDING VIDEOS:**
${topVideos.map(video => `- "${video.snippet?.title}" by ${video.snippet?.channelTitle} - ${formatNumber(parseInt(video.statistics?.viewCount || '0'))} views`).join('\n')}

**POPULAR TOPICS:**
${popularTopics.map(topic => `- ${topic}`).join('\n')}

**VIEW COUNT ANALYSIS:**
- The top videos average ${formatNumber(topVideos.reduce((sum, video) => sum + parseInt(video.statistics?.viewCount || '0'), 0) / topVideos.length)} views
- ${topVideos[0]?.snippet?.title || 'Top video'} has ${formatNumber(parseInt(topVideos[0]?.statistics?.viewCount || '0'))} views, ${topVideos.length > 1 ? `${Math.round((parseInt(topVideos[0]?.statistics?.viewCount || '0') / parseInt(topVideos[1]?.statistics?.viewCount || '1')) * 100)}% more than the second-ranked video` : ''}

**CONTENT PATTERNS:**
${patterns.length ? patterns.map(pattern => `- ${pattern}`).join('\n') : '- No distinct patterns identified'}

**TOP CHANNELS:**
${channels.map(channel => `- ${channel}`).join('\n')}

**CONTENT IDEAS:**
${contentIdeas.map(idea => `- ${idea}`).join('\n')}`;
  } catch (error) {
    console.error("Error processing YouTube data:", error);
    return data; // Return original data if processing fails
  }
};

// Detect if a response is YouTube data and needs special formatting
const isYouTubeData = (data: any, message: string): boolean => {
  const youtubeKeywords = ['youtube', 'videos', 'channel', 'trending'];
  const messageHasYoutubeKeywords = youtubeKeywords.some(keyword => message.toLowerCase().includes(keyword));
  
  return messageHasYoutubeKeywords && data && data.items && Array.isArray(data.items) && 
    data.items.length > 0 && data.items[0].kind?.includes('youtube');
};

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
      
      // Check if response is YouTube data that needs formatting
      if (isYouTubeData(data, userMessage)) {
        console.log("Detected YouTube data, formatting response");
        const searchQuery = userMessage.replace(/youtube|videos|trending|search for/gi, '').trim();
        return processYouTubeData(data, searchQuery);
      }
      
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
