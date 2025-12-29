import express from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import {
  createProject,
  getProjects,
  getProjectByIdOrSlug,
  getMyProjects,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getPendingProjects,
  approveProject,
  featureProject,
  submitProjectInquiry
} from '../controllers/project.controller';

const router = express.Router();

// Public routes (with optional auth for visibility checks)
router.get('/', optionalAuthenticate, getProjects);
router.post('/:id/inquiry', optionalAuthenticate, submitProjectInquiry);
router.get('/:idOrSlug', optionalAuthenticate, getProjectByIdOrSlug);

// Protected routes - Builder
router.post('/', authenticate, createProject);
router.get('/builder/me', authenticate, getMyProjects);
router.patch('/:id', authenticate, updateProject);
router.patch('/:id/status', authenticate, updateProjectStatus);
router.delete('/:id', authenticate, deleteProject);

// Admin routes
router.get('/admin/pending', authenticate, authorize('admin'), getPendingProjects);
router.patch('/admin/:id/approve', authenticate, authorize('admin'), approveProject);
router.patch('/admin/:id/feature', authenticate, authorize('admin'), featureProject);

export default router;
