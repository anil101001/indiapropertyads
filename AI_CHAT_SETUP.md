# 🤖 AI Chat Module - Quick Setup Guide

Complete guide to integrate the modular AI Chat system into your application.

---

## ✅ What Was Built

### Module: `backend/src/ai-chat/`

A **fully modular** AI conversational chatbot for property search with:

- ✅ Natural language understanding (GPT-4)
- ✅ Intent detection (search, inquiry, filter, etc.)
- ✅ Conversation management with persistent history
- ✅ Vector search integration for semantic property matching
- ✅ Multi-turn conversations with context awareness
- ✅ User preference tracking
- ✅ 8 REST API endpoints
- ✅ Comprehensive documentation

---

## 📦 Module Structure

```
backend/src/ai-chat/
├── config/
│   └── prompts.ts                    # System prompts & LLM configs
├── controllers/
│   └── chat.controller.ts            # HTTP request handlers
├── models/
│   └── Conversation.model.ts         # MongoDB conversation schema
├── routes/
│   └── chat.routes.ts                # API endpoint definitions
├── services/
│   ├── chat-orchestrator.service.ts  # Main coordinator
│   ├── conversation.service.ts       # Conversation management
│   ├── llm.service.ts                # OpenAI integration
│   └── property-search.service.ts    # Property search logic
├── types/
│   └── chat.types.ts                 # TypeScript definitions
├── index.ts                          # Module exports
└── README.md                         # Full documentation
```

---

## 🚀 Integration Steps

### Step 1: Add Routes to Main App (30 seconds)

Edit `backend/src/index.ts` or `backend/src/app.ts`:

```typescript
// Add this import at the top
import { chatRoutes } from './ai-chat';

// Add this with your other routes (after existing routes)
app.use('/api/v1/ai-chat', chatRoutes);
```

**That's it! The module is now integrated.** ✅

---

### Step 2: Verify Configuration (Already Done!)

Your `.env` should have (which you already added):

```env
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.3
ENABLE_VECTORIZATION=true  ✅
```

---

### Step 3: Start Server

```bash
cd backend
npm run dev
```

---

### Step 4: Test the Chatbot

```bash
# Test 1: Health check
curl http://localhost:5000/api/v1/ai-chat/health

# Expected response:
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

```bash
# Test 2: Send a chat message (requires authentication)
curl -X POST http://localhost:5000/api/v1/ai-chat/message \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need a 2BHK apartment in Gachibowli under 80 lakhs"
  }'

# Expected response:
{
  "success": true,
  "data": {
    "reply": "I'd be happy to help you find a 2BHK apartment...",
    "conversationId": "conv_abc123",
    "properties": [...],
    "suggestedQuestions": [
      "Would you like to see more properties in this area?",
      "Are you interested in furnished options?"
    ],
    "intent": "search",
    "metadata": {
      "tokensUsed": 450,
      "searchPerformed": true,
      "propertiesFound": 5
    }
  }
}
```

---

## 📡 Available Endpoints

Once integrated, you have access to 8 new endpoints:

### 1. **Send Message** (Main chatbot endpoint)
```
POST /api/v1/ai-chat/message
Auth: Required
Body: { message: string, conversationId?: string }
```

### 2. **Get Conversations**
```
GET /api/v1/ai-chat/conversations?limit=10&status=active
Auth: Required
```

### 3. **Get Specific Conversation**
```
GET /api/v1/ai-chat/conversations/:conversationId
Auth: Required
```

### 4. **Close Conversation**
```
POST /api/v1/ai-chat/conversations/:conversationId/close
Auth: Required
```

### 5. **Get Similar Properties**
```
GET /api/v1/ai-chat/properties/:propertyId/similar?limit=5
Auth: Public
```

### 6. **Get Trending Properties**
```
GET /api/v1/ai-chat/properties/trending?limit=5
Auth: Public
```

### 7. **Get Chat Statistics**
```
GET /api/v1/ai-chat/stats
Auth: Required
```

### 8. **Health Check**
```
GET /api/v1/ai-chat/health
Auth: Public
```

---

## 🎯 How It Works

### User Conversation Flow

```
User: "Show me 2BHK in Gachibowli"
  ↓
1. Intent Detection → SEARCH
  ↓
2. Extract Requirements:
   - Bedrooms: 2
   - Location: Gachibowli
  ↓
3. Check Missing Info:
   - Budget: ❌ Missing
  ↓
4. Ask for Clarification:
   "What's your budget range?"
  ↓
User: "Around 80 lakhs"
  ↓
5. Update Preferences
  ↓
6. Search Properties (Vector + Text Search)
  ↓
7. Generate AI Recommendation:
   "I found 5 great options..."
  ↓
8. Return Response with Properties
```

---

## 🔧 Customization

### Change AI Personality

Edit `backend/src/ai-chat/config/prompts.ts`:

```typescript
export const SYSTEM_PROMPTS = {
  PROPERTY_ASSISTANT: `You are a friendly real estate expert...
  
  Your Role:
  - Help users find their perfect property
  - Be warm and personable
  - Ask clarifying questions
  
  Guidelines:
  - Use Indian terminology (lakhs, crores, BHK)
  - Suggest 3-5 properties at a time
  - Always end with a follow-up question
  `
};
```

### Adjust Search Behavior

Edit `backend/src/ai-chat/services/property-search.service.ts`:

```typescript
async searchProperties(query, filters, limit) {
  // Customize search logic
  // Add custom filters
  // Adjust ranking algorithm
}
```

### Modify Intent Handling

Edit `backend/src/ai-chat/services/chat-orchestrator.service.ts`:

```typescript
switch (intentAnalysis.intent) {
  case ConversationIntent.SEARCH:
    // Add custom search handling
    break;
  case ConversationIntent.MY_CUSTOM_INTENT:
    // Handle new intent
    break;
}
```

---

## 💰 Cost Estimation

### Per Conversation
- **Intent Extraction:** ~100 tokens = $0.0003
- **Property Recommendation:** ~500 tokens = $0.0015
- **Average Total:** ~$0.003 per conversation

### Monthly Costs
- **1,000 conversations:** ~$3/month
- **10,000 conversations:** ~$30/month
- **100,000 conversations:** ~$300/month

**Very affordable for MVP!** 🎉

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Search
```json
POST /api/v1/ai-chat/message
{
  "message": "Show me apartments in Hyderabad"
}

Expected: Bot asks for bedrooms and budget
```

### Scenario 2: Detailed Search
```json
{
  "message": "I need a 3BHK in Gachibowli under 1 crore"
}

Expected: Bot returns 3-5 matching properties
```

### Scenario 3: Multi-Turn Conversation
```json
// Message 1
{ "message": "Looking for a property" }
// Bot asks: "What type of property?"

// Message 2
{ 
  "message": "2BHK apartment",
  "conversationId": "conv_from_previous_response"
}
// Bot asks: "Which city?"

// Message 3
{ 
  "message": "Hyderabad",
  "conversationId": "conv_from_previous_response"
}
// Bot asks: "What's your budget?"

// Message 4
{ 
  "message": "80 lakhs",
  "conversationId": "conv_from_previous_response"
}
// Bot returns properties!
```

---

## 🎨 Frontend Integration Examples

### React Example

```typescript
// ChatWidget.tsx
const sendMessage = async (message: string) => {
  const response = await fetch('/api/v1/ai-chat/message', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      conversationId: currentConversationId
    })
  });

  const data = await response.json();
  
  // Display bot response
  setMessages([...messages, {
    role: 'assistant',
    content: data.data.reply,
    properties: data.data.properties
  }]);
  
  // Update conversation ID
  setCurrentConversationId(data.data.conversationId);
};
```

### WhatsApp Integration (Future)

```typescript
// WhatsApp webhook handler
app.post('/webhook/whatsapp', async (req, res) => {
  const { from, message } = req.body;
  
  // Process through AI chat
  const response = await chatOrchestratorService.processMessage({
    message,
    userId: from,
    conversationId: `whatsapp_${from}`
  });
  
  // Send back via WhatsApp API
  await sendWhatsAppMessage(from, response.reply);
});
```

---

## 📊 Database Collections

### Conversations Collection

```javascript
{
  _id: ObjectId,
  conversationId: "conv_abc123",
  userId: ObjectId("user_id"),
  messages: [
    {
      role: "user",
      content: "Show me 2BHK",
      timestamp: ISODate,
      metadata: {}
    },
    {
      role: "assistant",
      content: "I found 5 properties...",
      timestamp: ISODate,
      metadata: {
        propertyIds: ["prop1", "prop2"],
        intent: "search"
      }
    }
  ],
  userPreferences: {
    location: { city: "Hyderabad" },
    budget: { max: 8000000 },
    bedrooms: 2
  },
  status: "active",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## 🔐 Security

- ✅ All chat endpoints require authentication
- ✅ User isolation (can only access own conversations)
- ✅ Input sanitization
- ✅ No sensitive data sent to OpenAI
- ✅ API key stored securely in environment variables

---

## 🐛 Troubleshooting

### Issue: "AI chat is currently disabled"
**Solution:** Check `.env` has `ENABLE_VECTORIZATION=true` and valid `OPENAI_API_KEY`

### Issue: "Failed to process message"
**Solution:** 
1. Check OpenAI API key is valid
2. Verify MongoDB connection
3. Check server logs for detailed error

### Issue: No properties returned
**Solution:**
1. Ensure MongoDB vector index is created (see VECTOR_SEARCH_SETUP.md)
2. Verify properties are vectorized
3. Check if filters are too restrictive

### Issue: Slow responses
**Solution:**
1. Use `gpt-3.5-turbo` instead of `gpt-4` for faster responses
2. Reduce `maxTokens` in prompts config
3. Check network latency to OpenAI API

---

## 📈 Monitoring

### Key Metrics to Track

1. **Conversation Stats**
   ```
   GET /api/v1/ai-chat/stats
   ```
   Returns: Total conversations, active, closed, avg messages

2. **Token Usage**
   - Tracked in response metadata
   - Monitor for cost control

3. **Search Performance**
   - Properties found per search
   - Vector vs text search usage

4. **User Engagement**
   - Messages per conversation
   - Conversation completion rate

---

## 🚀 Next Steps

### Phase 1: MVP (Current)
- ✅ Basic chat functionality
- ✅ Property search integration
- ✅ Conversation management

### Phase 2: Enhancement (Next 2 weeks)
- [ ] WhatsApp Business API integration
- [ ] Web chat widget UI
- [ ] Property comparison feature
- [ ] Visit scheduling

### Phase 3: Advanced (Month 2)
- [ ] Voice messages
- [ ] Image-based search
- [ ] Personalized recommendations
- [ ] Multi-language support

---

## 📚 Additional Resources

- **Module Documentation:** `backend/src/ai-chat/README.md`
- **Vector Search Setup:** `VECTOR_SEARCH_SETUP.md`
- **API Testing:** Use Postman collection (to be added)
- **OpenAI Docs:** https://platform.openai.com/docs

---

## ✅ Success Checklist

Before deploying to production:

- [ ] Routes integrated in main app
- [ ] Environment variables configured
- [ ] MongoDB connection working
- [ ] Vector search index created
- [ ] Properties vectorized
- [ ] Health check returns operational
- [ ] Test conversation successful
- [ ] Frontend integration complete
- [ ] Cost monitoring setup
- [ ] Error handling tested

---

## 🎉 Summary

You now have a **fully functional, modular AI chatbot** that:

✅ Understands natural language  
✅ Searches properties intelligently  
✅ Maintains conversation context  
✅ Learns user preferences  
✅ Integrates seamlessly with your app  
✅ Costs <$3/month for 1000 conversations  

**Just add 1 line to integrate:** `app.use('/api/v1/ai-chat', chatRoutes);`

Ready to revolutionize your property search experience! 🏡🤖

---

**Need help?** Check `backend/src/ai-chat/README.md` for detailed documentation.
