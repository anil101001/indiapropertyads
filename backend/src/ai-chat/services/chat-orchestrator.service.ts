/**
 * AI Chat Module - Chat Orchestrator Service
 * Main service that coordinates LLM, conversation, and property search
 */

import llmService from './llm.service';
import conversationService from './conversation.service';
import propertySearchService from './property-search.service';
import priceEstimationService from './price-estimation.service';
import { ChatRequest, ChatResponse } from '../types/chat.types';
import { FOLLOW_UP_QUESTIONS, PRICE_ESTIMATION_PROMPT } from '../config/prompts';
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

      // Check if this is a price estimation request
      const isPriceEstimation = this.isPriceEstimationQuery(request.message);
      
      if (isPriceEstimation) {
        logger.info('Detected price estimation query');
        return await this.handlePriceEstimation(request.message, conversation, request.userId);
      }

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
   * Detect if message is requesting a price estimation
   */
  private isPriceEstimationQuery(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Patterns that indicate price estimation request
    const priceKeywords = [
      'price estimate',
      'estimate price',
      'property value',
      'property worth',
      'worth in',
      'worth of',
      "what's worth",
      'how much',
      'what price',
      'price range',
      'market value',
      'fair price',
      'valuation',
      'what should',
      'cost estimate',
      'should i pay',
      'average price',
      'typical price',
      'going for',
      'cost of'
    ];

    // Also check for patterns like "worth" near location/property terms
    const worthPattern = /worth|value|price.*for|cost.*of|how much.*cost/;
    const hasWorthPattern = worthPattern.test(lowerMessage);
    
    // Check if it's asking about price (not showing properties)
    const isAskingAboutPrice = !lowerMessage.includes('show me') && 
                               !lowerMessage.includes('find me') &&
                               !lowerMessage.includes('looking for');

    return (priceKeywords.some(keyword => lowerMessage.includes(keyword)) && isAskingAboutPrice) || 
           (hasWorthPattern && isAskingAboutPrice);
  }

  /**
   * Handle price estimation request
   */
  private async handlePriceEstimation(
    message: string,
    conversation: any,
    userId: string
  ): Promise<ChatResponse> {
    try {
      // Extract location and property details from the message
      // For MVP, we'll use simple regex patterns
      const request = this.extractPriceEstimationParams(message);

      if (!request.location.city) {
        // Ask for location if not provided
        const clarificationResponse = {
          reply: "I'd be happy to help you estimate property prices! To provide an accurate estimate, I need a bit more information. Which city or area are you interested in? For example, you could say \"Estimate price of 2BHK in Hyderabad\" or \"What's the market value of apartments in Bangalore\".",
          conversationId: conversation.conversationId,
          suggestedQuestions: [
            "Estimate 2BHK price in Hyderabad",
            "What's a 3BHK worth in Bangalore?",
            "Property values in Mumbai"
          ]
        };

        await conversationService.addMessage(conversation.conversationId, userId, {
          role: 'assistant',
          content: clarificationResponse.reply
        });

        return clarificationResponse;
      }

      // Get price estimate
      logger.info(`Getting price estimate for ${request.location.city}`);
      const estimate = await priceEstimationService.estimatePrice(request);

      // Format response using GPT
      const formattedResponse = await this.formatPriceEstimateResponse(estimate, request);

      // Save response
      await conversationService.addMessage(conversation.conversationId, userId, {
        role: 'assistant',
        content: formattedResponse.reply
      });

      return {
        ...formattedResponse,
        conversationId: conversation.conversationId
      };

    } catch (error: any) {
      logger.error('Price estimation error:', error);
      return {
        reply: "I encountered an issue while estimating the price. This feature requires sufficient comparable property data in our database. Please try asking about property prices in major cities like Hyderabad, Bangalore, or Mumbai.",
        conversationId: conversation.conversationId,
        suggestedQuestions: [
          "Show me properties in Hyderabad",
          "What are 2BHK apartments available?",
          "Tell me about property trends"
        ]
      };
    }
  }

  /**
   * Extract price estimation parameters from user message
   */
  private extractPriceEstimationParams(message: string): any {
    const lowerMessage = message.toLowerCase();

    // Extract city (simple pattern matching)
    const cities = ['hyderabad', 'bangalore', 'mumbai', 'delhi', 'pune', 'chennai', 'kolkata'];
    const foundCity = cities.find(city => lowerMessage.includes(city));

    // Extract bedrooms
    const bedroomMatch = lowerMessage.match(/(\d+)\s*bhk/);
    const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : undefined;

    // Extract property type
    let propertyType: 'apartment' | 'villa' | 'independent-house' | 'plot' | undefined;
    if (lowerMessage.includes('apartment') || lowerMessage.includes('flat')) {
      propertyType = 'apartment';
    } else if (lowerMessage.includes('villa')) {
      propertyType = 'villa';
    } else if (lowerMessage.includes('house') || lowerMessage.includes('independent')) {
      propertyType = 'independent-house';
    } else if (lowerMessage.includes('plot') || lowerMessage.includes('land')) {
      propertyType = 'plot';
    }

    // Extract area
    const areaMatch = lowerMessage.match(/(\d+)\s*(sqft|sq\s*ft|square\s*feet?)/i);
    const carpetArea = areaMatch ? parseInt(areaMatch[1]) : undefined;

    return {
      location: {
        city: foundCity || ''
      },
      propertyType,
      bedrooms,
      carpetArea
    };
  }

  /**
   * Format price estimate into conversational response
   */
  private async formatPriceEstimateResponse(estimate: any, request: any): Promise<ChatResponse> {
    const estimateText = `
**Price Estimate for ${request.bedrooms || ''}BHK ${request.propertyType || 'Property'} in ${request.location.city}**

**Estimated Price:** ₹${(estimate.estimatedPrice / 10000000).toFixed(2)} Crores  
**Price Range:** ₹${(estimate.priceRange.min / 10000000).toFixed(2)} - ₹${(estimate.priceRange.max / 10000000).toFixed(2)} Crores  
**Price per Sqft:** ₹${estimate.pricePerSqft.toFixed(0)}/sqft  
**Confidence:** ${estimate.confidence.toUpperCase()}

${estimate.explanation}

**Based on ${estimate.dataQuality.totalComparables} comparable properties:**
${estimate.comparables.slice(0, 3).map((c: any, i: number) => 
  `${i + 1}. ${c.title} - ₹${(c.price / 10000000).toFixed(2)} Cr (${c.bedrooms}BHK, ${c.carpetArea} sqft)`
).join('\n')}

**⚠️ Disclaimer:** ${estimate.disclaimer}
    `.trim();

    const gptResponse = await llmService.generateWithSystemPrompt(
      PRICE_ESTIMATION_PROMPT,
      `Present this price estimate to the user in a friendly, conversational way:\n\n${estimateText}`
    );

    return {
      reply: gptResponse.content,
      conversationId: '',
      suggestedQuestions: [
        "Show me actual properties in this range",
        "How does this compare to other areas?",
        "What affects property prices here?"
      ],
      metadata: {
        tokensUsed: gptResponse.tokensUsed
      }
    };
  }

}

// Export singleton instance
export default new ChatOrchestratorService();
