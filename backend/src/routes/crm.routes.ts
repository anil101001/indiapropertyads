import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getLeads,
  getLeadDetails,
  updateLead,
  updateLeadStatus,
  addActivity,
  getActivities,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getDashboardStats
} from '../controllers/crm.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Leads
router.get('/leads', getLeads);
router.get('/leads/:id', getLeadDetails);
router.patch('/leads/:id', updateLead);
router.patch('/leads/:id/status', updateLeadStatus);

// Activities
router.get('/leads/:id/activities', getActivities);
router.post('/leads/:id/activities', addActivity);

// Tasks (lead-specific)
router.post('/leads/:id/tasks', createTask);

// Tasks (global)
router.get('/tasks', getTasks);
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;
