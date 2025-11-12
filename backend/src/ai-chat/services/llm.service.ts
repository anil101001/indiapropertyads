/**
 * AI Chat Module - LLM Service
 * Handles all interactions with OpenAI API
 */

import OpenAI from 'openai';
import { ChatMessage, LLMConfig, IntentAnalysis, ConversationIntent } from '../types/chat.types';
import { SYSTEM_PROMPTS, LLM_CONFIGS } from '../config/prompts';
import logger from '../../utils/logger';

class LLMService {
  private client: OpenAI | null = null;
  private clientInitialized: boolean = false;

  /**
   * Lazy initialization of OpenAI client
   */
  private initializeClient(): void {
    if (!this.clientInitialized && this.isEnabled()) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.clientInitialized = true;
    }
  }

  /**
   * Check if LLM service is available (checks env vars dynamically)
   */
  isEnabled(): boolean {
    return process.env.ENABLE_VECTORIZATION === 'true' && !!process.env.OPENAI_API_KEY;
  }

  /**
   * Generate chat completion
   */
  async generateResponse(
    messages: ChatMessage[],
    config: LLMConfig = LLM_CONFIGS.DEFAULT
  ): Promise<{ content: string; tokensUsed: number }> {
    if (!this.isEnabled()) {
      throw new Error('LLM service is not enabled. Set ENABLE_VECTORIZATION=true and configure OPENAI_API_KEY');
    }

    this.initializeClient();

    if (!this.client) {
      throw new Error('Failed to initialize OpenAI client');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP
      });

      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      logger.info(`LLM response generated: ${tokensUsed} tokens used`);

      return {
        content,
        tokensUsed
      };

    } catch (error: any) {
      logger.error('LLM generation error:', error);
      throw new Error(`Failed to generate LLM response: ${error.message}`);
    }
  }

  /**
   * Generate response with system prompt
   */
  async generateWithSystemPrompt(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    config: LLMConfig = LLM_CONFIGS.DEFAULT
  ): Promise<{ content: string; tokensUsed: number }> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return this.generateResponse(messages, config);
  }

  /**
   * Extract user intent from message
   */
  async extractIntent(userMessage: string): Promise<IntentAnalysis> {
    try {
      const response = await this.generateWithSystemPrompt(
        SYSTEM_PROMPTS.INTENT_EXTRACTION,
        `User message: "${userMessage}"`,
        [],
        LLM_CONFIGS.PRECISE
      );

      // Parse JSON response
      const parsed = JSON.parse(response.content);

      return {
        intent: parsed.intent || ConversationIntent.GENERAL,
        confidence: parsed.confidence || 0.5,
        extractedData: {
          location: parsed.location,
          priceRange: parsed.priceRange,
          propertyType: parsed.propertyType,
          bedrooms: parsed.bedrooms,
          amenities: parsed.amenities,
          urgency: parsed.urgency || 'medium'
        }
      };

    } catch (error: any) {
      logger.warn('Intent extraction failed, using default:', error.message);
      
      // Fallback to basic intent detection
      return {
        intent: ConversationIntent.GENERAL,
        confidence: 0.3,
        extractedData: {}
      };
    }
  }

  /**
   * Generate property recommendation response
   */
  async generatePropertyRecommendation(
    userRequirements: string,
    properties: any[],
    conversationHistory: ChatMessage[] = []
  ): Promise<{ content: string; tokensUsed: number }> {
    const propertiesText = properties.map((p, idx) => 
      `${idx + 1}. ${p.title}
   Location: ${p.address.city}, ${p.address.state}
   Price: ₹${this.formatPrice(p.pricing.expectedPrice)}
   Size: ${p.specs.bedrooms}BHK, ${p.specs.carpetArea} sqft
   Amenities: ${p.amenities.slice(0, 5).join(', ')}
   Status: ${p.specs.possession}`
    ).join('\n\n');

    const prompt = SYSTEM_PROMPTS.PROPERTY_RECOMMENDATION
      .replace('{requirements}', userRequirements)
      .replace('{properties}', propertiesText);

    return this.generateWithSystemPrompt(
      SYSTEM_PROMPTS.PROPERTY_ASSISTANT,
      prompt,
      conversationHistory.slice(-6), // Last 3 exchanges
      LLM_CONFIGS.DEFAULT
    );
  }

  /**
   * Generate clarification questions
   */
  async generateClarificationQuestions(
    userMessage: string,
    missingInfo: string[]
  ): Promise<{ content: string; tokensUsed: number }> {
    const prompt = SYSTEM_PROMPTS.CLARIFICATION
      .replace('{missingInfo}', missingInfo.join(', '));

    return this.generateWithSystemPrompt(
      SYSTEM_PROMPTS.PROPERTY_ASSISTANT,
      `User said: "${userMessage}"\n\n${prompt}`,
      [],
      LLM_CONFIGS.DEFAULT
    );
  }

  /**
   * Handle no results scenario
   */
  async generateNoResultsResponse(
    userRequirements: string
  ): Promise<{ content: string; tokensUsed: number }> {
    return this.generateWithSystemPrompt(
      SYSTEM_PROMPTS.PROPERTY_ASSISTANT,
      `${SYSTEM_PROMPTS.NO_RESULTS}\n\nUser requirements: ${userRequirements}`,
      [],
      LLM_CONFIGS.DEFAULT
    );
  }

  /**
   * Format price in Indian format
   */
  private formatPrice(price: number): string {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)} Crores`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(2)} Lakhs`;
    }
    return price.toLocaleString('en-IN');
  }

  /**
   * Generate embeddings for text (reuse from existing embedding service)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isEnabled()) {
      throw new Error('LLM service is not enabled');
    }

    this.initializeClient();

    if (!this.client) {
      throw new Error('Failed to initialize OpenAI client');
    }

    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 1536
      });

      return response.data[0].embedding;

    } catch (error: any) {
      logger.error('Embedding generation error:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Count tokens in text (approximate)
   */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

// Export singleton instance
export default new LLMService();
