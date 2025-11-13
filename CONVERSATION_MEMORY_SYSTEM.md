# 🧠 Conversation Memory & Analytics System

## 📊 Overview

Complete system for storing, vectorizing, and analyzing customer interactions with the AI chatbot.

### **Key Features:**
1. ✅ **Conversation Storage** - MongoDB with full message history
2. ✅ **Auto-Vectorization** - Semantic search across all conversations
3. ✅ **Customer Analytics** - Understand user intentions and patterns
4. ✅ **Lead Scoring** - Hot/Warm/Cold classification
5. ✅ **Memory Context** - AI remembers past interactions
6. ✅ **Business Intelligence** - Trending queries, pain points, conversion tracking

---

## 🗄️ Data Model

### **Conversation Schema:**

```typescript
{
  sessionId: string,              // Unique session ID
  userId?: ObjectId,              // If user logged in
  userEmail?: string,
  userName?: string,
  
  messages: [{
    role: 'user' | 'assistant',
    content: string,
    timestamp: Date,
    metadata: {
      properties: [string],      // Property IDs mentioned
      locations: [string],        // Cities/areas discussed
      priceRange: { min, max },
      bedrooms: number,
      propertyType: string,
      intent: 'search' | 'price_estimation' | 'comparison' | 'general_inquiry'
    }
  }],
  
  // Analytics
  totalMessages: number,
  userIntents: [string],           // All intents extracted
  propertiesViewed: [string],      // Properties shown interest in
  preferredLocations: [string],    // Cities user asked about
  budgetRange: { min, max },
  bedroomPreference: [number],
  propertyTypePreference: [string],
  
  // Vectorization
  embedding: [number],             // 1536-dimensional vector
  embeddingMetadata: {
    model: string,
    generatedAt: Date,
    textUsed: string
  },
  
  // Lead Management
  leadQuality: 'hot' | 'warm' | 'cold',
  conversionStatus: 'inquired' | 'scheduled_visit' | 'dropped' | 'ongoing',
  
  // Tracking
  deviceInfo: {
    userAgent: string,
    platform: string,
    isMobile: boolean
  },
  
  startedAt: Date,
  lastMessageAt: Date,
  isActive: boolean
}
```

---

## 🤖 Auto-Vectorization

### **Trigger Conditions:**
- Automatically vectorizes after 3+ messages
- Uses conversation summary for embedding
- Async execution (doesn't block chat)

### **Conversation Summary Format:**
```
"Queries: Show me 2BHK in Bangalore | What's the price? | Properties near tech parks. 
Locations: Bangalore, Koramangala, Whitefield. 
Budget: ₹50,00,000-₹1,00,00,000"
```

### **Benefits:**
- Find similar past conversations
- Group users by interests
- Identify common patterns
- Personalized recommendations

---

## 📈 Analytics Queries

### **1. Customer Intention Analysis**

```javascript
// Most Common Intents
db.conversations.aggregate([
  { $unwind: "$userIntents" },
  { $group: {
      _id: "$userIntents",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
])

// Results:
// search: 450
// price_estimation: 230
// comparison: 120
// general_inquiry: 80
```

### **2. Location Preferences**

```javascript
// Top Requested Cities
db.conversations.aggregate([
  { $unwind: "$preferredLocations" },
  { $group: {
      _id: "$preferredLocations",
      count: { $sum: 1 },
      avgBudget: { $avg: "$budgetRange.max" }
    }
  },
  { $sort: { count: -1 } }
])

// Insights:
// Hyderabad: 320 queries, Avg ₹75L
// Bangalore: 280 queries, Avg ₹1.2Cr
// Mumbai: 150 queries, Avg ₹2.5Cr
```

### **3. Price Range Analysis**

```javascript
// Budget Distribution
db.conversations.aggregate([
  {
    $bucket: {
      groupBy: "$budgetRange.max",
      boundaries: [0, 5000000, 10000000, 20000000, 50000000, 100000000],
      default: "100000000+",
      output: { count: { $sum: 1 } }
    }
  }
])

// Results:
// ₹50L-₹1Cr: 45% (Most common)
// ₹1Cr-₹2Cr: 30%
// ₹2Cr-₹5Cr: 15%
// ₹5Cr+: 10%
```

### **4. Lead Quality Distribution**

```javascript
db.conversations.aggregate([
  {
    $group: {
      _id: "$leadQuality",
      count: { $sum: 1 },
      avgMessages: { $avg: "$totalMessages" }
    }
  }
])

// Results:
// hot: 120 leads (avg 12 messages)
// warm: 350 leads (avg 7 messages)
// cold: 180 leads (avg 3 messages)
```

### **5. Conversion Funnel**

```javascript
db.conversations.aggregate([
  {
    $group: {
      _id: "$conversionStatus",
      count: { $sum: 1 }
    }
  }
])

// Funnel:
// ongoing: 420 (64%)
// inquired: 150 (23%)
// scheduled_visit: 60 (9%)
// dropped: 25 (4%)
```

### **6. Time-Based Patterns**

```javascript
// Peak Chat Hours
db.conversations.aggregate([
  {
    $project: {
      hour: { $hour: "$startedAt" },
      dayOfWeek: { $dayOfWeek: "$startedAt" }
    }
  },
  {
    $group: {
      _id: { hour: "$hour", day: "$dayOfWeek" },
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
])

// Insights:
// Peak: 7-9 PM on weekdays
// Low: 2-5 AM
// Weekend: 10 AM - 2 PM spike
```

---

## 🎯 Use Cases

### **1. Personalized Recommendations**

```typescript
// Find similar past conversations
async function getSimilarConversations(currentConversation: string) {
  const embedding = await generateQueryEmbedding(currentConversation);
  
  const similar = await Conversation.aggregate([
    {
      $vectorSearch: {
        index: "conversation_vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit: 5
      }
    }
  ]);
  
  // Analyze what properties those users liked
  // Recommend similar properties to current user
  return recommendedProperties;
}
```

### **2. Intent-Based Routing**

```typescript
// Route user to right agent/department
if (conversation.userIntents.includes('price_estimation')) {
  // Show price estimation tool
  // Connect to pricing specialist
} else if (conversation.leadQuality === 'hot') {
  // Notify sales team
  // Priority follow-up
}
```

### **3. Chatbot Training**

```typescript
// Find conversations where users dropped
const droppedConversations = await Conversation.find({
  conversionStatus: 'dropped',
  totalMessages: { $gte: 5 }
});

// Analyze:
// - What questions couldn't be answered?
// - Where did users get frustrated?
// - Improve chatbot responses
```

### **4. Market Research**

```typescript
// What features do customers ask about most?
const amenityQueries = await Conversation.aggregate([
  {
    $match: {
      "messages.content": /pool|gym|parking|security/i
    }
  },
  // Group and analyze
]);

// Insights:
// 78% ask about parking
// 65% ask about security
// 45% want gym facilities
// → Focus marketing on these amenities
```

### **5. A/B Testing**

```typescript
// Compare two chatbot versions
const versionAConversions = await Conversation.countDocuments({
  deviceInfo: { version: 'A' },
  conversionStatus: 'inquired'
});

const versionBConversions = await Conversation.countDocuments({
  deviceInfo: { version: 'B' },
  conversionStatus: 'inquired'
});

// Version B converts 23% better!
```

---

## 📊 Admin Dashboard Queries

### **Dashboard Overview:**

```typescript
// GET /api/v1/analytics/conversations/overview
{
  totalConversations: 650,
  activeConversations: 420,
  avgMessagesPerConversation: 6.8,
  leadDistribution: {
    hot: 120,
    warm: 350,
    cold: 180
  },
  conversionRate: 23%, // inquired / total
  topIntents: ['search', 'price_estimation', 'comparison']
}
```

### **Location Insights:**

```typescript
// GET /api/v1/analytics/conversations/locations
{
  topCities: [
    { city: 'Hyderabad', queries: 320, avgBudget: 7500000 },
    { city: 'Bangalore', queries: 280, avgBudget: 12000000 },
    { city: 'Mumbai', queries: 150, avgBudget: 25000000 }
  ],
  emergingAreas: ['Gachibowli', 'Whitefield', 'Powai']
}
```

### **Budget Analysis:**

```typescript
// GET /api/v1/analytics/conversations/budget-trends
{
  distribution: {
    '< 50L': 12%,
    '50L-1Cr': 45%,
    '1Cr-2Cr': 30%,
    '2Cr-5Cr': 10%,
    '5Cr+': 3%
  },
  avgBudget: 12500000,
  medianBudget: 8000000
}
```

### **Temporal Patterns:**

```typescript
// GET /api/v1/analytics/conversations/time-patterns
{
  peakHours: [19, 20, 21], // 7-9 PM
  peakDays: ['Saturday', 'Sunday'],
  avgResponseTime: 2.3, // seconds
  avgSessionDuration: 8.5 // minutes
}
```

---

## 🔧 API Endpoints

### **Conversation Management:**

```
POST   /api/v1/ai-chat/message
  Body: { message, sessionId }
  → Saves to conversation, auto-vectorizes

GET    /api/v1/ai-chat/conversations
  → User's conversation history

GET    /api/v1/ai-chat/conversations/:id
  → Specific conversation with full messages

POST   /api/v1/ai-chat/conversations/:id/close
  → Mark conversation as completed
```

### **Analytics (Admin Only):**

```
GET    /api/v1/analytics/conversations/overview
  → Dashboard summary stats

GET    /api/v1/analytics/conversations/intents
  → Intent distribution and trends

GET    /api/v1/analytics/conversations/locations
  → Geographic analysis

GET    /api/v1/analytics/conversations/budget-trends
  → Price range preferences

GET    /api/v1/analytics/conversations/lead-quality
  → Lead scoring distribution

GET    /api/v1/analytics/conversations/conversion-funnel
  → Conversion tracking

GET    /api/v1/analytics/conversations/time-patterns
  → Temporal usage patterns

GET    /api/v1/analytics/conversations/search?query=X
  → Semantic search across conversations
```

---

## 🚀 Implementation Steps

### **1. Database Setup:**

```javascript
// Create vector search index on conversations
db.conversations.createIndex(
  { embedding: "vector" },
  {
    name: "conversation_vector_index",
    dimensions: 1536,
    similarity: "cosine"
  }
);

// Create analytics indexes
db.conversations.createIndex({ startedAt: -1 });
db.conversations.createIndex({ userIntents: 1 });
db.conversations.createIndex({ leadQuality: 1 });
db.conversations.createIndex({ preferredLocations: 1 });
```

### **2. Environment Variables:**

```env
ENABLE_VECTORIZATION=true
OPENAI_API_KEY=sk-proj-your-key
CONVERSATION_RETENTION_DAYS=90  # Auto-cleanup old conversations
```

### **3. Update Chat Flow:**

```typescript
// In chat-orchestrator.service.ts
import Conversation from '../models/Conversation.model';

async function processMessage(request) {
  // 1. Load or create conversation
  let conversation = await Conversation.findOne({ sessionId: request.sessionId });
  if (!conversation) {
    conversation = new Conversation({
      sessionId: request.sessionId,
      userId: request.userId,
      startedAt: new Date()
    });
  }
  
  // 2. Add user message
  conversation.addMessage('user', request.message, {
    intent: extractedIntent,
    properties: mentionedProperties,
    locations: extractedLocations
  });
  
  // 3. Get AI response
  const aiResponse = await getAIResponse(request.message);
  
  // 4. Add AI message
  conversation.addMessage('assistant', aiResponse);
  
  // 5. Update analytics
  conversation.extractIntents();
  conversation.assessLeadQuality();
  
  // 6. Save (triggers auto-vectorization)
  await conversation.save();
  
  return aiResponse;
}
```

---

## 📈 Business Value

### **Customer Experience:**
- ✅ Personalized recommendations based on history
- ✅ Context-aware responses
- ✅ Faster property discovery
- ✅ Better understanding of user needs

### **Sales & Marketing:**
- ✅ Lead scoring and prioritization
- ✅ Identify high-intent customers
- ✅ Targeted follow-ups
- ✅ Conversion optimization

### **Product Development:**
- ✅ Understand user pain points
- ✅ Feature requests and trends
- ✅ Market demand analysis
- ✅ Chatbot improvement

### **Analytics & Reporting:**
- ✅ Real-time dashboards
- ✅ Trend analysis
- ✅ Geographic insights
- ✅ Pricing optimization

---

## 🎯 Success Metrics

### **Engagement:**
- Average messages per conversation: Target 8+
- Session duration: Target 10+ minutes
- Return rate: Target 40%+

### **Conversion:**
- Hot leads: Target 20%
- Inquiry rate: Target 25%+
- Scheduled visits: Target 10%+

### **Satisfaction:**
- Conversation completion rate: Target 70%+
- Positive sentiment: Target 80%+
- Follow-up acceptance: Target 60%+

---

## 🔒 Privacy & Compliance

### **Data Protection:**
- ✅ User consent for conversation storage
- ✅ GDPR-compliant data retention
- ✅ PII anonymization options
- ✅ Right to be forgotten

### **Security:**
- ✅ Encrypted at rest
- ✅ Access control (admin only)
- ✅ Audit logs
- ✅ Data export capabilities

---

## 🚀 Deployment Checklist

- [ ] Deploy Conversation model
- [ ] Create MongoDB vector index
- [ ] Update chat orchestrator
- [ ] Create analytics endpoints
- [ ] Build admin dashboard
- [ ] Test vectorization
- [ ] Setup monitoring
- [ ] Configure retention policy
- [ ] Document API
- [ ] Train team on analytics

---

## 📊 Sample Analytics Dashboard

```
┌─────────────────────────────────────────────┐
│  Conversation Analytics Dashboard           │
├─────────────────────────────────────────────┤
│                                             │
│  📊 Overview (Last 30 Days)                 │
│  ─────────────────────────────────────────  │
│  Total Conversations:        650            │
│  Active Now:                  42            │
│  Avg Messages/Conv:          6.8            │
│  Conversion Rate:            23%            │
│                                             │
│  🎯 Lead Distribution                        │
│  ─────────────────────────────────────────  │
│  🔥 Hot:    ████████░░ 120 (18%)            │
│  🌡️  Warm:  ██████████████████░░ 350 (54%)  │
│  ❄️  Cold:  ████████░░ 180 (28%)            │
│                                             │
│  📍 Top Cities                               │
│  ─────────────────────────────────────────  │
│  1. Hyderabad    320  (Avg ₹75L)            │
│  2. Bangalore    280  (Avg ₹1.2Cr)          │
│  3. Mumbai       150  (Avg ₹2.5Cr)          │
│                                             │
│  🔍 Top Intents                              │
│  ─────────────────────────────────────────  │
│  1. Search             450 (69%)            │
│  2. Price Estimation   230 (35%)            │
│  3. Comparison         120 (18%)            │
│                                             │
│  ⏰ Peak Hours                               │
│  ─────────────────────────────────────────  │
│  7-9 PM:  █████████████████████  450 chats │
│  10-12 PM: ██████████  180 chats            │
│  Weekend:  ███████████████  280 chats       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎉 Benefits Summary

✅ **Remember Everything** - Full conversation history  
✅ **Understand Intent** - Know what customers want  
✅ **Smart Recommendations** - AI uses past context  
✅ **Lead Scoring** - Prioritize hot leads  
✅ **Market Insights** - Data-driven decisions  
✅ **Improve Chatbot** - Learn from conversations  
✅ **Personalization** - Better customer experience  
✅ **Analytics** - Comprehensive reporting  

**Result:** Higher conversion, better UX, actionable insights!
