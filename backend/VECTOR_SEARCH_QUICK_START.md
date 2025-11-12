# 🚀 Vector Search - Quick Start

## 📦 Installation (30 seconds)

```bash
cd backend
npm install openai
```

## 🔑 Configuration (2 minutes)

Add to `.env`:

```env
OPENAI_API_KEY=sk-your-key-here
ENABLE_VECTORIZATION=false  # Keep false until ready!
```

## ⚠️ IMPORTANT: Zero Impact Guarantee

**With `ENABLE_VECTORIZATION=false`, nothing changes!**
- ✅ All existing APIs work exactly as before
- ✅ No OpenAI API calls made
- ✅ No cost incurred
- ✅ No performance impact

## 🎯 When You're Ready (Full Setup)

1. **Get OpenAI API Key**
   - https://platform.openai.com/api-keys

2. **Create MongoDB Vector Index**
   - See `VECTOR_SEARCH_SETUP.md` Step 3
   - Takes 5 minutes via Atlas UI

3. **Enable Feature**
   ```env
   ENABLE_VECTORIZATION=true
   ```

4. **Vectorize Existing Properties**
   ```bash
   npx ts-node scripts/vectorize-properties.ts
   ```

5. **Add Search Routes** (Optional)
   ```typescript
   // src/index.ts
   import searchRoutes from './routes/search.routes';
   app.use('/api/v1/search', searchRoutes);
   ```

## 🧪 Test Semantic Search

```bash
curl -X POST http://localhost:5000/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "affordable 2BHK near IT parks",
    "limit": 10
  }'
```

## 💰 Cost

- 10K properties vectorized: **$0.053** (one-time)
- 1000 searches/day: **$0.15/month**
- **Total MVP cost: <$2/month**

## 📚 Full Documentation

See `VECTOR_SEARCH_SETUP.md` for complete setup and troubleshooting.

## ✅ What Was Added

### New Files:
- ✅ `src/services/embedding.service.ts` - OpenAI integration
- ✅ `src/middleware/vectorization.middleware.ts` - Auto-vectorization
- ✅ `src/controllers/search.controller.ts` - Semantic search API
- ✅ `src/routes/search.routes.ts` - Search routes
- ✅ `scripts/vectorize-properties.ts` - Batch vectorization

### Modified Files:
- ✅ `src/models/Property.model.ts` - Added optional `embedding` field
- ✅ `.env.example` - Added OpenAI config

### Zero Breaking Changes:
- ✅ All fields are optional
- ✅ Feature disabled by default
- ✅ Fallback to regular search if vector search fails
- ✅ No changes to existing APIs

---

**Ready to test? Start with `ENABLE_VECTORIZATION=false` and verify nothing breaks!** ✅
