/**
 * AI Chat Module - Chat Controller
 * HTTP endpoints for chat interactions
 */

import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import chatOrchestratorService from '../services/chat-orchestrator.service';
import conversationService from '../services/conversation.service';
import propertySearchService from '../services/property-search.service';
import logger from '../../utils/logger';

/**
 * @route   POST /api/v1/ai-chat/message
 * @desc    Send message to AI chatbot
 * @access  Private
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    logger.info(`Chat message from user ${userId}: "${message.substring(0, 50)}..."`);

    logger.info('About to call orchestrator processMessage');
    
    // Process message through orchestrator
    const response = await chatOrchestratorService.processMessage({
      message: message.trim(),
      userId,
      conversationId
    });

    logger.info('Orchestrator returned response, sending to client');
    logger.info('Response content:', JSON.stringify(response).substring(0, 200));

    res.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   GET /api/v1/ai-chat/conversations
 * @desc    Get user's conversation history
 * @access  Private
 */
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { limit = 10, status = 'active' } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const conversations = await conversationService.getUserConversations(
      userId,
      parseInt(limit as string),
      status as 'active' | 'closed' | 'archived'
    );

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });

  } catch (error: any) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
};

/**
 * @route   GET /api/v1/ai-chat/conversations/:conversationId
 * @desc    Get specific conversation details
 * @access  Private
 */
export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const conversation = await conversationService.getConversation(conversationId, userId);

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
      return;
    }

    res.json({
      success: true,
      data: conversation
    });

  } catch (error: any) {
    logger.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation'
    });
  }
};

/**
 * @route   POST /api/v1/ai-chat/conversations/:conversationId/close
 * @desc    Close/end a conversation
 * @access  Private
 */
export const closeConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    await conversationService.closeConversation(conversationId, userId);

    res.json({
      success: true,
      message: 'Conversation closed successfully'
    });

  } catch (error: any) {
    logger.error('Close conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close conversation'
    });
  }
};

/**
 * @route   GET /api/v1/ai-chat/properties/:propertyId/similar
 * @desc    Get similar properties (for chatbot recommendations)
 * @access  Public
 */
export const getSimilarProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { limit = 5 } = req.query;

    const properties = await propertySearchService.getSimilarProperties(
      propertyId,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });

  } catch (error: any) {
    logger.error('Get similar properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get similar properties'
    });
  }
};

/**
 * @route   GET /api/v1/ai-chat/properties/trending
 * @desc    Get trending/featured properties
 * @access  Public
 */
export const getTrendingProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const properties = await propertySearchService.getTrendingProperties(
      parseInt(limit as string)
    );

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });

  } catch (error: any) {
    logger.error('Get trending properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending properties'
    });
  }
};

/**
 * @route   GET /api/v1/ai-chat/stats
 * @desc    Get user's chat statistics
 * @access  Private
 */
export const getChatStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const stats = await conversationService.getConversationStats(userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    logger.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat statistics'
    });
  }
};

/**
 * @route   GET /api/v1/ai-chat/health
 * @desc    Check AI chat service health
 * @access  Public
 */
export const healthCheck = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const llmService = require('../services/llm.service').default;
    
    res.json({
      success: true,
      status: 'operational',
      features: {
        llm: llmService.isEnabled(),
        vectorization: process.env.ENABLE_VECTORIZATION === 'true',
        model: process.env.OPENAI_MODEL || 'not-configured'
      }
    });

  } catch (error: any) {
    res.status(503).json({
      success: false,
      status: 'degraded',
      message: error.message
    });
  }
};
