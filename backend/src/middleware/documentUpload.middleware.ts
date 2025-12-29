import multer from 'multer';
import { Request } from 'express';

// Configure multer to use memory storage for documents
const storage = multer.memoryStorage();

// Allowed document MIME types
const allowedDocumentMimes = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  // Images (for ID proofs, scanned documents, etc.)
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// File filter function for documents
const documentFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedDocumentMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, JPEG, PNG, WebP, GIF'));
  }
};

// Create multer upload instance for documents
export const documentUpload = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 20 // Max 20 files at once
  }
});

// Middleware for single document upload
export const uploadSingleDocument = documentUpload.single('document');

// Middleware for multiple documents upload (max 20)
export const uploadMultipleDocuments = documentUpload.array('documents', 20);

// Error handling middleware for document upload
export const handleDocumentUploadError = (err: any, _req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 25MB limit'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Maximum 20 files allowed'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Document upload error'
    });
  }
  
  next();
};
