import mongoose, { Document, Schema } from 'mongoose';

// Document model for storing uploaded documents and generated documents

export interface IDocument extends Document {
  // Ownership
  builder: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  unit?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  
  // Document Info
  name: string;
  description?: string;
  documentType: 
    | 'agreement' 
    | 'booking-form' 
    | 'receipt' 
    | 'invoice'
    | 'allotment-letter'
    | 'possession-letter'
    | 'noc'
    | 'id-proof'
    | 'address-proof'
    | 'pan-card'
    | 'aadhar'
    | 'passport'
    | 'bank-statement'
    | 'salary-slip'
    | 'itr'
    | 'property-document'
    | 'legal-document'
    | 'brochure'
    | 'floor-plan'
    | 'other';
  
  category: 'generated' | 'uploaded' | 'template-based';
  
  // File Info
  file: {
    url: string;
    key: string; // S3/Cloudinary key
    originalName: string;
    mimeType: string;
    size: number; // in bytes
    extension: string;
  };
  
  // Template Info (if generated from template)
  template?: {
    templateId: mongoose.Types.ObjectId;
    templateName: string;
    generatedAt: Date;
    variables: Record<string, any>; // Variables used to generate
  };
  
  // Version Control
  version: number;
  previousVersions: {
    version: number;
    file: {
      url: string;
      key: string;
    };
    updatedAt: Date;
    updatedBy: mongoose.Types.ObjectId;
    changeNote?: string;
  }[];
  
  // E-Signature
  signature?: {
    required: boolean;
    status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined' | 'expired';
    signers: {
      name: string;
      email: string;
      phone?: string;
      role: 'buyer' | 'co-buyer' | 'witness' | 'builder' | 'agent';
      signedAt?: Date;
      signatureUrl?: string;
      ipAddress?: string;
    }[];
    sentAt?: Date;
    expiresAt?: Date;
    signedDocumentUrl?: string;
    signedDocumentKey?: string;
  };
  
  // Access Control
  access: {
    isPublic: boolean;
    sharedWith: {
      email: string;
      accessType: 'view' | 'download';
      sharedAt: Date;
      expiresAt?: Date;
    }[];
    password?: string; // Optional password protection
  };
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
  
  // Audit
  uploadedBy: mongoose.Types.ObjectId;
  lastAccessedAt?: Date;
  accessCount: number;
  
  // Status
  status: 'draft' | 'active' | 'archived' | 'deleted';
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  builder: {
    type: Schema.Types.ObjectId,
    ref: 'Builder',
    required: true,
    index: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    index: true
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    index: true
  },
  customer: {
    name: String,
    phone: String,
    email: String
  },
  
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    maxlength: 1000
  },
  documentType: {
    type: String,
    enum: [
      'agreement', 'booking-form', 'receipt', 'invoice',
      'allotment-letter', 'possession-letter', 'noc',
      'id-proof', 'address-proof', 'pan-card', 'aadhar', 'passport',
      'bank-statement', 'salary-slip', 'itr',
      'property-document', 'legal-document', 'brochure', 'floor-plan', 'other'
    ],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['generated', 'uploaded', 'template-based'],
    default: 'uploaded'
  },
  
  file: {
    url: { type: String, required: true },
    key: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    extension: { type: String, required: true }
  },
  
  template: {
    templateId: { type: Schema.Types.ObjectId, ref: 'DocumentTemplate' },
    templateName: String,
    generatedAt: Date,
    variables: Schema.Types.Mixed
  },
  
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    file: {
      url: String,
      key: String
    },
    updatedAt: Date,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    changeNote: String
  }],
  
  signature: {
    required: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'sent', 'viewed', 'signed', 'declined', 'expired'],
      default: 'pending'
    },
    signers: [{
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      role: {
        type: String,
        enum: ['buyer', 'co-buyer', 'witness', 'builder', 'agent'],
        default: 'buyer'
      },
      signedAt: Date,
      signatureUrl: String,
      ipAddress: String
    }],
    sentAt: Date,
    expiresAt: Date,
    signedDocumentUrl: String,
    signedDocumentKey: String
  },
  
  access: {
    isPublic: { type: Boolean, default: false },
    sharedWith: [{
      email: String,
      accessType: { type: String, enum: ['view', 'download'], default: 'view' },
      sharedAt: { type: Date, default: Date.now },
      expiresAt: Date
    }],
    password: String
  },
  
  tags: [{ type: String, trim: true }],
  metadata: { type: Schema.Types.Mixed, default: {} },
  
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastAccessedAt: Date,
  accessCount: { type: Number, default: 0 },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'deleted'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
DocumentSchema.index({ builder: 1, documentType: 1, status: 1 });
DocumentSchema.index({ project: 1, documentType: 1 });
DocumentSchema.index({ unit: 1, documentType: 1 });
DocumentSchema.index({ 'customer.phone': 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ createdAt: -1 });
DocumentSchema.index({ 'signature.status': 1 });

// Virtual: File size in human readable format
DocumentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.file.size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
});

// Virtual: Is signed
DocumentSchema.virtual('isSigned').get(function() {
  return this.signature?.status === 'signed';
});

// Method: Add new version
DocumentSchema.methods.addVersion = async function(
  newFileData: { url: string; key: string; originalName: string; mimeType: string; size: number; extension: string },
  userId: mongoose.Types.ObjectId,
  changeNote?: string
) {
  // Save current version to history
  this.previousVersions.push({
    version: this.version,
    file: {
      url: this.file.url,
      key: this.file.key
    },
    updatedAt: new Date(),
    updatedBy: userId,
    changeNote
  });
  
  // Update to new version
  this.version += 1;
  this.file = newFileData;
  
  return this.save();
};

// Method: Share document
DocumentSchema.methods.shareWith = async function(
  email: string,
  accessType: 'view' | 'download' = 'view',
  expiresInDays?: number
) {
  const existingShare = this.access.sharedWith.find((s: { email: string }) => s.email === email);
  
  if (existingShare) {
    existingShare.accessType = accessType;
    existingShare.sharedAt = new Date();
    if (expiresInDays) {
      existingShare.expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }
  } else {
    this.access.sharedWith.push({
      email,
      accessType,
      sharedAt: new Date(),
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined
    });
  }
  
  return this.save();
};

// Method: Record access
DocumentSchema.methods.recordAccess = async function() {
  this.lastAccessedAt = new Date();
  this.accessCount += 1;
  return this.save();
};

// Ensure virtuals are included in JSON
DocumentSchema.set('toJSON', { virtuals: true });
DocumentSchema.set('toObject', { virtuals: true });

export default mongoose.model<IDocument>('Document', DocumentSchema);
