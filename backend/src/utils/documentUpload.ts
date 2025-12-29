import { s3, S3_BUCKET } from '../config/aws';
import logger from './logger';
import crypto from 'crypto';
import path from 'path';

export interface UploadedDocument {
  url: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
}

// Document folder prefix in S3 (separate from property images)
const DOCUMENT_FOLDER = 'documents';

// Allowed document types
const ALLOWED_DOCUMENT_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  // Images (for ID proofs, etc.)
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// Max file size: 25MB for documents
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;

/**
 * Upload document to S3
 */
export const uploadDocumentToS3 = async (
  file: Express.Multer.File,
  subfolder?: string
): Promise<UploadedDocument> => {
  try {
    // Generate unique filename
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const randomString = crypto.randomBytes(16).toString('hex');
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    
    // Build path: documents/[subfolder]/timestamp-random-name.ext
    const folderPath = subfolder 
      ? `${DOCUMENT_FOLDER}/${subfolder}`
      : DOCUMENT_FOLDER;
    const filename = `${folderPath}/${Date.now()}-${randomString}-${sanitizedName}`;
    
    const params = {
      Bucket: S3_BUCKET,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: `inline; filename="${file.originalname}"`
    };
    
    const result = await s3.upload(params).promise();
    
    logger.info(`Document uploaded to S3: ${filename}`);
    
    return {
      url: result.Location,
      key: result.Key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      extension: fileExtension.replace('.', '')
    };
    
  } catch (error) {
    logger.error('S3 document upload error:', error);
    throw new Error('Failed to upload document to S3');
  }
};

/**
 * Upload multiple documents to S3
 */
export const uploadMultipleDocuments = async (
  files: Express.Multer.File[],
  subfolder?: string
): Promise<UploadedDocument[]> => {
  try {
    const uploadPromises = files.map(file => uploadDocumentToS3(file, subfolder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    logger.error('Multiple documents upload error:', error);
    throw new Error('Failed to upload documents to S3');
  }
};

/**
 * Delete document from S3
 */
export const deleteDocumentFromS3 = async (key: string): Promise<void> => {
  try {
    // Verify it's a document (security check)
    if (!key.startsWith(DOCUMENT_FOLDER)) {
      throw new Error('Invalid document key');
    }
    
    const params = {
      Bucket: S3_BUCKET,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    
    logger.info(`Document deleted from S3: ${key}`);
    
  } catch (error) {
    logger.error('S3 document delete error:', error);
    throw new Error('Failed to delete document from S3');
  }
};

/**
 * Delete multiple documents from S3
 */
export const deleteMultipleDocuments = async (keys: string[]): Promise<void> => {
  try {
    if (keys.length === 0) return;
    
    // Verify all are documents
    const validKeys = keys.filter(key => key.startsWith(DOCUMENT_FOLDER));
    if (validKeys.length === 0) return;
    
    const params = {
      Bucket: S3_BUCKET,
      Delete: {
        Objects: validKeys.map(key => ({ Key: key })),
        Quiet: false
      }
    };
    
    await s3.deleteObjects(params).promise();
    
    logger.info(`Deleted ${validKeys.length} documents from S3`);
    
  } catch (error) {
    logger.error('S3 multiple document delete error:', error);
    throw new Error('Failed to delete documents from S3');
  }
};

/**
 * Validate document file
 */
export const validateDocumentFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB limit` };
  }
  
  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, JPEG, PNG, WebP, GIF' 
    };
  }
  
  return { valid: true };
};

/**
 * Validate multiple document files
 */
export const validateDocumentFiles = (files: Express.Multer.File[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check number of files (max 20 for documents)
  if (files.length > 20) {
    errors.push('Maximum 20 documents allowed per upload');
  }
  
  // Validate each file
  files.forEach((file, index) => {
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      errors.push(`File ${index + 1} (${file.originalname}): ${validation.error}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get signed URL for private document access
 */
export const getSignedDocumentUrl = async (key: string, expiresInSeconds: number = 3600): Promise<string> => {
  try {
    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: expiresInSeconds
    };
    
    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    logger.error('S3 signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

/**
 * Get document type category from mime type
 */
export const getDocumentCategory = (mimeType: string): 'pdf' | 'word' | 'excel' | 'image' | 'text' | 'other' => {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === 'text/csv') return 'excel';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('text/')) return 'text';
  return 'other';
};
