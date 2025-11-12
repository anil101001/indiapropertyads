/**
 * AI Chat Module - Main Export
 * Central entry point for the AI chat module
 */

// Routes
export { default as chatRoutes } from './routes/chat.routes';

// Services
export { default as chatOrchestratorService } from './services/chat-orchestrator.service';
export { default as conversationService } from './services/conversation.service';
export { default as llmService } from './services/llm.service';
export { default as propertySearchService } from './services/property-search.service';

// Models
export { default as Conversation } from './models/Conversation.model';

// Types
export * from './types/chat.types';

// Config
export * from './config/prompts';
