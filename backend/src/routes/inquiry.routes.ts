import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createInquiry,
  getMyInquiries,
  getReceivedInquiries,
  getInquiry,
  updateInquiry,
  deleteInquiry
} from '../controllers/inquiry.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create inquiry (buyers)
router.post('/', createInquiry);

// Get my inquiries (buyer's sent inquiries)
router.get('/my-inquiries', getMyInquiries);

// Get received inquiries (owner/agent)
router.get('/received', getReceivedInquiries);

// Single inquiry operations
router.get('/:id', getInquiry);
router.patch('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

export default router;
