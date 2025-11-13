import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Conversation from '../models/Conversation.model';
import { generateAIInsights } from '../services/ai-insights.service';
import logger from '../utils/logger';

/**
 * @route   GET /api/v1/analytics/conversations/overview
 * @desc    Get conversation analytics overview
 * @access  Private (Admin)
 */
export const getConversationOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);
    
    const query = Object.keys(dateFilter).length > 0 ? { startedAt: dateFilter } : {};

    const [
      totalConversations,
      activeConversations,
      avgMessages,
      leadDistribution,
      conversionStats
    ] = await Promise.all([
      Conversation.countDocuments(query),
      Conversation.countDocuments({ ...query, isActive: true }),
      Conversation.aggregate([
        { $match: query },
        { $group: { _id: null, avg: { $avg: '$totalMessages' } } }
      ]),
      Conversation.aggregate([
        { $match: query },
        { $group: { _id: '$leadQuality', count: { $sum: 1 } } }
      ]),
      Conversation.aggregate([
        { $match: query },
        { $group: { _id: '$conversionStatus', count: { $sum: 1 } } }
      ])
    ]);

    const leadDist: any = {};
    leadDistribution.forEach((l: any) => leadDist[l._id || 'unknown'] = l.count);
    
    const conversionDist: any = {};
    conversionStats.forEach((c: any) => conversionDist[c._id] = c.count);
    
    const inquired = conversionDist.inquired || 0;
    const conversionRate = totalConversations > 0 ? (inquired / totalConversations) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalConversations,
        activeConversations,
        avgMessagesPerConversation: avgMessages[0]?.avg || 0,
        leadDistribution: {
          hot: leadDist.hot || 0,
          warm: leadDist.warm || 0,
          cold: leadDist.cold || 0
        },
        conversionRate: Math.round(conversionRate * 10) / 10,
        conversionStatus: conversionDist
      }
    });
  } catch (error: any) {
    logger.error('Conversation overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation overview' });
  }
};

/**
 * @route   GET /api/v1/analytics/conversations/intents
 * @desc    Get user intents distribution
 * @access  Private (Admin)
 */
export const getIntentsDistribution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);
    
    const matchStage = Object.keys(dateFilter).length > 0 ? { startedAt: dateFilter } : {};

    const intents = await Conversation.aggregate([
      { $match: matchStage },
      { $unwind: '$userIntents' },
      { $group: { _id: '$userIntents', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: intents.map((i: any) => ({ intent: i._id, count: i.count }))
    });
  } catch (error: any) {
    logger.error('Intents distribution error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch intents' });
  }
};

/**
 * @route   GET /api/v1/analytics/conversations/locations
 * @desc    Get top requested locations
 * @access  Private (Admin)
 */
export const getTopLocations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);
    
    const matchStage = Object.keys(dateFilter).length > 0 ? { startedAt: dateFilter } : {};

    const locations = await Conversation.aggregate([
      { $match: matchStage },
      { $unwind: '$preferredLocations' },
      {
        $group: {
          _id: '$preferredLocations',
          count: { $sum: 1 },
          avgBudgetMax: { $avg: '$budgetRange.max' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit as string) }
    ]);

    res.json({
      success: true,
      data: locations.map((l: any) => ({
        location: l._id,
        queries: l.count,
        avgBudget: l.avgBudgetMax || 0
      }))
    });
  } catch (error: any) {
    logger.error('Top locations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch locations' });
  }
};

/**
 * @route   GET /api/v1/analytics/conversations/budget-trends
 * @desc    Get budget distribution
 * @access  Private (Admin)
 */
export const getBudgetTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);
    
    const matchStage = Object.keys(dateFilter).length > 0 ? { startedAt: dateFilter } : {};

    const budgets = await Conversation.aggregate([
      { $match: { ...matchStage, 'budgetRange.max': { $exists: true } } },
      {
        $bucket: {
          groupBy: '$budgetRange.max',
          boundaries: [0, 5000000, 10000000, 20000000, 50000000, 100000000, Number.MAX_VALUE],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    const labels = ['< 50L', '50L-1Cr', '1Cr-2Cr', '2Cr-5Cr', '5Cr-10Cr', '10Cr+'];
    const distribution = budgets.map((b: any, idx: number) => ({
      range: labels[idx] || 'Other',
      count: b.count
    }));

    res.json({ success: true, data: distribution });
  } catch (error: any) {
    logger.error('Budget trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budget trends' });
  }
};

/**
 * @route   GET /api/v1/analytics/conversations/timeline
 * @desc    Get conversations timeline
 * @access  Private (Admin)
 */
export const getConversationsTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);
    
    const matchStage = Object.keys(dateFilter).length > 0 ? { startedAt: dateFilter } : {};

    const timeline = await Conversation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$startedAt' },
            month: { $month: '$startedAt' },
            day: { $dayOfMonth: '$startedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: timeline.map((t: any) => ({
        date: new Date(t._id.year, t._id.month - 1, t._id.day).toISOString().split('T')[0],
        count: t.count
      }))
    });
  } catch (error: any) {
    logger.error('Conversations timeline error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
  }
};

/**
 * @route   POST /api/v1/analytics/ai-insights
 * @desc    Generate AI-powered customer insights
 * @access  Private (Admin)
 */
export const generateCustomerInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '7days' } = req.body;
    
    logger.info(`🤖 AI insights requested for period: ${period}`);
    
    const insights = await generateAIInsights(period);
    
    res.json({
      success: true,
      data: insights
    });
    
  } catch (error: any) {
    logger.error('AI insights generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate AI insights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
