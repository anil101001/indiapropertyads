/**
 * Chat Types
 * Type definitions for AI Chat Widget
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  properties?: PropertySuggestion[];
  suggestedQuestions?: string[];
  metadata?: {
    intent?: string;
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
  reason?: string;
  image?: string;
  bedrooms?: number;
  area?: number;
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
  properties?: PropertySuggestion[];
  suggestedQuestions?: string[];
  intent?: string;
  metadata?: {
    tokensUsed?: number;
    searchPerformed?: boolean;
    propertiesFound?: number;
  };
}

export interface Conversation {
  conversationId: string;
  messages: ChatMessage[];
  lastMessageAt: Date;
  status: 'active' | 'closed';
}

export type ChatStatus = 'idle' | 'typing' | 'sending' | 'error';
