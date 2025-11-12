/**
 * AI Chat Module - Conversation Service
 * Manages conversation state and history
 */

import { v4 as uuidv4 } from 'uuid';
import Conversation, { IConversation } from '../models/Conversation.model';
import { ChatMessage, UserPreferences } from '../types/chat.types';
import { CONVERSATION_CONFIG } from '../config/prompts';
import logger from '../../utils/logger';

class ConversationService {
  /**
   * Create new conversation
   */
  async createConversation(
    userId: string,
    platform: 'web' | 'whatsapp' | 'mobile' = 'web',
    metadata?: any
  ): Promise<IConversation> {
    try {
      const conversationId = `conv_${uuidv4()}`;

      const conversation = await Conversation.create({
        conversationId,
        userId,
        messages: [],
        status: 'active',
        metadata: {
          platform,
          ...metadata
        }
      });

      logger.info(`New conversation created: ${conversationId} for user ${userId}`);
      return conversation;

    } catch (error: any) {
      logger.error('Create conversation error:', error);
      throw new Error('Failed to create conversation');
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string, userId: string): Promise<IConversation | null> {
    try {
      const conversation = await Conversation.findOne({ 
        conversationId, 
        userId 
      });

      return conversation;

    } catch (error: any) {
      logger.error('Get conversation error:', error);
      return null;
    }
  }

  /**
   * Get or create active conversation for user
   */
  async getOrCreateConversation(
    userId: string,
    conversationId?: string,
    platform: 'web' | 'whatsapp' | 'mobile' = 'web'
  ): Promise<IConversation> {
    try {
      // If conversationId provided, try to get it
      if (conversationId) {
        const existing = await this.getConversation(conversationId, userId);
        if (existing && existing.status === 'active') {
          return existing;
        }
      }

      // Find user's most recent active conversation
      const recentConversation = await Conversation.findOne({
        userId,
        status: 'active',
        lastMessageAt: {
          $gte: new Date(Date.now() - CONVERSATION_CONFIG.SESSION_TIMEOUT)
        }
      }).sort({ lastMessageAt: -1 });

      if (recentConversation) {
        logger.info(`Resuming conversation: ${recentConversation.conversationId}`);
        return recentConversation;
      }

      // Create new conversation
      return this.createConversation(userId, platform);

    } catch (error: any) {
      logger.error('Get or create conversation error:', error);
      throw new Error('Failed to get or create conversation');
    }
  }

  /**
   * Add message to conversation
   */
  async addMessage(
    conversationId: string,
    userId: string,
    message: ChatMessage
  ): Promise<IConversation> {
    try {
      const conversation = await this.getConversation(conversationId, userId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      conversation.messages.push({
        ...message,
        timestamp: new Date()
      });

      conversation.lastMessageAt = new Date();

      // Limit message history
      if (conversation.messages.length > CONVERSATION_CONFIG.MAX_HISTORY_MESSAGES) {
        conversation.messages = conversation.messages.slice(-CONVERSATION_CONFIG.MAX_HISTORY_MESSAGES);
      }

      await conversation.save();

      logger.info(`Message added to conversation ${conversationId}`);
      return conversation;

    } catch (error: any) {
      logger.error('Add message error:', error);
      throw new Error('Failed to add message to conversation');
    }
  }

  /**
   * Update user preferences in conversation
   */
  async updatePreferences(
    conversationId: string,
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<IConversation> {
    try {
      const conversation = await this.getConversation(conversationId, userId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Ensure userPreferences exists
      if (!conversation.userPreferences) {
        conversation.userPreferences = {} as any;
      }

      // Update only defined preferences individually to avoid validation errors
      if (preferences.location !== undefined) {
        conversation.userPreferences.location = preferences.location;
      }
      if (preferences.budget !== undefined) {
        conversation.userPreferences.budget = preferences.budget;
      }
      if (preferences.propertyType !== undefined) {
        conversation.userPreferences.propertyType = preferences.propertyType;
      }
      if (preferences.bedrooms !== undefined) {
        conversation.userPreferences.bedrooms = preferences.bedrooms;
      }
      if (preferences.amenities !== undefined) {
        conversation.userPreferences.amenities = preferences.amenities;
      }

      await conversation.save();

      logger.info(`Preferences updated for conversation ${conversationId}`);
      return conversation;

    } catch (error: any) {
      logger.error('Update preferences error:', error);
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Get conversation history for LLM context
   */
  getConversationHistory(conversation: IConversation, limit: number = 10): ChatMessage[] {
    return conversation.messages
      .slice(-limit)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata
      }));
  }

  /**
   * Close conversation
   */
  async closeConversation(conversationId: string, userId: string): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId, userId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      conversation.status = 'closed';
      await conversation.save();

      logger.info(`Conversation closed: ${conversationId}`);

    } catch (error: any) {
      logger.error('Close conversation error:', error);
      throw new Error('Failed to close conversation');
    }
  }

  /**
   * Get user's conversation history
   */
  async getUserConversations(
    userId: string,
    limit: number = 10,
    status: 'active' | 'closed' | 'archived' = 'active'
  ): Promise<IConversation[]> {
    try {
      const conversations = await Conversation.find({
        userId,
        status
      })
        .sort({ lastMessageAt: -1 })
        .limit(limit);

      return conversations;

    } catch (error: any) {
      logger.error('Get user conversations error:', error);
      return [];
    }
  }

  /**
   * Archive old conversations (cleanup job)
   */
  async archiveOldConversations(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const result = await Conversation.updateMany(
        {
          status: 'closed',
          lastMessageAt: { $lt: cutoffDate }
        },
        {
          $set: { status: 'archived' }
        }
      );

      logger.info(`Archived ${result.modifiedCount} old conversations`);
      return result.modifiedCount || 0;

    } catch (error: any) {
      logger.error('Archive conversations error:', error);
      return 0;
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(userId: string): Promise<{
    total: number;
    active: number;
    closed: number;
    averageMessages: number;
  }> {
    try {
      const [stats] = await Conversation.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            closed: {
              $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
            },
            averageMessages: { $avg: { $size: '$messages' } }
          }
        }
      ]);

      return stats || { total: 0, active: 0, closed: 0, averageMessages: 0 };

    } catch (error: any) {
      logger.error('Get conversation stats error:', error);
      return { total: 0, active: 0, closed: 0, averageMessages: 0 };
    }
  }
}

// Export singleton instance
export default new ConversationService();
