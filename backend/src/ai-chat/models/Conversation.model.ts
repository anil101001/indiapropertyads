/**
 * AI Chat Module - Conversation Database Model
 */

import mongoose, { Document, Schema } from 'mongoose';
import { ChatMessage, UserPreferences } from '../types/chat.types';

export interface IConversation extends Document {
  conversationId: string;
  userId: mongoose.Types.ObjectId;
  messages: ChatMessage[];
  userPreferences?: UserPreferences;
  metadata: {
    platform?: 'web' | 'whatsapp' | 'mobile';
    ipAddress?: string;
    userAgent?: string;
  };
  status: 'active' | 'closed' | 'archived';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    messages: [{
      role: {
        type: String,
        enum: ['system', 'user', 'assistant'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      metadata: {
        propertyIds: [String],
        searchQuery: String,
        intent: String
      }
    }],
    userPreferences: {
      location: {
        city: String,
        locality: String,
        preferredAreas: [String]
      },
      budget: {
        min: Number,
        max: Number
      },
      propertyType: {
        type: String,
        enum: ['apartment', 'villa', 'independent-house', 'plot']
      },
      bedrooms: Number,
      amenities: [String],
      furnishing: {
        type: String,
        enum: ['unfurnished', 'semi-furnished', 'fully-furnished']
      },
      listingType: {
        type: String,
        enum: ['sale', 'rent']
      }
    },
    metadata: {
      platform: {
        type: String,
        enum: ['web', 'whatsapp', 'mobile'],
        default: 'web'
      },
      ipAddress: String,
      userAgent: String
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'archived'],
      default: 'active',
      index: true
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
ConversationSchema.index({ userId: 1, status: 1 });
ConversationSchema.index({ conversationId: 1, userId: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

// Auto-archive old conversations
ConversationSchema.index({ lastMessageAt: 1 }, { 
  expireAfterSeconds: 90 * 24 * 60 * 60 // 90 days
});

// Methods
ConversationSchema.methods.addMessage = function(message: ChatMessage) {
  this.messages.push(message);
  this.lastMessageAt = new Date();
  return this.save();
};

ConversationSchema.methods.updatePreferences = function(preferences: Partial<UserPreferences>) {
  this.userPreferences = { ...this.userPreferences, ...preferences };
  return this.save();
};

ConversationSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
