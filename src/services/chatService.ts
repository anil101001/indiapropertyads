/**
 * Chat Service
 * API service for AI chatbot interactions
 */

import api from './api';
import { ChatResponse, Conversation } from '../types/chat';

/**
 * Send message to AI chatbot
 */
export const sendMessage = async (
  message: string,
  conversationId?: string
): Promise<ChatResponse> => {
  const response = await api.post('/ai-chat/message', {
    message,
    conversationId
  });
  return response.data.data;
};

/**
 * Get conversation history
 */
export const getConversations = async (
  limit: number = 10,
  status: 'active' | 'closed' | 'archived' = 'active'
): Promise<Conversation[]> => {
  const response = await api.get('/ai-chat/conversations', {
    params: { limit, status }
  });
  return response.data.data;
};

/**
 * Get specific conversation
 */
export const getConversation = async (
  conversationId: string
): Promise<Conversation> => {
  const response = await api.get(`/ai-chat/conversations/${conversationId}`);
  return response.data.data;
};

/**
 * Close conversation
 */
export const closeConversation = async (
  conversationId: string
): Promise<void> => {
  await api.post(`/ai-chat/conversations/${conversationId}/close`);
};

/**
 * Get trending properties (for initial suggestions)
 */
export const getTrendingProperties = async (limit: number = 5) => {
  const response = await api.get('/ai-chat/properties/trending', {
    params: { limit }
  });
  return response.data.data;
};

/**
 * Check if chat service is available
 */
export const checkChatHealth = async () => {
  const response = await api.get('/ai-chat/health');
  return response.data;
};

export default {
  sendMessage,
  getConversations,
  getConversation,
  closeConversation,
  getTrendingProperties,
  checkChatHealth
};
