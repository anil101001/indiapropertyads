import { Router } from 'express';
import {
  register,
  verifyEmail,
  resendOTP,
  login,
  refreshToken,
  forgotPassword,
  logout
} from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', authRateLimiter, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authRateLimiter, forgotPassword);

// Protected routes
router.post('/logout', authenticate, logout);

export default router;
