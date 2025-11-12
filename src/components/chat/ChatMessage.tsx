/**
 * Chat Message Component
 * Displays individual chat messages with styling
 */

import React from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/chat';
import PropertyCard from './PropertyCard';

interface ChatMessageProps {
  message: ChatMessageType;
  onPropertyClick?: (propertyId: string) => void;
  onQuestionClick?: (question: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onPropertyClick,
  onQuestionClick
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-2`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-2">
          {/* Message Bubble */}
          <div
            className={`rounded-2xl px-4 py-2 ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Property Cards */}
          {message.properties && message.properties.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-2">
              {message.properties.map((property) => (
                <PropertyCard
                  key={property.propertyId}
                  property={property}
                  onClick={() => onPropertyClick?.(property.propertyId)}
                />
              ))}
            </div>
          )}

          {/* Suggested Questions */}
          {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => onQuestionClick?.(question)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
