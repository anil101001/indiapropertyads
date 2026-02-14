import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getUserStats,
  listUsers,
  getUserDetail,
  updateUser,
  ensureSuperAdmin,
} from '../controllers/admin-users.controller';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// Dashboard stats
router.get('/users/stats', getUserStats);

// User management
router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id', updateUser);

// Super admin setup
router.post('/users/ensure-super-admin', ensureSuperAdmin);

export default router;
