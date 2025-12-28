import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiry extends Document {
  property: mongoose.Types.ObjectId; // Reference to Property
  buyer: mongoose.Types.ObjectId; // Reference to User (buyer)
  owner: mongoose.Types.ObjectId; // Reference to User (property owner/agent)
  
  // Inquiry details
  message: string;
  contactMethod: 'call' | 'email' | 'whatsapp';
  
  // Buyer info (stored for quick access)
  buyerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Status tracking (CRM Pipeline)
  status: 'new' | 'contacted' | 'interested' | 'site-visit' | 'negotiation' | 'closed-won' | 'closed-lost';
  response?: string; // Owner's response
  
  // CRM Fields
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'website' | 'phone' | 'whatsapp' | 'referral' | 'walk-in' | 'other';
  nextFollowUpDate?: Date;
  lastContactedAt?: Date;
  expectedClosingDate?: Date;
  budget?: {
    min?: number;
    max?: number;
  };
  notes?: string;
  tags?: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
      index: true
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
      index: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true
    },
    
    // Inquiry details
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    contactMethod: {
      type: String,
      enum: ['call', 'email', 'whatsapp'],
      required: [true, 'Contact method is required']
    },
    
    // Buyer info
    buyerInfo: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      }
    },
    
    // Status (CRM Pipeline)
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'site-visit', 'negotiation', 'closed-won', 'closed-lost'],
      default: 'new'
    },
    response: String,
    respondedAt: Date,
    
    // CRM Fields
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    source: {
      type: String,
      enum: ['website', 'phone', 'whatsapp', 'referral', 'walk-in', 'other'],
      default: 'website'
    },
    nextFollowUpDate: Date,
    lastContactedAt: Date,
    expectedClosingDate: Date,
    budget: {
      min: Number,
      max: Number
    },
    notes: String,
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
InquirySchema.index({ property: 1, buyer: 1 });
InquirySchema.index({ owner: 1, status: 1 });
InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ owner: 1, nextFollowUpDate: 1 });
InquirySchema.index({ owner: 1, priority: 1 });

const Inquiry = mongoose.model<IInquiry>('Inquiry', InquirySchema);

export default Inquiry;
