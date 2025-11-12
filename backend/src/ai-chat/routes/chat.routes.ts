/**
 * AI Chat Module - Routes
 * API endpoints for AI chatbot
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  sendMessage,
  getConversations,
  getConversation,
  closeConversation,
  getSimilarProperties,
  getTrendingProperties,
  getChatStats,
  healthCheck
} from '../controllers/chat.controller';

const router = Router();

/**
 * Chat endpoints
 */

// Send message to chatbot
router.post('/message', authenticate, sendMessage);

// Get user's conversations
router.get('/conversations', authenticate, getConversations);

// Get specific conversation
router.get('/conversations/:conversationId', authenticate, getConversation);

// Close conversation
router.post('/conversations/:conversationId/close', authenticate, closeConversation);

// Get chat statistics
router.get('/stats', authenticate, getChatStats);

/**
 * Property recommendation endpoints
 */

// Get similar properties (public)
router.get('/properties/:propertyId/similar', getSimilarProperties);

// Get trending properties (public)
router.get('/properties/trending', getTrendingProperties);

/**
 * Health check
 */
router.get('/health', healthCheck);

export default router;
