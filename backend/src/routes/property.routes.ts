import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
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
router.post('/', authenticate, authorize('owner', 'agent'), createProperty);
router.get('/my/properties', authenticate, getMyProperties);
router.patch('/:id', authenticate, updateProperty);
router.delete('/:id', authenticate, deleteProperty);
router.patch('/:id/mark-sold', authenticate, markPropertySold);

// Admin only routes
router.patch('/:id/status', authenticate, authorize('admin'), updatePropertyStatus);

export default router;
