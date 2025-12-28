import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  inquiry: mongoose.Types.ObjectId; // Reference to Inquiry/Lead
  user: mongoose.Types.ObjectId; // User who owns the task
  assignedTo?: mongoose.Types.ObjectId; // User assigned to complete the task
  
  // Task details
  title: string;
  description?: string;
  type: 'follow-up' | 'call' | 'email' | 'site-visit' | 'meeting' | 'document' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Scheduling
  dueDate: Date;
  reminderDate?: Date;
  
  // Status
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
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
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    
    // Task details
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
      type: String,
      enum: ['follow-up', 'call', 'email', 'site-visit', 'meeting', 'document', 'other'],
      default: 'follow-up'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    
    // Scheduling
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true
    },
    reminderDate: Date,
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    completedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
TaskSchema.index({ user: 1, status: 1, dueDate: 1 });
TaskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
TaskSchema.index({ inquiry: 1, status: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });

const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;
