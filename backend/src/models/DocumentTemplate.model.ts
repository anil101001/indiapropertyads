import mongoose, { Document, Schema } from 'mongoose';

// DocumentTemplate model for storing reusable document templates
// Templates can be used to generate agreements, receipts, letters, etc.

export interface IDocumentTemplate extends Document {
  builder: mongoose.Types.ObjectId;
  
  // Template Info
  name: string;
  description?: string;
  templateType: 
    | 'booking-agreement'
    | 'sale-agreement'
    | 'allotment-letter'
    | 'possession-letter'
    | 'payment-receipt'
    | 'demand-letter'
    | 'noc'
    | 'welcome-letter'
    | 'custom';
  
  category: 'legal' | 'financial' | 'communication' | 'other';
  
  // Template Content
  content: {
    format: 'html' | 'markdown' | 'pdf-template';
    body: string; // HTML/Markdown content with {{variables}}
    headerHtml?: string;
    footerHtml?: string;
    css?: string; // Custom CSS for styling
  };
  
  // Variables that can be used in the template
  variables: {
    name: string; // e.g., "buyerName", "unitNumber"
    label: string; // e.g., "Buyer Name", "Unit Number"
    type: 'text' | 'number' | 'date' | 'currency' | 'address' | 'list';
    required: boolean;
    defaultValue?: string;
    source?: 'project' | 'unit' | 'booking' | 'customer' | 'builder' | 'manual';
    sourcePath?: string; // e.g., "project.name", "unit.pricing.totalPrice"
  }[];
  
  // Page Settings
  pageSettings: {
    size: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  
  // Signature Configuration
  signatureConfig?: {
    requireSignature: boolean;
    signerRoles: ('buyer' | 'co-buyer' | 'witness' | 'builder' | 'agent')[];
    signaturePlaceholders: {
      role: string;
      label: string;
      x: number; // Position percentage from left
      y: number; // Position percentage from top
      page: number;
    }[];
  };
  
  // Watermark
  watermark?: {
    enabled: boolean;
    text?: string;
    imageUrl?: string;
    opacity: number;
  };
  
  // Usage Stats
  stats: {
    timesUsed: number;
    lastUsedAt?: Date;
  };
  
  // Status
  isDefault: boolean; // Is this the default template for its type
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const DocumentTemplateSchema = new Schema<IDocumentTemplate>({
  builder: {
    type: Schema.Types.ObjectId,
    ref: 'Builder',
    required: true,
    index: true
  },
  
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  templateType: {
    type: String,
    enum: [
      'booking-agreement', 'sale-agreement', 'allotment-letter',
      'possession-letter', 'payment-receipt', 'demand-letter',
      'noc', 'welcome-letter', 'custom'
    ],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['legal', 'financial', 'communication', 'other'],
    default: 'legal'
  },
  
  content: {
    format: {
      type: String,
      enum: ['html', 'markdown', 'pdf-template'],
      default: 'html'
    },
    body: {
      type: String,
      required: [true, 'Template body is required']
    },
    headerHtml: String,
    footerHtml: String,
    css: String
  },
  
  variables: [{
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'currency', 'address', 'list'],
      default: 'text'
    },
    required: { type: Boolean, default: false },
    defaultValue: String,
    source: {
      type: String,
      enum: ['project', 'unit', 'booking', 'customer', 'builder', 'manual']
    },
    sourcePath: String
  }],
  
  pageSettings: {
    size: { type: String, enum: ['A4', 'Letter', 'Legal'], default: 'A4' },
    orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' },
    margins: {
      top: { type: Number, default: 20 },
      right: { type: Number, default: 20 },
      bottom: { type: Number, default: 20 },
      left: { type: Number, default: 20 }
    }
  },
  
  signatureConfig: {
    requireSignature: { type: Boolean, default: false },
    signerRoles: [{
      type: String,
      enum: ['buyer', 'co-buyer', 'witness', 'builder', 'agent']
    }],
    signaturePlaceholders: [{
      role: String,
      label: String,
      x: Number,
      y: Number,
      page: { type: Number, default: 1 }
    }]
  },
  
  watermark: {
    enabled: { type: Boolean, default: false },
    text: String,
    imageUrl: String,
    opacity: { type: Number, default: 0.1, min: 0, max: 1 }
  },
  
  stats: {
    timesUsed: { type: Number, default: 0 },
    lastUsedAt: Date
  },
  
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
DocumentTemplateSchema.index({ builder: 1, templateType: 1, isActive: 1 });
DocumentTemplateSchema.index({ builder: 1, isDefault: 1 });

// Pre-save: Ensure only one default per type per builder
DocumentTemplateSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('DocumentTemplate').updateMany(
      {
        builder: this.builder,
        templateType: this.templateType,
        _id: { $ne: this._id }
      },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Method: Generate document from template
DocumentTemplateSchema.methods.generateContent = function(variables: Record<string, any>): string {
  let content = this.content.body;
  
  // Replace all variables in the template
  for (const variable of this.variables) {
    const value = variables[variable.name] || variable.defaultValue || '';
    const placeholder = new RegExp(`{{\\s*${variable.name}\\s*}}`, 'g');
    
    // Format value based on type
    let formattedValue = value;
    if (variable.type === 'currency' && typeof value === 'number') {
      formattedValue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(value);
    } else if (variable.type === 'date' && value) {
      formattedValue = new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
    
    content = content.replace(placeholder, String(formattedValue));
  }
  
  return content;
};

// Method: Get full HTML with header, footer, and CSS
DocumentTemplateSchema.methods.getFullHtml = function(variables: Record<string, any>): string {
  const bodyContent = this.generateContent(variables);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${this.pageSettings.size} ${this.pageSettings.orientation};
      margin: ${this.pageSettings.margins.top}mm ${this.pageSettings.margins.right}mm ${this.pageSettings.margins.bottom}mm ${this.pageSettings.margins.left}mm;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
    }
    ${this.content.css || ''}
  </style>
</head>
<body>
  ${this.content.headerHtml || ''}
  ${bodyContent}
  ${this.content.footerHtml || ''}
</body>
</html>
  `.trim();
};

// Method: Increment usage
DocumentTemplateSchema.methods.recordUsage = async function() {
  this.stats.timesUsed += 1;
  this.stats.lastUsedAt = new Date();
  return this.save();
};

// Static: Get default templates for a builder
DocumentTemplateSchema.statics.getDefaults = function(builderId: mongoose.Types.ObjectId) {
  return this.find({ builder: builderId, isDefault: true, isActive: true });
};

export default mongoose.model<IDocumentTemplate>('DocumentTemplate', DocumentTemplateSchema);
