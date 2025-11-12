/**
 * Chat Widget Component
 * Floating AI chat assistant for property search
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, AlertCircle } from 'lucide-react';
import ChatMessage from './chat/ChatMessage';
import { ChatMessage as ChatMessageType, ChatStatus } from '../types/chat';
import { sendMessage as sendChatMessage, checkChatHealth } from '../services/chatService';
import { useNavigate } from 'react-router-dom';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isAvailable, setIsAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Check if chat service is available on mount
  useEffect(() => {
    checkChatHealth()
      .then((health) => {
        setIsAvailable(health.features.llm && health.features.vectorization);
      })
      .catch(() => {
        setIsAvailable(false);
      });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessageType = {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! 👋 I'm your AI property assistant. I can help you find your perfect property. What are you looking for?",
        timestamp: new Date(),
        suggestedQuestions: [
          "Show me 2BHK in Hyderabad",
          "Properties under 50 lakhs",
          "Apartments near IT companies"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || status === 'sending') return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setStatus('sending');

    try {
      const response = await sendChatMessage(inputValue.trim(), conversationId);

      // Update conversation ID
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Add assistant response
      const assistantMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
        properties: response.properties,
        suggestedQuestions: response.suggestedQuestions,
        metadata: response.metadata
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStatus('idle');
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: error.response?.status === 401
          ? "Please login to use the chat assistant."
          : "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        suggestedQuestions: error.response?.status === 401 
          ? ["Go to Login"]
          : ["Try again"]
      };

      setMessages((prev) => [...prev, errorMessage]);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
    setIsOpen(false);
  };

  const handleQuestionClick = (question: string) => {
    if (question === "Go to Login") {
      navigate('/login');
      setIsOpen(false);
      return;
    }
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't show button if service is not available
  if (!isAvailable) {
    return null;
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 h-[600px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 dark:bg-blue-700 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Property Assistant</h3>
                <p className="text-xs text-blue-100">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 dark:hover:bg-blue-800 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onPropertyClick={handlePropertyClick}
                onQuestionClick={handleQuestionClick}
              />
            ))}

            {/* Typing Indicator */}
            {status === 'sending' && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                </div>
              </div>
            )}

            {/* Error Indicator */}
            {status === 'error' && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Connection error</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={status === 'sending'}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || status === 'sending'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {status === 'sending' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
};

export default ChatWidget;
