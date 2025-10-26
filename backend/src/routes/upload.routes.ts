import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { uploadMultiple, uploadSingle, handleMulterError } from '../middleware/upload.middleware';
import { uploadImages, uploadSingleImage } from '../controllers/upload.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload multiple images (max 10)
router.post('/images', uploadMultiple, handleMulterError, uploadImages);

// Upload single image
router.post('/image', uploadSingle, handleMulterError, uploadSingleImage);

export default router;
