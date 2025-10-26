import { s3, S3_BUCKET } from '../config/aws';
import logger from './logger';
import crypto from 'crypto';
import path from 'path';

export interface UploadedImage {
  url: string;
  key: string;
  size: number;
}

/**
 * Upload image to S3
 */
export const uploadImageToS3 = async (
  file: Express.Multer.File,
  folder: string = 'properties'
): Promise<UploadedImage> => {
  try {
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const randomString = crypto.randomBytes(16).toString('hex');
    const filename = `${folder}/${Date.now()}-${randomString}${fileExtension}`;
    
    const params = {
      Bucket: S3_BUCKET,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as const
    };
    
    const result = await s3.upload(params).promise();
    
    logger.info(`Image uploaded to S3: ${filename}`);
    
    return {
      url: result.Location,
      key: result.Key,
      size: file.size
    };
    
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw new Error('Failed to upload image to S3');
  }
};

/**
 * Upload multiple images to S3
 */
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string = 'properties'
): Promise<UploadedImage[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToS3(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    logger.error('Multiple images upload error:', error);
    throw new Error('Failed to upload images to S3');
  }
};

/**
 * Delete image from S3
 */
export const deleteImageFromS3 = async (key: string): Promise<void> => {
  try {
    const params = {
      Bucket: S3_BUCKET,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    
    logger.info(`Image deleted from S3: ${key}`);
    
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw new Error('Failed to delete image from S3');
  }
};

/**
 * Delete multiple images from S3
 */
export const deleteMultipleImages = async (keys: string[]): Promise<void> => {
  try {
    if (keys.length === 0) return;
    
    const params = {
      Bucket: S3_BUCKET,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false
      }
    };
    
    await s3.deleteObjects(params).promise();
    
    logger.info(`Deleted ${keys.length} images from S3`);
    
  } catch (error) {
    logger.error('S3 multiple delete error:', error);
    throw new Error('Failed to delete images from S3');
  }
};

/**
 * Validate image file
 */
export const validateImageFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  return { valid: true };
};

/**
 * Validate multiple image files
 */
export const validateImageFiles = (files: Express.Multer.File[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check number of files (max 10)
  if (files.length > 10) {
    errors.push('Maximum 10 images allowed');
  }
  
  // Validate each file
  files.forEach((file, index) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      errors.push(`File ${index + 1}: ${validation.error}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};
