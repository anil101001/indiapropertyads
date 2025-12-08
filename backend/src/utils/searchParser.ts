/**
 * Utility to parse natural language search queries for property filtering
 */

interface ParsedSearch {
  text: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

export const parseSearchQuery = (query: string): ParsedSearch => {
  if (!query) return { text: '' };

  let text = query.toLowerCase();
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let bedrooms: number | undefined;

  // Helper to convert price string to number
  const parsePrice = (amount: string, unit: string): number => {
    const value = parseFloat(amount);
    if (isNaN(value)) return 0;
    
    switch (unit) {
      case 'cr':
      case 'crore':
      case 'crores':
        return value * 10000000;
      case 'l':
      case 'lac':
      case 'lacs':
      case 'lakh':
      case 'lakhs':
        return value * 100000;
      case 'k':
      case 'thousand':
      case 'thousands':
        return value * 1000;
      default:
        return value;
    }
  };

  // 1. Extract Bedrooms (e.g., "2bhk", "3 bhk", "2 bedroom")
  const bhkRegex = /(\d+)\s*(?:bhk|bedroom|bed)/i;
  const bhkMatch = text.match(bhkRegex);
  if (bhkMatch) {
    bedrooms = parseInt(bhkMatch[1]);
    // Optional: remove from text if you want strict text search only on remaining
    // text = text.replace(bhkMatch[0], '');
  }

  // 2. Extract Price Patterns
  
  // Pattern: "under/below/less than X unit"
  const underRegex = /(?:under|below|less than)\s+(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lac|lacs|lakh|lakhs|k|thousand|thousands)?/i;
  const underMatch = text.match(underRegex);

  // Pattern: "above/more than X unit"
  const aboveRegex = /(?:above|more than)\s+(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lac|lacs|lakh|lakhs|k|thousand|thousands)?/i;
  const aboveMatch = text.match(aboveRegex);

  // Pattern: "between X unit1 and Y unit2" or "X unit1 to Y unit2"
  // Now supports mixed units: "50 lakhs and 1 crore" or "50L - 1cr"
  const rangeRegex = /(?:between|from)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lac|lacs|lakh|lakhs|k|thousand|thousands)?\s*(?:to|and|-)\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lac|lacs|lakh|lakhs|k|thousand|thousands)?/i;
  const rangeMatch = text.match(rangeRegex);

  if (rangeMatch) {
    // Range detected (e.g. "1 to 2 crore" or "50 lakhs and 1 crore")
    const minVal = parseFloat(rangeMatch[1]);
    const maxVal = parseFloat(rangeMatch[3]); // Note: Group 3 now (was 2)
    const unit1 = (rangeMatch[2] || '').toLowerCase(); // First unit (optional)
    const unit2 = (rangeMatch[4] || '').toLowerCase(); // Second unit (optional)
    
    // Determine which units to use
    // Priority: If both units provided, use them independently
    // If only one unit, apply to both numbers
    let minUnit = unit1 || unit2 || '';
    let maxUnit = unit2 || unit1 || '';
    
    if (minUnit) {
      minPrice = parsePrice(minVal.toString(), minUnit);
    } else {
      minPrice = minVal; // No unit, use raw number
    }
    
    if (maxUnit) {
      maxPrice = parsePrice(maxVal.toString(), maxUnit);
    } else {
      maxPrice = maxVal; // No unit, use raw number
    }
    
    // Validation: Ensure min <= max
    if (minPrice && maxPrice && minPrice > maxPrice) {
      // Swap if user accidentally put them in wrong order
      [minPrice, maxPrice] = [maxPrice, minPrice];
    }
    
    // Clean text
    text = text.replace(rangeMatch[0], '').trim();
  } else {
    // Single bound checks
    if (underMatch) {
      const val = parseFloat(underMatch[1]);
      const unit = (underMatch[2] || '').toLowerCase();
      
      if (unit) {
        maxPrice = parsePrice(val.toString(), unit);
      } else {
        maxPrice = val;
      }
      
      text = text.replace(underMatch[0], '').trim();
    }

    if (aboveMatch) {
      const val = parseFloat(aboveMatch[1]);
      const unit = (aboveMatch[2] || '').toLowerCase();
      
      if (unit) {
        minPrice = parsePrice(val.toString(), unit);
      } else {
        minPrice = val;
      }
      
      text = text.replace(aboveMatch[0], '').trim();
    }
  }
  
  // Clean up extra spaces
  text = text.replace(/\s+/g, ' ').trim();

  return {
    text,
    minPrice,
    maxPrice,
    bedrooms
  };
};
