/**
 * AI Chat Module - Type Definitions
 * Centralized types for the entire AI chat system
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  metadata?: {
    propertyIds?: string[];
    searchQuery?: string;
    intent?: string;
  };
}

export interface ConversationContext {
  conversationId: string;
  userId: string;
  messages: ChatMessage[];
  userPreferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'closed' | 'archived';
}

export interface UserPreferences {
  location?: {
    city?: string;
    locality?: string;
    preferredAreas?: string[];
  };
  budget?: {
    min?: number;
    max?: number;
  };
  propertyType?: 'apartment' | 'villa' | 'independent-house' | 'plot';
  bedrooms?: number;
  amenities?: string[];
  furnishing?: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  listingType?: 'sale' | 'rent';
}

export interface ChatRequest {
  message: string;
  userId: string;
  conversationId?: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
  properties?: PropertySuggestion[];
  suggestedQuestions?: string[];
  intent?: ConversationIntent;
  metadata?: {
    tokensUsed?: number;
    searchPerformed?: boolean;
    propertiesFound?: number;
  };
}

export interface PropertySuggestion {
  propertyId: string;
  title: string;
  price: number;
  location: string;
  score?: number;
  reason?: string; // Why this property matches
}

export enum ConversationIntent {
  SEARCH = 'search',
  INQUIRY = 'inquiry',
  FILTER = 'filter',
  COMPARE = 'compare',
  SCHEDULE_VISIT = 'schedule_visit',
  GENERAL = 'general',
  CLARIFICATION = 'clarification'
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
}

export interface SearchResult {
  properties: any[];
  query: string;
  filters: UserPreferences;
  totalFound: number;
}

export interface IntentAnalysis {
  intent: ConversationIntent;
  confidence: number;
  extractedData: {
    location?: string;
    priceRange?: { min?: number; max?: number };
    propertyType?: string;
    bedrooms?: number;
    amenities?: string[];
    urgency?: 'high' | 'medium' | 'low';
  };
}
