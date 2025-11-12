import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/india-property-ads';
    
    // Log connection type (hide credentials)
    const connectionType = mongoURI.includes('mongodb+srv://') ? 'MongoDB Atlas' : 
                          mongoURI.includes('.docdb.amazonaws.com') ? 'AWS DocumentDB' :
                          mongoURI.includes('localhost') ? 'Local MongoDB' : 'Unknown';
    logger.info(`🔗 Connecting to ${connectionType}...`);
    
    await mongoose.connect(mongoURI);
    
    logger.info('✅ MongoDB connected successfully');
    logger.info(`📦 Database: ${mongoose.connection.name}`);
    logger.info(`🌍 Host: ${mongoose.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};
