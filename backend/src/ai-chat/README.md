# 🤖 AI Chat Module

A modular, scalable AI-powered conversational chatbot for property search and recommendations.

---

## 📁 Module Structure

```
ai-chat/
├── config/                 # Configuration & prompts
│   └── prompts.ts          # System prompts, templates, LLM configs
├── controllers/            # HTTP request handlers
│   └── chat.controller.ts  # Chat API endpoints
├── models/                 # Database schemas
│   └── Conversation.model.ts  # Conversation storage
├── routes/                 # Route definitions
│   └── chat.routes.ts      # API route mappings
├── services/               # Business logic
│   ├── chat-orchestrator.service.ts  # Main coordinator
│   ├── conversation.service.ts       # Conversation management
│   ├── llm.service.ts                # OpenAI integration
│   └── property-search.service.ts    # Property search logic
├── types/                  # TypeScript definitions
│   └── chat.types.ts       # Shared types & interfaces
├── index.ts                # Module exports
└── README.md               # This file
```

---

## 🚀 Features

### ✅ Implemented

- **Conversational AI** - Natural language understanding
- **Intent Detection** - Automatically identifies user needs (search, inquiry, etc.)
- **Context Management** - Multi-turn conversations with memory
- **Vector Search Integration** - Semantic property search
- **Property Recommendations** - AI-powered suggestions
- **Conversation History** - Persistent chat storage
- **User Preferences** - Learns and remembers user requirements
- **Fallback Mechanisms** - Graceful degradation when services unavailable

### 🎯 Intent Types

- `SEARCH` - Property search queries
- `INQUIRY` - Questions about specific properties
- `FILTER` - Refining search criteria
- `COMPARE` - Comparing properties
- `SCHEDULE_VISIT` - Booking viewings
- `GENERAL` - General questions
- `CLARIFICATION` - Asking for more details

---

## 🔧 Configuration

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.3
ENABLE_VECTORIZATION=true

# MongoDB (required for conversation storage)
MONGODB_URI=mongodb+srv://...
```

### System Prompts

Edit `config/prompts.ts` to customize:
- Assistant personality
- Response style
- Intent extraction prompts
- Follow-up questions

---

## 📡 API Endpoints

### Chat

```http
POST /api/v1/ai-chat/message
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "I need a 2BHK in Gachibowli under 80 lakhs",
  "conversationId": "conv_123" // optional
}

Response:
{
  "success": true,
  "data": {
    "reply": "I found 5 properties...",
    "conversationId": "conv_123",
    "properties": [...],
    "suggestedQuestions": [...]
  }
}
```

### Conversations

```http
# Get conversation history
GET /api/v1/ai-chat/conversations?limit=10&status=active

# Get specific conversation
GET /api/v1/ai-chat/conversations/:conversationId

# Close conversation
POST /api/v1/ai-chat/conversations/:conversationId/close
```

### Property Recommendations

```http
# Get similar properties
GET /api/v1/ai-chat/properties/:propertyId/similar?limit=5

# Get trending properties
GET /api/v1/ai-chat/properties/trending?limit=5
```

### Health Check

```http
GET /api/v1/ai-chat/health

Response:
{
  "success": true,
  "status": "operational",
  "features": {
    "llm": true,
    "vectorization": true,
    "model": "gpt-4"
  }
}
```

---

## 💻 Usage

### In Your Main App

```typescript
// backend/src/index.ts
import { chatRoutes } from './ai-chat';

// Add AI chat routes
app.use('/api/v1/ai-chat', chatRoutes);
```

### Programmatic Usage

```typescript
import { chatOrchestratorService } from './ai-chat';

// Send message
const response = await chatOrchestratorService.processMessage({
  message: "Show me properties in Hyderabad",
  userId: "user_123",
  conversationId: "conv_456" // optional
});

console.log(response.reply);
console.log(response.properties);
```

---

## 🧩 Service Architecture

### 1. Chat Orchestrator Service
**Main coordinator** - Routes requests to appropriate handlers

```typescript
processMessage() → 
  ├─ Extract intent (LLM Service)
  ├─ Get/create conversation (Conversation Service)
  ├─ Search properties (Property Search Service)
  ├─ Generate response (LLM Service)
  └─ Save to history (Conversation Service)
```

### 2. LLM Service
**OpenAI integration** - All AI/ML operations

- Generate chat completions
- Extract user intent
- Create property recommendations
- Generate embeddings

### 3. Conversation Service
**State management** - Conversation history & context

- Create/get conversations
- Manage message history
- Track user preferences
- Archive old conversations

### 4. Property Search Service
**Search logic** - Property discovery

- Vector search
- Text search (fallback)
- Filter by preferences
- Find similar properties

---

## 🔄 Conversation Flow

```
User: "I need a 2BHK in Gachibowli"
  ↓
1. Intent Detection: SEARCH
  ↓
2. Extract Data:
   - Location: Gachibowli
   - Bedrooms: 2
  ↓
3. Missing Info Check:
   - Budget: ❌ Not provided
  ↓
4. Generate Clarification:
   "What's your budget range?"
  ↓
User: "Around 80 lakhs"
  ↓
5. Update Preferences:
   - Budget: max 8000000
  ↓
6. Search Properties:
   - Vector search with filters
  ↓
7. Generate Recommendations:
   "I found 5 properties..."
  ↓
8. Save to History
```

---

## 🎨 Customization

### Change AI Personality

Edit `config/prompts.ts`:

```typescript
export const SYSTEM_PROMPTS = {
  PROPERTY_ASSISTANT: `You are a friendly real estate expert...`
};
```

### Add New Intent Types

1. Add to `types/chat.types.ts`:
```typescript
export enum ConversationIntent {
  // ... existing
  MY_NEW_INTENT = 'my_new_intent'
}
```

2. Handle in `chat-orchestrator.service.ts`:
```typescript
switch (intentAnalysis.intent) {
  case ConversationIntent.MY_NEW_INTENT:
    response = await this.handleMyNewIntent(...);
    break;
}
```

### Customize Search Logic

Edit `services/property-search.service.ts`:

```typescript
private buildMatchFilters(filters: Partial<UserPreferences>): any {
  // Add your custom filters
}
```

---

## 🧪 Testing

### Test Chat Endpoint

```bash
curl -X POST http://localhost:5000/api/v1/ai-chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me 2BHK apartments in Hyderabad under 50 lakhs"
  }'
```

### Test Health Check

```bash
curl http://localhost:5000/api/v1/ai-chat/health
```

---

## 📊 Cost Estimation

### Per Conversation (Average)

- **Intent Extraction:** ~100 tokens ($0.0003)
- **Property Recommendation:** ~500 tokens ($0.0015)
- **Clarification:** ~300 tokens ($0.0009)

**Average Cost per Chat:** ~$0.003 (0.3 cents)

### Monthly Costs

- 1,000 conversations/month: **$3**
- 10,000 conversations/month: **$30**
- 100,000 conversations/month: **$300**

---

## 🔐 Security

- ✅ All chat endpoints require authentication
- ✅ User isolation (can only access own conversations)
- ✅ Input validation & sanitization
- ✅ Rate limiting recommended
- ✅ No sensitive data sent to OpenAI (only property descriptions)

---

## 🐛 Troubleshooting

### "AI chat is currently disabled"
- Check `ENABLE_VECTORIZATION=true` in `.env`
- Verify `OPENAI_API_KEY` is set

### "Intent extraction failed"
- LLM service falling back to default intent
- Check OpenAI API key permissions
- Verify OpenAI API is accessible

### "No properties found"
- Vector search might need MongoDB Atlas index
- Fallback to text search automatically
- Check if properties are vectorized

### Slow Response Times
- Consider using `gpt-3.5-turbo` for faster responses
- Reduce `maxTokens` in LLM config
- Enable caching for common queries

---

## 🚀 Future Enhancements

### Planned Features
- [ ] WhatsApp Business API integration
- [ ] Voice message support
- [ ] Image-based property search
- [ ] Personalized recommendations based on history
- [ ] Multi-language support
- [ ] Agent handoff for complex queries
- [ ] Property comparison feature
- [ ] Virtual tour scheduling

### Optimization Ideas
- [ ] Response caching
- [ ] Conversation summarization
- [ ] Batch processing for intent extraction
- [ ] A/B testing framework for prompts
- [ ] Analytics dashboard

---

## 📚 Dependencies

```json
{
  "openai": "^4.x",
  "mongoose": "^8.x",
  "uuid": "^9.x"
}
```

---

## 📖 Learn More

- [OpenAI API Docs](https://platform.openai.com/docs)
- [MongoDB Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Conversational AI Best Practices](https://www.anthropic.com/research)

---

## 🤝 Contributing

When adding features to this module:

1. Follow the existing structure
2. Add types to `types/chat.types.ts`
3. Update prompts in `config/prompts.ts`
4. Add services before controllers
5. Document new endpoints in this README
6. Write tests (TBD)

---

## 📝 License

Part of India Property Ads platform

---

**Built with ❤️ by Azentiq Team**
