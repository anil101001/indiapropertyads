import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import { vectorizePropertySync, reVectorizeIfNeeded } from '../middleware/vectorization.middleware';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
  updatePropertyStatus,
  markPropertySold
} from '../controllers/property.controller';

const router = Router();

// Public routes (with optional auth to allow filtering by status for admins)
router.get('/', optionalAuthenticate, getProperties);
router.get('/:id', getPropertyById);

// Protected routes - require authentication
// Auto-vectorize new properties on creation
router.post('/', authenticate, authorize('owner', 'agent'), vectorizePropertySync, createProperty);
router.get('/my/properties', authenticate, getMyProperties);
// Re-vectorize if critical fields change on update
router.patch('/:id', authenticate, reVectorizeIfNeeded, updateProperty);
router.delete('/:id', authenticate, deleteProperty);
router.patch('/:id/mark-sold', authenticate, markPropertySold);

// Admin only routes
router.patch('/:id/status', authenticate, authorize('admin'), updatePropertyStatus);

export default router;
