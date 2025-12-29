import { Response } from 'express';
import mongoose from 'mongoose';
import DocumentModel from '../models/Document.model';
import DocumentTemplate from '../models/DocumentTemplate.model';
import Project from '../models/Project.model';
import Unit from '../models/Unit.model';
import Builder from '../models/Builder.model';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';
import { 
  uploadDocumentToS3, 
  validateDocumentFile, 
  deleteDocumentFromS3 
} from '../utils/documentUpload';

// ============== DOCUMENT CONTROLLERS ==============

// Upload a document (with file)
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const file = req.file;
    
    // Parse metadata from body (sent as JSON string or form fields)
    let metadata: any = {};
    if (req.body.metadata) {
      try {
        metadata = JSON.parse(req.body.metadata);
      } catch {
        metadata = req.body;
      }
    } else {
      metadata = req.body;
    }
    
    const {
      name, description, documentType, projectId, unitId, bookingId,
      customer, tags
    } = metadata;

    // Get builder
    const builder = await Builder.findOne({ user: userId });
    if (!builder) {
      res.status(403).json({ success: false, message: 'Builder profile required' });
      return;
    }

    // Handle file upload to S3
    if (file) {
      // Validate file
      const validation = validateDocumentFile(file);
      if (!validation.valid) {
        res.status(400).json({ success: false, message: validation.error });
        return;
      }
      
      // Upload to S3 with builder-specific subfolder
      const subfolder = `builder-${builder._id}`;
      const uploadedFile = await uploadDocumentToS3(file, subfolder);
      
      const document = await DocumentModel.create({
        builder: builder._id,
        project: projectId,
        unit: unitId,
        booking: bookingId,
        customer: customer ? (typeof customer === 'string' ? JSON.parse(customer) : customer) : undefined,
        name: name || uploadedFile.originalName,
        description,
        documentType: documentType || 'other',
        category: 'uploaded',
        file: uploadedFile,
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags) : [],
        uploadedBy: userId,
        status: 'active'
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document
      });
    } else {
      // No file - check if file data was provided in body (for pre-uploaded files)
      const { file: fileData } = metadata;
      
      if (!fileData || !fileData.url || !fileData.key) {
        res.status(400).json({ success: false, message: 'File is required' });
        return;
      }

      const document = await DocumentModel.create({
        builder: builder._id,
        project: projectId,
        unit: unitId,
        booking: bookingId,
        customer,
        name: name || fileData.originalName,
        description,
        documentType: documentType || 'other',
        category: 'uploaded',
        file: {
          url: fileData.url,
          key: fileData.key,
          originalName: fileData.originalName || name,
          mimeType: fileData.mimeType || 'application/octet-stream',
          size: fileData.size || 0,
          extension: fileData.extension || fileData.originalName?.split('.').pop() || ''
        },
        tags: tags || [],
        uploadedBy: userId,
        status: 'active'
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document
      });
    }
  } catch (error: any) {
    logger.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document'
    });
  }
};

// Get documents for builder
export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      projectId, unitId, documentType, category, status,
      search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    const builder = await Builder.findOne({ user: userId });
    if (!builder) {
      res.status(403).json({ success: false, message: 'Builder profile required' });
      return;
    }

    const query: any = { builder: builder._id, isActive: true };
    
    if (projectId) query.project = projectId;
    if (unitId) query.unit = unitId;
    if (documentType) query.documentType = documentType;
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .populate('project', 'name')
        .populate('unit', 'unitNumber')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      DocumentModel.countDocuments(query)
    ]);

    // Get document type counts
    const typeCounts = await DocumentModel.aggregate([
      { $match: { builder: builder._id, isActive: true } },
      { $group: { _id: '$documentType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        documents,
        typeCounts: typeCounts.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch documents'
    });
  }
};

// Get single document
export const getDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;

    const document = await DocumentModel.findById(documentId)
      .populate('project', 'name location')
      .populate('unit', 'unitNumber floor unitType')
      .populate('uploadedBy', 'profile.name email');

    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || document.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    // Record access
    await (document as any).recordAccess();

    res.json({
      success: true,
      data: document
    });
  } catch (error: any) {
    logger.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch document'
    });
  }
};

// Update document
export const updateDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;
    const updates = req.body;

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || document.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    // Don't allow changing certain fields
    delete updates.builder;
    delete updates.uploadedBy;
    delete updates.file;
    delete updates.version;
    delete updates.previousVersions;

    const updatedDocument = await DocumentModel.findByIdAndUpdate(
      documentId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDocument
    });
  } catch (error: any) {
    logger.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update document'
    });
  }
};

// Upload new version
export const uploadNewVersion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;
    const file = req.file;
    const { changeNote } = req.body;

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || document.builder.toString() !== (builder._id as any).toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (file) {
      // Validate and upload new file
      const validation = validateDocumentFile(file);
      if (!validation.valid) {
        res.status(400).json({ success: false, message: validation.error });
        return;
      }
      
      const subfolder = `builder-${builder._id}`;
      const uploadedFile = await uploadDocumentToS3(file, subfolder);
      
      await (document as any).addVersion(
        uploadedFile,
        new mongoose.Types.ObjectId(userId),
        changeNote
      );
    } else {
      // Check for pre-uploaded file data in body
      const fileData = req.body.file ? (typeof req.body.file === 'string' ? JSON.parse(req.body.file) : req.body.file) : null;
      
      if (!fileData || !fileData.url || !fileData.key) {
        res.status(400).json({ success: false, message: 'File is required' });
        return;
      }

      await (document as any).addVersion(
        {
          url: fileData.url,
          key: fileData.key,
          originalName: fileData.originalName || document.file.originalName,
          mimeType: fileData.mimeType || document.file.mimeType,
          size: fileData.size || 0,
          extension: fileData.extension || fileData.originalName?.split('.').pop() || document.file.extension
        },
        new mongoose.Types.ObjectId(userId),
        changeNote
      );
    }

    res.json({
      success: true,
      message: `Document updated to version ${document.version}`,
      data: document
    });
  } catch (error: any) {
    logger.error('Upload new version error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload new version'
    });
  }
};

// Delete document (soft delete, optionally hard delete from S3)
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;
    const { hardDelete } = req.query; // ?hardDelete=true to also delete from S3

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || document.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    // Hard delete: also remove from S3
    if (hardDelete === 'true') {
      try {
        await deleteDocumentFromS3(document.file.key);
        // Also delete previous versions from S3
        for (const version of document.previousVersions) {
          if (version.file?.key) {
            await deleteDocumentFromS3(version.file.key);
          }
        }
      } catch (s3Error) {
        logger.warn('Failed to delete document from S3:', s3Error);
        // Continue with soft delete even if S3 delete fails
      }
    }

    document.status = 'deleted';
    document.isActive = false;
    await document.save();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete document'
    });
  }
};

// Share document
export const shareDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;
    const { email, accessType, expiresInDays } = req.body;

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || document.builder.toString() !== (builder._id as any).toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    await (document as any).shareWith(email, accessType, expiresInDays);

    res.json({
      success: true,
      message: `Document shared with ${email}`,
      data: document.access.sharedWith
    });
  } catch (error: any) {
    logger.error('Share document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to share document'
    });
  }
};

// Get documents for a project
export const getProjectDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { documentType } = req.query;

    const query: any = { project: projectId, isActive: true, status: 'active' };
    if (documentType) query.documentType = documentType;

    const documents = await DocumentModel.find(query)
      .select('name documentType file.extension file.size createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error: any) {
    logger.error('Get project documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch documents'
    });
  }
};

// Get documents for a unit
export const getUnitDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { unitId } = req.params;
    const { documentType } = req.query;

    const query: any = { unit: unitId, isActive: true, status: 'active' };
    if (documentType) query.documentType = documentType;

    const documents = await DocumentModel.find(query)
      .select('name documentType customer file.extension file.size createdAt signature.status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error: any) {
    logger.error('Get unit documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch documents'
    });
  }
};

// ============== TEMPLATE CONTROLLERS ==============

// Create template
export const createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const builder = await Builder.findOne({ user: userId });
    if (!builder) {
      res.status(403).json({ success: false, message: 'Builder profile required' });
      return;
    }

    const template = await DocumentTemplate.create({
      ...req.body,
      builder: builder._id
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error: any) {
    logger.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create template'
    });
  }
};

// Get templates
export const getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { templateType, category } = req.query;

    const builder = await Builder.findOne({ user: userId });
    if (!builder) {
      res.status(403).json({ success: false, message: 'Builder profile required' });
      return;
    }

    const query: any = { builder: builder._id, isActive: true };
    if (templateType) query.templateType = templateType;
    if (category) query.category = category;

    const templates = await DocumentTemplate.find(query)
      .select('name description templateType category isDefault stats createdAt')
      .sort({ isDefault: -1, 'stats.timesUsed': -1 });

    res.json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    logger.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch templates'
    });
  }
};

// Get single template
export const getTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.userId;

    const template = await DocumentTemplate.findById(templateId);
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || template.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    logger.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch template'
    });
  }
};

// Update template
export const updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.userId;

    const template = await DocumentTemplate.findById(templateId);
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || template.builder.toString() !== (builder._id as any).toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    delete req.body.builder;
    delete req.body.stats;

    const updatedTemplate = await DocumentTemplate.findByIdAndUpdate(
      templateId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: updatedTemplate
    });
  } catch (error: any) {
    logger.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update template'
    });
  }
};

// Delete template
export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.userId;

    const template = await DocumentTemplate.findById(templateId);
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || template.builder.toString() !== (builder._id as any).toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    template.isActive = false;
    await template.save();

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete template'
    });
  }
};

// Generate document from template
export const generateFromTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.userId;
    const { variables, projectId, unitId } = req.body;

    const template = await DocumentTemplate.findById(templateId);
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || template.builder.toString() !== (builder._id as any).toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Auto-populate variables from sources if not provided
    const populatedVariables = { ...variables };
    
    for (const variable of template.variables) {
      if (populatedVariables[variable.name] === undefined && variable.source && variable.sourcePath) {
        try {
          let sourceDoc: any = null;
          
          switch (variable.source) {
            case 'project':
              if (projectId) sourceDoc = await Project.findById(projectId);
              break;
            case 'unit':
              if (unitId) sourceDoc = await Unit.findById(unitId);
              break;
            case 'builder':
              sourceDoc = builder;
              break;
          }
          
          if (sourceDoc) {
            const pathParts = variable.sourcePath.split('.');
            let value = sourceDoc;
            for (const part of pathParts) {
              value = value?.[part];
            }
            if (value !== undefined) {
              populatedVariables[variable.name] = value;
            }
          }
        } catch (e) {
          // Ignore errors in auto-population
        }
      }
    }

    // Generate HTML content
    const htmlContent = (template as any).getFullHtml(populatedVariables);

    // Record template usage
    await (template as any).recordUsage();

    // For now, return the HTML content
    // In production, this would generate a PDF and upload it
    res.json({
      success: true,
      message: 'Document generated successfully',
      data: {
        html: htmlContent,
        template: {
          _id: template._id,
          name: template.name,
          templateType: template.templateType
        },
        variables: populatedVariables,
        // In production, this would include the generated PDF URL
        // file: { url: '...', key: '...' }
      }
    });
  } catch (error: any) {
    logger.error('Generate from template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate document'
    });
  }
};

// Preview template with sample data
export const previewTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const { variables } = req.body;

    const template = await DocumentTemplate.findById(templateId);
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    // Use provided variables or generate sample data
    const sampleVariables: Record<string, any> = { ...variables };
    
    for (const variable of template.variables) {
      if (sampleVariables[variable.name] === undefined) {
        switch (variable.type) {
          case 'text':
            sampleVariables[variable.name] = variable.defaultValue || `[${variable.label}]`;
            break;
          case 'number':
            sampleVariables[variable.name] = variable.defaultValue || '0';
            break;
          case 'currency':
            sampleVariables[variable.name] = variable.defaultValue || 5000000;
            break;
          case 'date':
            sampleVariables[variable.name] = variable.defaultValue || new Date().toISOString();
            break;
          case 'address':
            sampleVariables[variable.name] = variable.defaultValue || '[Address]';
            break;
          default:
            sampleVariables[variable.name] = variable.defaultValue || `[${variable.label}]`;
        }
      }
    }

    const htmlContent = (template as any).getFullHtml(sampleVariables);

    res.json({
      success: true,
      data: {
        html: htmlContent,
        variables: sampleVariables
      }
    });
  } catch (error: any) {
    logger.error('Preview template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to preview template'
    });
  }
};
