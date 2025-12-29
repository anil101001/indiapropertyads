import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadSingleDocument, handleDocumentUploadError } from '../middleware/documentUpload.middleware';
import {
  // Document controllers
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  uploadNewVersion,
  deleteDocument,
  shareDocument,
  getProjectDocuments,
  getUnitDocuments,
  // Template controllers
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  generateFromTemplate,
  previewTemplate
} from '../controllers/document.controller';

const router = Router();

// ============== DOCUMENT ROUTES ==============

// Document CRUD - with file upload support
router.post(
  '/',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  uploadSingleDocument,
  handleDocumentUploadError,
  uploadDocument
);

router.get(
  '/',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getDocuments
);

router.get(
  '/:documentId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getDocument
);

router.put(
  '/:documentId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  updateDocument
);

router.post(
  '/:documentId/version',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  uploadSingleDocument,
  handleDocumentUploadError,
  uploadNewVersion
);

router.delete(
  '/:documentId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  deleteDocument
);

router.post(
  '/:documentId/share',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  shareDocument
);

// Project/Unit specific documents
router.get(
  '/project/:projectId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getProjectDocuments
);

router.get(
  '/unit/:unitId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getUnitDocuments
);

// ============== TEMPLATE ROUTES ==============

router.post(
  '/templates',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  createTemplate
);

router.get(
  '/templates',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getTemplates
);

router.get(
  '/templates/:templateId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getTemplate
);

router.put(
  '/templates/:templateId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  updateTemplate
);

router.delete(
  '/templates/:templateId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  deleteTemplate
);

router.post(
  '/templates/:templateId/generate',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  generateFromTemplate
);

router.post(
  '/templates/:templateId/preview',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  previewTemplate
);

export default router;
