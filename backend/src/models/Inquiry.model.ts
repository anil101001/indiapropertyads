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
  
  // Status tracking
  status: 'new' | 'contacted' | 'interested' | 'not-interested' | 'closed';
  response?: string; // Owner's response
  
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
    
    // Status
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'not-interested', 'closed'],
      default: 'new'
    },
    response: String,
    respondedAt: Date
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
InquirySchema.index({ property: 1, buyer: 1 });
InquirySchema.index({ owner: 1, status: 1 });
InquirySchema.index({ createdAt: -1 });

const Inquiry = mongoose.model<IInquiry>('Inquiry', InquirySchema);

export default Inquiry;
