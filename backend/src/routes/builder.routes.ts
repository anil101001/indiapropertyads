import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  registerBuilder,
  getMyBuilderProfile,
  updateBuilderProfile,
  getBuilders,
  getBuilderById,
  addTeamMember,
  removeTeamMember,
  getPendingBuilders,
  verifyBuilder
} from '../controllers/builder.controller';

const router = express.Router();

// Public routes
router.get('/', getBuilders);
router.get('/:id', getBuilderById);

// Protected routes - Builder
router.post('/register', authenticate, registerBuilder);
router.get('/me/profile', authenticate, getMyBuilderProfile);
router.patch('/me/profile', authenticate, updateBuilderProfile);
router.post('/me/team', authenticate, addTeamMember);
router.delete('/me/team/:userId', authenticate, removeTeamMember);

// Admin routes
router.get('/admin/pending', authenticate, authorize('admin'), getPendingBuilders);
router.patch('/admin/:id/verify', authenticate, authorize('admin'), verifyBuilder);

export default router;
