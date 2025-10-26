import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getProfile, updateProfile } from '../controllers/user.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/me', getProfile);
router.patch('/me', updateProfile);

export default router;
