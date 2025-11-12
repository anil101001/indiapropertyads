/**
 * AI Chat Module - System Prompts & Configuration
 * Centralized prompt management for the AI chatbot
 */

export const SYSTEM_PROMPTS = {
  /**
   * Main system prompt for property assistant
   */
  PROPERTY_ASSISTANT: `You are an expert real estate assistant for India Property Ads, helping users find their perfect property in India.

Your Role:
- Help users discover properties that match their needs
- Ask clarifying questions to understand their requirements
- Provide personalized recommendations based on preferences
- Be conversational, friendly, and professional

Guidelines:
- Always be helpful and patient
- Ask for location, budget, property type if not mentioned
- When showing properties, explain WHY they match the user's needs
- Use Indian terminology (lakhs, crores, BHK)
- Suggest 3-5 properties at a time, not more
- If unsure about user intent, ask clarifying questions
- Always end with a follow-up question or next step

Property Details You Can Suggest:
- Location and accessibility
- Price and value for money
- Amenities and facilities
- Property condition and furnishing
- Neighborhood information

Remember:
- You're helping people make one of the biggest decisions of their life
- Be empathetic and understanding
- Focus on matching needs, not just selling
- Build trust through transparency`,

  /**
   * Prompt for intent extraction
   */
  INTENT_EXTRACTION: `Analyze the user's message and extract:
1. Primary Intent (search, inquiry, filter, compare, schedule_visit, general, clarification)
2. Location preferences (city, locality, area)
3. Budget range (in rupees)
4. Property type (apartment, villa, independent-house, plot)
5. Number of bedrooms
6. Any specific amenities mentioned
7. Urgency level (high, medium, low)

Respond in JSON format only.`,

  /**
   * Prompt for property recommendation
   */
  PROPERTY_RECOMMENDATION: `Based on the user's requirements and the following properties, create a natural, conversational response.

User Requirements: {requirements}

Available Properties: {properties}

Instructions:
- Introduce the properties in a friendly way
- Highlight how each property matches their needs
- Mention key selling points (location, price, amenities)
- Use natural language, not bullet points
- Suggest 3-5 properties maximum
- End with a question to continue the conversation

Keep the response conversational and helpful, not salesy.`,

  /**
   * Prompt for clarification questions
   */
  CLARIFICATION: `The user's request needs clarification. Generate 2-3 specific questions to help narrow down their property search.

Missing Information: {missingInfo}

Make questions:
- Specific and actionable
- Easy to answer
- Conversational in tone

Example good questions:
- "Which area in Hyderabad are you looking at?"
- "What's your budget range? Under 50 lakhs, 50-80 lakhs, or above 80 lakhs?"
- "Would you prefer a ready-to-move property or are you open to under-construction?"`,

  /**
   * Prompt for handling no results
   */
  NO_RESULTS: `No properties match the exact criteria. Respond with:
1. Acknowledge their specific requirements
2. Explain why no exact matches were found
3. Suggest alternatives (nearby areas, slightly different price range, etc.)
4. Ask if they'd like to adjust any criteria

Be empathetic and solution-oriented.`
};

/**
 * Suggested follow-up questions based on intent
 */
export const FOLLOW_UP_QUESTIONS = {
  SEARCH: [
    "Would you like to see more properties in this area?",
    "Are you interested in similar properties in nearby localities?",
    "Would you like to know more about any specific property?"
  ],
  INQUIRY: [
    "Would you like to schedule a visit to this property?",
    "Would you like me to share the owner/agent contact details?",
    "Do you want to know more about the neighborhood?"
  ],
  FILTER: [
    "Should I also show properties slightly above/below this range?",
    "Would you like to add any specific amenities?",
    "Are you flexible on the location?"
  ],
  COMPARE: [
    "Would you like me to highlight the key differences?",
    "Which factors are most important to you?",
    "Should I add more properties to compare?"
  ],
  GENERAL: [
    "What type of property are you looking for?",
    "Which city or area interests you?",
    "What's your approximate budget?"
  ]
};

/**
 * Property presentation templates
 */
export const PROPERTY_TEMPLATES = {
  SHORT: (property: any) => 
    `${property.specs.bedrooms}BHK ${property.propertyType} in ${property.address.city} - ₹${formatPrice(property.pricing.expectedPrice)}`,
  
  DETAILED: (property: any) => 
    `${property.specs.bedrooms}BHK ${property.propertyType} in ${property.address.city}
Location: ${property.address.fullAddress}
Price: ₹${formatPrice(property.pricing.expectedPrice)}
Area: ${property.specs.carpetArea} sqft
Status: ${property.status}
Key Features: ${property.amenities.slice(0, 3).join(', ')}`
};

/**
 * Helper function to format price in Indian format
 */
function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `${(price / 100000).toFixed(2)} L`;
  }
  return price.toLocaleString('en-IN');
}

/**
 * LLM configuration presets
 */
export const LLM_CONFIGS = {
  DEFAULT: {
    model: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
    maxTokens: 500
  },
  CREATIVE: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 600
  },
  PRECISE: {
    model: 'gpt-4',
    temperature: 0.1,
    maxTokens: 300
  },
  FAST: {
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 400
  }
};

/**
 * Conversation timeouts (in milliseconds)
 */
export const CONVERSATION_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_HISTORY_MESSAGES: 20, // Keep last 20 messages in context
  MAX_PROPERTY_SUGGESTIONS: 5
};
