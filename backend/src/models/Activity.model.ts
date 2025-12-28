import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  inquiry: mongoose.Types.ObjectId; // Reference to Inquiry/Lead
  user: mongoose.Types.ObjectId; // User who performed the activity
  
  // Activity type
  type: 'call' | 'email' | 'sms' | 'whatsapp' | 'site-visit' | 'meeting' | 'note' | 'status-change' | 'follow-up';
  
  // Activity details
  title: string;
  description?: string;
  
  // For calls
  callDetails?: {
    duration?: number; // in seconds
    outcome?: 'connected' | 'no-answer' | 'busy' | 'voicemail' | 'wrong-number';
    direction?: 'inbound' | 'outbound';
  };
  
  // For site visits
  siteVisitDetails?: {
    scheduledAt?: Date;
    completedAt?: Date;
    feedback?: string;
    rating?: number; // 1-5
  };
  
  // For status changes
  statusChange?: {
    from: string;
    to: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    inquiry: {
      type: Schema.Types.ObjectId,
      ref: 'Inquiry',
      required: [true, 'Inquiry is required'],
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    
    // Activity type
    type: {
      type: String,
      enum: ['call', 'email', 'sms', 'whatsapp', 'site-visit', 'meeting', 'note', 'status-change', 'follow-up'],
      required: [true, 'Activity type is required']
    },
    
    // Activity details
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    
    // Call details
    callDetails: {
      duration: Number,
      outcome: {
        type: String,
        enum: ['connected', 'no-answer', 'busy', 'voicemail', 'wrong-number']
      },
      direction: {
        type: String,
        enum: ['inbound', 'outbound']
      }
    },
    
    // Site visit details
    siteVisitDetails: {
      scheduledAt: Date,
      completedAt: Date,
      feedback: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    
    // Status change tracking
    statusChange: {
      from: String,
      to: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
ActivitySchema.index({ inquiry: 1, createdAt: -1 });
ActivitySchema.index({ user: 1, createdAt: -1 });
ActivitySchema.index({ type: 1 });

const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
