import { useState } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, MessageSquare } from 'lucide-react';

interface VoiceAgentProps {
  context?: 'home' | 'property' | 'listing' | 'agent' | 'admin';
}

export default function VoiceAgent({ context = 'home' }: VoiceAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'agent'; text: string }>>([]);

  // Simulated voice recognition
  const startListening = () => {
    setIsListening(true);
    setTranscript('Listening...');
    
    // Simulate voice input after 2 seconds
    setTimeout(() => {
      const sampleQueries: Record<string, string[]> = {
        home: [
          'Show me properties in Mumbai under 1 crore',
          'Find 3BHK apartments in Bangalore',
          'What are the latest listings?',
        ],
        property: [
          'Tell me more about this property',
          'What is the AI valuation?',
          'Schedule a property viewing',
        ],
        listing: [
          'Help me create a new property listing',
          'Show me properties with high AI scores',
          'Filter by price range',
        ],
        agent: [
          'Show my highest priority leads',
          'What is my commission this month?',
          'Give me insights on my performance',
        ],
        admin: [
          'Show platform analytics',
          'Generate revenue report',
          'What are the top performing cities?',
        ],
      };

      const query = sampleQueries[context][Math.floor(Math.random() * sampleQueries[context].length)];
      setTranscript(query);
      setIsListening(false);
      handleVoiceCommand(query);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
    setTranscript('');
  };

  const handleVoiceCommand = (command: string) => {
    setMessages((prev) => [...prev, { type: 'user', text: command }]);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        home: [
          'I found 24 properties in Mumbai under 1 crore. The top match has an AI score of 92% and is located in Bandra West. Would you like to see it?',
          'Great choice! I have 18 verified 3BHK apartments in Bangalore. The best match is in Koramangala with excellent connectivity. Shall I show you the details?',
          'Here are today\'s latest listings: 5 new properties added in the last 24 hours. The top listing is a luxury villa with 95% AI score in Pune.',
        ],
        property: [
          'This property is a 3BHK apartment with 1,450 sqft. Our AI values it at ₹1.32 Cr, which is 5.6% above the market rate. The location score is excellent with shopping and transport nearby.',
          'The AI valuation shows this property is priced competitively at ₹1.25 Cr. Based on 500+ comparable properties, the fair value range is ₹1.18 Cr to ₹1.35 Cr.',
          'I can help you schedule a viewing! The agent is available tomorrow at 2 PM or 5 PM. Which time works better for you?',
        ],
        listing: [
          'I\'ll guide you through creating a listing. First, what type of property is this - Residential or Commercial? I can also auto-fill details using our AI image analysis.',
          'Here are 12 properties with AI scores above 85%. The highest is a luxury apartment in Mumbai with a 94% score, indicating high buyer interest.',
          'I can filter properties by budget. What\'s your price range? For example: Under 50L, 50L-1Cr, or Above 1Cr?',
        ],
        agent: [
          'You have 3 hot leads with AI scores above 85%. The top lead is Amit Sharma interested in your Bandra property. He has a matching budget and viewed it 3 times. I recommend contacting him within the next hour.',
          'Your commission this month is ₹1.25 Lakh earned, with ₹85,000 pending from 2 deals. You\'re on track to exceed your target by 15%!',
          'Your performance is strong! Response time: 1.5 hours (20% faster), Conversion rate: 18.5% (↑5%), Customer rating: 4.8/5. Top performing property: Bandra Apartment with 12 leads.',
        ],
        admin: [
          'Platform analytics: 12,450 total users (↑12.5%), 8,920 properties (↑18.3%), Monthly revenue: ₹12.5 Cr (↑24.7%). Top city: Mumbai with 2,840 properties.',
          'Revenue report generated! May 2024: ₹12.5 Cr (↑5.8% from April). Top revenue source: Agent commissions (62%). Predicted June revenue: ₹13.8 Cr based on current trends.',
          'Top performing cities: 1) Mumbai - 2,840 properties, ₹4.25 Cr revenue, 2) Bangalore - 2,120 properties, ₹3.18 Cr revenue, 3) Delhi NCR - 1,890 properties, ₹2.83 Cr revenue.',
        ],
      };

      const response = responses[context][Math.floor(Math.random() * responses[context].length)];
      setMessages((prev) => [...prev, { type: 'agent', text: response }]);
      
      // Simulate speaking
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }, 1000);
  };

  return (
    <>
      {/* Floating Voice Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center group"
        >
          <Sparkles className="h-7 w-7 animate-pulse" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Voice Assistant
          </div>
        </button>
      )}

      {/* Voice Agent Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border-2 border-purple-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="h-6 w-6" />
                {isSpeaking && (
                  <span className="absolute inset-0 animate-ping">
                    <Sparkles className="h-6 w-6 opacity-75" />
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold">AI Voice Assistant</h3>
                <p className="text-xs text-purple-100">
                  {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready to help'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-2">Hi! I'm your AI assistant</p>
                <p className="text-sm text-gray-500">Click the microphone to start or try these:</p>
                <div className="mt-4 space-y-2">
                  {[
                    'Show me properties in Mumbai',
                    'What are my top leads?',
                    'Generate a report',
                    'Help me list a property',
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVoiceCommand(suggestion)}
                      className="block w-full text-left px-3 py-2 text-sm bg-white rounded-lg hover:bg-purple-50 transition text-gray-700"
                    >
                      💬 {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'agent' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-md'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-gray-700" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Transcript */}
            {transcript && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900">{transcript}</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-white border-t flex items-center gap-3">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Speak
                </>
              )}
            </button>
            {isSpeaking && (
              <div className="flex items-center gap-2 text-purple-600">
                <Volume2 className="h-5 w-5 animate-pulse" />
                <div className="flex gap-1">
                  <span className="w-1 h-4 bg-purple-600 rounded animate-pulse"></span>
                  <span className="w-1 h-6 bg-purple-600 rounded animate-pulse delay-75"></span>
                  <span className="w-1 h-5 bg-purple-600 rounded animate-pulse delay-150"></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
