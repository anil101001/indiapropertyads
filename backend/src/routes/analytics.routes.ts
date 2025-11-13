import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router = express.Router();

// All analytics routes require admin role
router.use(authenticate, authorize('admin'));

// Conversation analytics
router.get('/conversations/overview', analyticsController.getConversationOverview);
router.get('/conversations/intents', analyticsController.getIntentsDistribution);
router.get('/conversations/locations', analyticsController.getTopLocations);
router.get('/conversations/budget-trends', analyticsController.getBudgetTrends);
router.get('/conversations/timeline', analyticsController.getConversationsTimeline);

// AI-powered insights
router.post('/ai-insights', analyticsController.generateCustomerInsights);

export default router;
