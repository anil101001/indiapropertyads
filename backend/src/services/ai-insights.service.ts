import Conversation from '../models/Conversation.model';
import OpenAI from 'openai';
import logger from '../utils/logger';

// OpenAI client
let openaiClient: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-development'
    });
  }
  return openaiClient;
};

interface AIInsightsResult {
  summary: string;
  topActions: string[];
  metrics: {
    conversations: number;
    hotLeads: number;
    conversionRate: number;
  };
  revenueOpportunity: string;
  redFlags: string[];
  insights: {
    topIntent: string;
    topLocation: string;
    budgetSweet: string;
    conversionTrigger: string;
  };
  generatedAt: Date;
}

// Cache for insights (1 hour TTL)
const insightsCache = new Map<string, { data: AIInsightsResult; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Generate AI-powered customer insights
 */
export async function generateAIInsights(period: string): Promise<AIInsightsResult> {
  const startTime = Date.now();
  
  // Check cache
  const cacheKey = `insights-${period}`;
  const cached = insightsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.info('⚡ Returning cached AI insights');
    return cached.data;
  }

  try {
    logger.info(`🤖 Generating AI insights for period: ${period}`);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Fetch conversations
    const conversations = await Conversation.find({
      startedAt: { $gte: startDate, $lte: endDate }
    })
      .select('messages userIntents preferredLocations budgetRange leadQuality conversionStatus totalMessages propertiesViewed')
      .limit(100)
      .lean();

    if (conversations.length === 0) {
      return {
        summary: 'No customer conversations found for this period. Start engaging with customers to see insights!',
        topActions: [
          'Promote your chatbot to visitors',
          'Add chat widget to high-traffic pages',
          'Share chatbot link on social media'
        ],
        metrics: {
          conversations: 0,
          hotLeads: 0,
          conversionRate: 0
        },
        revenueOpportunity: '₹0',
        redFlags: ['No customer engagement data available'],
        insights: {
          topIntent: 'N/A',
          topLocation: 'N/A',
          budgetSweet: 'N/A',
          conversionTrigger: 'N/A'
        },
        generatedAt: new Date()
      };
    }

    // Prepare data summary for GPT
    const conversationData = conversations.map((conv: any) => {
      const userMessages = conv.messages
        ?.filter((m: any) => m.role === 'user')
        .map((m: any) => m.content)
        .slice(0, 3) // First 3 messages
        .join(' | ') || 'No messages';

      return {
        messages: conv.totalMessages || 0,
        userQueries: userMessages.substring(0, 200), // Limit length
        intents: conv.userIntents || [],
        locations: conv.preferredLocations || [],
        budget: conv.budgetRange ? `₹${(conv.budgetRange.min || 0) / 100000}L - ₹${(conv.budgetRange.max || 0) / 100000}L` : 'Not specified',
        leadQuality: conv.leadQuality || 'unknown',
        converted: conv.conversionStatus === 'inquired' || conv.conversionStatus === 'scheduled_visit',
        propertiesViewed: (conv.propertiesViewed || []).length
      };
    });

    // Calculate basic metrics
    const hotLeads = conversations.filter((c: any) => c.leadQuality === 'hot').length;
    const inquired = conversations.filter((c: any) => 
      c.conversionStatus === 'inquired' || c.conversionStatus === 'scheduled_visit'
    ).length;
    const conversionRate = conversations.length > 0 
      ? Math.round((inquired / conversations.length) * 100) 
      : 0;

    // Create GPT prompt
    const prompt = `You are a business intelligence analyst for a real estate marketplace.

Analyze these ${conversations.length} customer conversations from the last ${period}:

CONVERSATION DATA:
${JSON.stringify(conversationData.slice(0, 50), null, 2)}

METRICS:
- Total Conversations: ${conversations.length}
- Hot Leads: ${hotLeads}
- Inquiries: ${inquired}
- Conversion Rate: ${conversionRate}%

Provide actionable business intelligence in this EXACT JSON format:
{
  "summary": "2-3 sentences in plain English about what customers want right now and the main trends",
  "topActions": [
    "Specific, actionable step 1 that will increase conversions today",
    "Specific, actionable step 2 that addresses a pain point", 
    "Specific, actionable step 3 for immediate business impact"
  ],
  "revenueOpportunity": "₹X Cr or ₹X L (realistic estimate based on hot leads × average property value of ₹1.5 Cr)",
  "redFlags": [
    "Critical issue 1 that's hurting the business (be specific)",
    "Critical issue 2 based on data patterns"
  ],
  "insights": {
    "topIntent": "Most common customer intent/need",
    "topLocation": "Most requested city/area",
    "budgetSweet": "Most common budget range",
    "conversionTrigger": "What makes customers inquire (based on patterns)"
  }
}

Focus on:
1. What customers want RIGHT NOW (not generic)
2. SPECIFIC actions for TODAY
3. Revenue we're leaving on table
4. Problems costing us money

Be direct, actionable, and business-focused. Use Indian rupee format (Cr for crores, L for lakhs).`;

    // Call GPT-4
    logger.info('📤 Sending data to GPT-4 for analysis...');
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency
      messages: [
        { 
          role: 'system', 
          content: 'You are a data analyst expert in real estate customer behavior and business intelligence. Provide actionable insights in JSON format.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1500
    });

    const gptResult = JSON.parse(response.choices[0].message.content || '{}');
    
    const result: AIInsightsResult = {
      summary: gptResult.summary || 'Analysis completed',
      topActions: gptResult.topActions || [],
      metrics: {
        conversations: conversations.length,
        hotLeads,
        conversionRate
      },
      revenueOpportunity: gptResult.revenueOpportunity || '₹0',
      redFlags: gptResult.redFlags || [],
      insights: gptResult.insights || {
        topIntent: 'N/A',
        topLocation: 'N/A',
        budgetSweet: 'N/A',
        conversionTrigger: 'N/A'
      },
      generatedAt: new Date()
    };

    // Cache the result
    insightsCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    const duration = Date.now() - startTime;
    logger.info(`✅ AI insights generated in ${duration}ms`);
    logger.info(`   Analyzed: ${conversations.length} conversations`);
    logger.info(`   Hot Leads: ${hotLeads}`);
    logger.info(`   Conversion: ${conversionRate}%`);

    return result;

  } catch (error: any) {
    logger.error('❌ AI insights generation failed:', error);
    
    // Return fallback insights
    return {
      summary: 'Unable to generate AI insights at this time. Please try again later.',
      topActions: [
        'Check system logs for errors',
        'Verify OpenAI API key is configured',
        'Ensure conversations are being saved to database'
      ],
      metrics: {
        conversations: 0,
        hotLeads: 0,
        conversionRate: 0
      },
      revenueOpportunity: '₹0',
      redFlags: [`AI analysis error: ${error.message}`],
      insights: {
        topIntent: 'Error',
        topLocation: 'Error',
        budgetSweet: 'Error',
        conversionTrigger: 'Error'
      },
      generatedAt: new Date()
    };
  }
}

/**
 * Clear insights cache (useful for testing)
 */
export function clearInsightsCache(): void {
  insightsCache.clear();
  logger.info('🗑️ Insights cache cleared');
}
