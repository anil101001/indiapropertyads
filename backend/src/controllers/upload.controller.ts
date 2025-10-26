import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadMultipleImages, validateImageFiles } from '../utils/imageUpload';
import logger from '../utils/logger';

// @route   POST /api/v1/upload/images
// @desc    Upload multiple images to S3
// @access  Private
export const uploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
      return;
    }
    
    // Validate files
    const validation = validateImageFiles(files);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: 'File validation failed',
        errors: validation.errors
      });
      return;
    }
    
    // Upload to S3
    const uploadedImages = await uploadMultipleImages(files, 'properties');
    
    // Format response
    const images = uploadedImages.map((img, index) => ({
      url: img.url,
      key: img.key,
      size: img.size,
      isCover: index === 0, // First image is cover by default
      order: index
    }));
    
    logger.info(`${files.length} images uploaded by ${req.user?.email}`);
    
    res.status(200).json({
      success: true,
      data: { images },
      message: `${files.length} image(s) uploaded successfully`
    });
    
  } catch (error: any) {
    logger.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   POST /api/v1/upload/image
// @desc    Upload single image to S3
// @access  Private
export const uploadSingleImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    
    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }
    
    // Upload to S3
    const { uploadImageToS3, validateImageFile } = await import('../utils/imageUpload');
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.error
      });
      return;
    }
    
    const uploadedImage = await uploadImageToS3(file, 'properties');
    
    logger.info(`Image uploaded by ${req.user?.email}`);
    
    res.status(200).json({
      success: true,
      data: {
        url: uploadedImage.url,
        key: uploadedImage.key,
        size: uploadedImage.size
      },
      message: 'Image uploaded successfully'
    });
    
  } catch (error: any) {
    logger.error('Upload single image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
