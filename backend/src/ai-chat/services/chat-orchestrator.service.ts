/**
 * AI Chat Module - Chat Orchestrator Service
 * Main service that coordinates LLM, conversation, and property search
 */

import llmService from './llm.service';
import conversationService from './conversation.service';
import propertySearchService from './property-search.service';
import { ChatRequest, ChatResponse, ConversationIntent, UserPreferences } from '../types/chat.types';
import { SYSTEM_PROMPTS, FOLLOW_UP_QUESTIONS } from '../config/prompts';
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

  /**
   * Handle property search intent
   */
  private async handlePropertySearch(
    userMessage: string,
    extractedData: any,
    existingPreferences?: UserPreferences,
    history: any[] = []
  ): Promise<Partial<ChatResponse>> {
    try {
      // Build search filters from extracted data and existing preferences
      const filters: Partial<UserPreferences> = {
        ...existingPreferences,
        ...this.buildPreferencesFromIntent(extractedData)
      };

      logger.info(`Search filters built: ${JSON.stringify(filters)}`);

      // Check if we have enough information to search
      const missingInfo = this.getMissingSearchCriteria(filters);
      logger.info(`Missing search criteria: ${JSON.stringify(missingInfo)}`);
      
      if (missingInfo.length > 0) {
        // Need clarification
        const clarificationResponse = await llmService.generateClarificationQuestions(
          userMessage,
          missingInfo
        );

        return {
          reply: clarificationResponse.content,
          properties: [],
          suggestedQuestions: FOLLOW_UP_QUESTIONS.GENERAL,
          metadata: {
            tokensUsed: clarificationResponse.tokensUsed,
            searchPerformed: false
          }
        };
      }

      // Perform property search
      const searchResults = await propertySearchService.searchProperties(
        userMessage,
        filters,
        5
      );

      logger.info(`Property search found ${searchResults.properties.length} properties`);
      if (searchResults.properties.length > 0) {
        logger.info(`First property: ${searchResults.properties[0].title}`);
      }

      // If no results, generate "no results" response
      if (searchResults.properties.length === 0) {
        const noResultsResponse = await llmService.generateNoResultsResponse(userMessage);

        return {
          reply: noResultsResponse.content,
          properties: [],
          suggestedQuestions: FOLLOW_UP_QUESTIONS.FILTER,
          metadata: {
            tokensUsed: noResultsResponse.tokensUsed,
            searchPerformed: true,
            propertiesFound: 0
          }
        };
      }

      // Generate property recommendations
      const recommendationResponse = await llmService.generatePropertyRecommendation(
        userMessage,
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
        reason: `Matches your ${filters.bedrooms}BHK requirement in ${filters.location?.city || 'your preferred area'}`
      }));

      return {
        reply: recommendationResponse.content,
        properties: propertySuggestions,
        suggestedQuestions: FOLLOW_UP_QUESTIONS.SEARCH,
        metadata: {
          tokensUsed: recommendationResponse.tokensUsed,
          searchPerformed: true,
          propertiesFound: searchResults.properties.length
        }
      };

    } catch (error: any) {
      logger.error('Handle property search error:', error);
      return {
        reply: "I'm having trouble searching for properties right now. Could you rephrase your requirements?",
        properties: [],
        suggestedQuestions: FOLLOW_UP_QUESTIONS.GENERAL
      };
    }
  }

  /**
   * Handle property inquiry intent
   */
  private async handlePropertyInquiry(
    userMessage: string,
    history: any[] = []
  ): Promise<Partial<ChatResponse>> {
    try {
      const response = await llmService.generateWithSystemPrompt(
        SYSTEM_PROMPTS.PROPERTY_ASSISTANT,
        userMessage,
        history
      );

      return {
        reply: response.content,
        suggestedQuestions: FOLLOW_UP_QUESTIONS.INQUIRY,
        metadata: {
          tokensUsed: response.tokensUsed
        }
      };

    } catch (error: any) {
      logger.error('Handle inquiry error:', error);
      return {
        reply: "I can help you with that. Could you provide more details?",
        suggestedQuestions: FOLLOW_UP_QUESTIONS.GENERAL
      };
    }
  }

  /**
   * Handle clarification requests
   */
  private async handleClarification(
    userMessage: string,
    _extractedData: any,
    history: any[] = []
  ): Promise<Partial<ChatResponse>> {
    try {
      const response = await llmService.generateWithSystemPrompt(
        SYSTEM_PROMPTS.PROPERTY_ASSISTANT,
        userMessage,
        history
      );

      return {
        reply: response.content,
        suggestedQuestions: FOLLOW_UP_QUESTIONS.GENERAL,
        metadata: {
          tokensUsed: response.tokensUsed
        }
      };

    } catch (error: any) {
      logger.error('Handle clarification error:', error);
      return {
        reply: "Let me help you find the perfect property. What are your main requirements?",
        suggestedQuestions: FOLLOW_UP_QUESTIONS.GENERAL
      };
    }
  }

  /**
   * Handle general queries
   */
  private async handleGeneralQuery(
    userMessage: string,
    history: any[] = []
  ): Promise<Partial<ChatResponse>> {
    try {
      const response = await llmService.generateWithSystemPrompt(
        SYSTEM_PROMPTS.PROPERTY_ASSISTANT,
        userMessage,
        history
      );

      return {
        reply: response.content,
        suggestedQuestions: FOLLOW_UP_QUESTIONS.GENERAL,
        metadata: {
          tokensUsed: response.tokensUsed
        }
      };

    } catch (error: any) {
      logger.error('Handle general query error:', error);
      return {
        reply: "I'm here to help you find properties. What are you looking for?",
        suggestedQuestions: FOLLOW_UP_QUESTIONS.GENERAL
      };
    }
  }

  /**
   * Build user preferences from extracted intent data
   */
  private buildPreferencesFromIntent(extractedData: any): Partial<UserPreferences> {
    const preferences: Partial<UserPreferences> = {};

    if (extractedData.location) {
      preferences.location = { city: extractedData.location };
    }

    if (extractedData.priceRange) {
      preferences.budget = {
        min: extractedData.priceRange.min,
        max: extractedData.priceRange.max
      };
    }

    if (extractedData.propertyType) {
      preferences.propertyType = extractedData.propertyType;
    }

    if (extractedData.bedrooms) {
      preferences.bedrooms = extractedData.bedrooms;
    }

    if (extractedData.amenities) {
      preferences.amenities = extractedData.amenities;
    }

    return preferences;
  }

  /**
   * Check for missing search criteria
   * Only require location - everything else is optional for a basic search
   */
  private getMissingSearchCriteria(filters: Partial<UserPreferences>): string[] {
    const missing: string[] = [];

    // Only require location - user can search without budget or bedrooms
    if (!filters.location?.city) {
      missing.push('location/city');
    }

    // Optional: Don't block search if budget is missing
    // Optional: Don't block search if bedrooms is missing

    return missing;
  }
}

// Export singleton instance
export default new ChatOrchestratorService();
