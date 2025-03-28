
import { format, fromUnixTime } from "date-fns";

// Format date function - properly handles Unix timestamps and ISO strings
export const formatDate = (timestamp: string | number | undefined | null) => {
  if (!timestamp) return "N/A";
  
  try {
    // Check if it's a Unix timestamp (number or numeric string)
    if (typeof timestamp === 'number' || (typeof timestamp === 'string' && !isNaN(Number(timestamp)))) {
      const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
      
      // If timestamp is in seconds (Unix timestamp), convert to milliseconds
      // Unix timestamps are typically 10 digits (seconds) while JS timestamps are 13 digits (milliseconds)
      if (numericTimestamp < 10000000000) {
        return format(fromUnixTime(numericTimestamp), "PPP");
      } else {
        return format(new Date(numericTimestamp), "PPP");
      }
    }
    
    // Handle ISO date strings
    return format(new Date(timestamp), "PPP");
  } catch (e) {
    console.error("Error formatting date:", e, "Value was:", timestamp);
    return "Invalid date";
  }
};

// Format currency
export const formatCurrency = (amount: number | null | undefined, currency: string = 'usd') => {
  if (amount === null || amount === undefined) return 'N/A';
  
  // Stripe amounts are in cents, convert to dollars
  const dollars = amount / 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(dollars);
};
