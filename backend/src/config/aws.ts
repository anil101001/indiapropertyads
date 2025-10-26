import AWS from 'aws-sdk';
import logger from '../utils/logger';

// Configure AWS SDK
const configureAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-south-1'
  });
};

// Initialize S3
configureAWS();

export const s3 = new AWS.S3();

export const S3_BUCKET = process.env.AWS_S3_BUCKET || 'india-property-ads';

// Validate AWS configuration
export const validateAWSConfig = (): boolean => {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.warn(`Missing AWS configuration: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

export default s3;
