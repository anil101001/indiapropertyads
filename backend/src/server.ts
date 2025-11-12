import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import propertyRoutes from './routes/property.routes';
import uploadRoutes from './routes/upload.routes';
import inquiryRoutes from './routes/inquiry.routes';
import insightsRoutes from './routes/insights.routes';
import { chatRoutes } from './ai-chat'; // AI Chat Module

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render (behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? true 
    : [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://indiapropertyads.netlify.app',
        'https://india-property-ads.netlify.app'
      ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter); // Rate limiting

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/properties`, propertyRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);
app.use(`${API_PREFIX}/inquiries`, inquiryRoutes);
app.use(`${API_PREFIX}/insights`, insightsRoutes);
app.use(`${API_PREFIX}/ai-chat`, chatRoutes); // AI Chat Module

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    // Connect to Database
    await connectDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📊 API available at http://localhost:${PORT}${API_PREFIX}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

export default app;
