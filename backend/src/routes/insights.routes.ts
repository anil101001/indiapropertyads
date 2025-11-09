import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getOverview,
  getPropertiesTimeline,
  getInquiriesTimeline,
  getPropertyTypes,
  getTopLocations,
  getTopProperties,
  getUserRegistrations,
  getPropertiesByType,
  getPropertiesByLocation,
  getPropertiesByDateRange
} from '../controllers/insights.controller';

const router = Router();

// All insights routes are admin-only
router.use(authenticate, authorize('admin'));

// Overview statistics
router.get('/overview', getOverview);

// Timeline data
router.get('/properties-timeline', getPropertiesTimeline);
router.get('/inquiries-timeline', getInquiriesTimeline);
router.get('/user-registrations', getUserRegistrations);

// Distribution data
router.get('/property-types', getPropertyTypes);
router.get('/top-locations', getTopLocations);

// Top performers
router.get('/top-properties', getTopProperties);

// Drill-down endpoints
router.get('/properties/by-type/:type', getPropertiesByType);
router.get('/properties/by-location', getPropertiesByLocation);
router.get('/properties/by-date', getPropertiesByDateRange);

export default router;
