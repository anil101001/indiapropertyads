/**
 * AI Chat Module - Chat Orchestrator Service
 * Main service that coordinates LLM, conversation, and property search
 */

import llmService from './llm.service';
import conversationService from './conversation.service';
import propertySearchService from './property-search.service';
import { ChatRequest, ChatResponse } from '../types/chat.types';
import { FOLLOW_UP_QUESTIONS } from '../config/prompts';
import logger from '../../utils/logger';

class ChatOrchestratorService {
  /**
   * Main chat handler - processes user message and generates response
   */
  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      logger.info(`Processing message from user ${request.userId}`);

      // Check if LLM is enabled
      if (!llmService.isEnabled()) {
        return {
          reply: "AI chat is currently disabled. Please enable ENABLE_VECTORIZATION and configure OPENAI_API_KEY.",
          conversationId: '',
          suggestedQuestions: []
        };
      }

      // Get or create conversation
      const conversation = await conversationService.getOrCreateConversation(
        request.userId,
        request.conversationId
      );
      logger.info('Conversation retrieved/created');

      // Add user message to conversation
      await conversationService.addMessage(conversation.conversationId, request.userId, {
        role: 'user',
        content: request.message
      });
      logger.info('User message added successfully');

      // Get conversation history for context
      const history = conversationService.getConversationHistory(conversation, 6);

      // ALWAYS search the database first - no intent detection needed!
      logger.info('Searching vectorized database with user message...');
      
      const searchResults = await propertySearchService.searchProperties(
        request.message,
        {},  // No filters - just semantic search
        5
      );

      logger.info(`Database search found ${searchResults.properties.length} properties`);

      let response: ChatResponse;

      // If properties found, present them
      if (searchResults.properties.length > 0) {
        logger.info(`First property: ${searchResults.properties[0].title}`);
        
        const recommendationResponse = await llmService.generatePropertyRecommendation(
          request.message,
          searchResults.properties,
          history
        );

        // Map properties to suggestions
        const propertySuggestions = searchResults.properties.map(p => ({
          propertyId: p._id.toString(),
          title: p.title,
          price: p.pricing.expectedPrice,
          location: `${p.address.city}, ${p.address.state}`,
          score: p.score || 0,
          reason: `Matches your search`
        }));

        response = {
          reply: recommendationResponse.content,
          conversationId: conversation.conversationId,
          properties: propertySuggestions,
          suggestedQuestions: FOLLOW_UP_QUESTIONS.SEARCH,
          metadata: {
            tokensUsed: recommendationResponse.tokensUsed,
            searchPerformed: true,
            propertiesFound: searchResults.properties.length
          }
        };
      } else {
        // No properties in database
        const noResultsResponse = await llmService.generateNoResultsResponse(request.message);

        response = {
          reply: noResultsResponse.content,
          conversationId: conversation.conversationId,
          properties: [],
          suggestedQuestions: FOLLOW_UP_QUESTIONS.GENERAL,
          metadata: {
            tokensUsed: noResultsResponse.tokensUsed,
            searchPerformed: true,
            propertiesFound: 0
          }
        };
      }

      // Save assistant response to conversation
      await conversationService.addMessage(conversation.conversationId, request.userId, {
        role: 'assistant',
        content: response.reply,
        metadata: {
          propertyIds: response.properties?.map(p => p.propertyId)
        }
      });

      return response;

    } catch (error: any) {
      logger.error('Chat orchestrator error:', error);
      return {
        reply: "I'm sorry, I encountered an error. Please try again.",
        conversationId: request.conversationId || '',
        suggestedQuestions: [
          "What are you looking for?",
          "Tell me about your budget and location preferences"
        ]
      };
    }
  }

}

// Export singleton instance
export default new ChatOrchestratorService();
