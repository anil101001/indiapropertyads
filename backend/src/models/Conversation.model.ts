import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    properties?: string[];
    locations?: string[];
    priceRange?: { min?: number; max?: number };
    bedrooms?: number;
    propertyType?: string;
    intent?: 'search' | 'price_estimation' | 'comparison' | 'general_inquiry';
  };
}

export interface IConversation extends Document {
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  userName?: string;
  messages: IMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  isActive: boolean;
  totalMessages: number;
  userIntents: string[];
  propertiesViewed: string[];
  preferredLocations: string[];
  budgetRange?: { min?: number; max?: number };
  bedroomPreference?: number[];
  propertyTypePreference?: string[];
  embedding?: number[];
  embeddingMetadata?: {
    model: string;
    generatedAt: Date;
    textUsed: string;
  };
  leadQuality?: 'hot' | 'warm' | 'cold';
  conversionStatus?: 'inquired' | 'scheduled_visit' | 'dropped' | 'ongoing';
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    isMobile?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  
  addMessage(role: 'user' | 'assistant', content: string, metadata?: IMessage['metadata']): void;
  extractIntents(): void;
  assessLeadQuality(): void;
  summarizeForEmbedding(): string;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    properties: [String],
    locations: [String],
    priceRange: { min: Number, max: Number },
    bedrooms: Number,
    propertyType: String,
    intent: { type: String, enum: ['search', 'price_estimation', 'comparison', 'general_inquiry'] }
  }
}, { _id: false });

const ConversationSchema = new Schema<IConversation>({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  userEmail: String,
  userName: String,
  messages: [MessageSchema],
  startedAt: { type: Date, default: Date.now },
  lastMessageAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  totalMessages: { type: Number, default: 0 },
  userIntents: [String],
  propertiesViewed: [String],
  preferredLocations: [String],
  budgetRange: { min: Number, max: Number },
  bedroomPreference: [Number],
  propertyTypePreference: [String],
  embedding: { type: [Number], required: false, select: false },
  embeddingMetadata: { model: String, generatedAt: Date, textUsed: String },
  leadQuality: { type: String, enum: ['hot', 'warm', 'cold'] },
  conversionStatus: { type: String, enum: ['inquired', 'scheduled_visit', 'dropped', 'ongoing'], default: 'ongoing' },
  deviceInfo: { userAgent: String, platform: String, isMobile: Boolean }
}, { timestamps: true });

// Indexes
ConversationSchema.index({ startedAt: -1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ userIntents: 1 });
ConversationSchema.index({ leadQuality: 1 });

// Methods
ConversationSchema.methods.addMessage = function(role: 'user' | 'assistant', content: string, metadata?: IMessage['metadata']): void {
  this.messages.push({ role, content, timestamp: new Date(), metadata });
  this.totalMessages = this.messages.length;
  this.lastMessageAt = new Date();
};

ConversationSchema.methods.extractIntents = function(): void {
  const intents = new Set<string>();
  this.messages.forEach((msg: IMessage) => {
    if (msg.metadata?.intent) intents.add(msg.metadata.intent);
  });
  this.userIntents = Array.from(intents);
};

ConversationSchema.methods.assessLeadQuality = function(): void {
  const messageCount = this.totalMessages;
  if (this.conversionStatus === 'inquired' || messageCount > 10) {
    this.leadQuality = 'hot';
  } else if (this.propertiesViewed.length > 0 || messageCount > 5) {
    this.leadQuality = 'warm';
  } else {
    this.leadQuality = 'cold';
  }
};

ConversationSchema.methods.summarizeForEmbedding = function(): string {
  const userMessages = this.messages.filter((m: IMessage) => m.role === 'user').map((m: IMessage) => m.content).join(' | ');
  const locations = this.preferredLocations.join(', ');
  const budget = this.budgetRange ? `Budget: ₹${this.budgetRange.min}-${this.budgetRange.max}` : '';
  return `Queries: ${userMessages}. Locations: ${locations}. ${budget}`;
};

// Auto-vectorize hook
ConversationSchema.post('save', async function(doc) {
  if (doc.totalMessages >= 3 && !doc.embedding) {
    try {
      const { generateConversationEmbedding } = await import('../services/embedding.service');
      generateConversationEmbedding(doc).catch(err => console.error('Conversation vectorization failed:', err.message));
    } catch (error: any) {
      console.error('Vectorization error:', error.message);
    }
  }
});

const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
