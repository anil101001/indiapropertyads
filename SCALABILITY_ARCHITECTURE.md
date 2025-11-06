# 🚀 India Property Ads - Scalability Architecture

## Overview
Design patterns and architecture for scaling to 10M+ properties across India (36 states/UTs, 4,000+ cities).

---

## 📊 Scale Targets
- **Properties:** 10M+
- **Daily Active Users:** 100K+
- **Peak Traffic:** 10K+ req/sec
- **Geographic Coverage:** All-India
- **Response Time:** < 50ms (P95)

---

## 🏗️ Current Architecture

### ✅ Working Well
- Database indexing (compound + text search)
- Query optimization (`.lean()`, selective population)
- AWS S3 for media storage
- Basic pagination

### 🚨 Needs Improvement
- Single MongoDB instance (won't scale)
- No caching (every query hits DB)
- RegEx search (slow beyond 100K records)
- Monolithic API (single point of failure)
- No geographic distribution
- Skip/limit pagination (slow for large offsets)

---

## 🎯 Design Patterns for Scale

## 1. Database Sharding Strategy

**Shard Key:** `{ "address.state": 1, "address.city": 1 }`

### Regional Shards
```
Shard 1 (North): Delhi, Punjab, Haryana, UP, Uttarakhand
Shard 2 (South): Karnataka, TN, Kerala, AP, Telangana
Shard 3 (West): Maharashtra, Gujarat, Rajasthan, Goa
Shard 4 (East): WB, Odisha, Bihar, Jharkhand, NE States
Shard 5 (Central): MP, Chhattisgarh
```

**Benefits:**
- Regional queries stay within one shard
- Natural data distribution
- Reduces cross-shard operations

---

## 2. Multi-Layer Caching

### Layer 1: Redis (Application Cache)
```javascript
// Cache keys with TTL
properties:city:{cityName}:page:{n}    → 5 min
property:{id}                           → 30 min
stats:city:{cityName}                   → 1 hour
properties:featured                     → 15 min
```

### Layer 2: CDN (Edge Cache)
- CloudFront/Cloudflare
- Property images: 30 days
- API responses: 5 minutes
- Edge locations: Mumbai, Delhi, Bangalore

---

## 3. Elasticsearch for Search

### Why Elasticsearch?
- Full-text search at scale
- Geo-spatial queries ("Near me")
- Fuzzy matching (Mumbai vs Bombay)
- Real-time aggregations
- Multi-language support

### Search Flow
```
User Query → Elasticsearch (get IDs) → MongoDB (get full data) → Cache → Response
```

---

## 4. Microservices Architecture

```
Frontend (Netlify)
      ↓
API Gateway (BFF)
      ↓
├── Search Service (Elasticsearch)
├── Auth Service (MongoDB)
├── Property Service (MongoDB)
├── Media Service (S3)
└── AI Service (ML Models)
```

---

## 5. Enhanced Indexing

```javascript
// Geographic + price filtering
PropertySchema.index({
  'address.state': 1,
  'address.city': 1,
  status: 1,
  'pricing.expectedPrice': 1
});

// Geospatial for "Near Me"
PropertySchema.index({
  location: '2dsphere',
  status: 1
});

// Hot properties
PropertySchema.index({
  'stats.views': -1,
  status: 1,
  publishedAt: -1
});
```

---

## 6. CQRS Pattern

**Write Path:** User → Master DB → Event Queue  
**Read Path:** User → Read Replicas + Cache + Elasticsearch

**Benefits:**
- Scale reads independently (90% traffic)
- Master handles only writes (10%)
- Read replicas can be region-specific

---

## 7. Data Archival

```
Hot Storage (MongoDB SSD):
  - Active listings (approved, pending)
  - Size: ~500K properties
  - Access: < 50ms

Warm Storage (MongoDB HDD):
  - Sold/rented (last 6 months)
  - Size: ~2M properties
  - Access: < 5s

Cold Storage (S3 Glacier):
  - Archived (> 6 months)
  - Size: Unlimited
  - Access: Hours
```

---

## 8. Multi-Region Deployment

```
Route53 (Latency-Based Routing)
      ↓
├── Mumbai Region (West India)
│   ├── Backend API + Redis + Read Replica
│
├── Bangalore Region (South India)
│   ├── Backend API + Redis + Read Replica
│
└── Delhi Region (North India)
    └── Backend API (Master) + Redis + MongoDB Master
```

**Latency:** 20-50ms across India

---

## 9. Rate Limiting

### By Role
```
Anonymous:      100 req/hour
Buyer:          500 req/hour
Owner:          1000 req/hour
Agent:          2000 req/hour
Premium Agent:  10000 req/hour
Admin:          Unlimited
```

### By Endpoint
```
/search:        60 req/min
/property/:id:  300 req/min
/create:        10 req/hour
/login:         5 req/15min (brute force protection)
```

---

## 10. Monitoring Stack

```
Application Logs → Winston → CloudWatch
Metrics → Prometheus → Grafana
APM → New Relic / Datadog
Alerts → PagerDuty

Key Metrics:
- API latency (P50, P95, P99)
- Cache hit ratio
- DB query time
- Error rates by region
- Properties/sec (write rate)
```

---

## 📈 Phased Implementation

### Phase 1: Now → 10K properties
- ✅ Current architecture
- Add Redis caching
- Optimize indexes

### Phase 2: 10K → 100K
- Elasticsearch
- Read replicas
- CDN for images

### Phase 3: 100K → 1M
- Geographic sharding
- CQRS pattern
- Multi-region

### Phase 4: 1M+
- Full microservices
- Hot/warm/cold storage
- Advanced ML pipelines

---

## 💰 Cost Estimates

### Current (MVP)
- **Stack:** Render Free + Atlas Free
- **Cost:** $0/month
- **Capacity:** ~1K properties
- **Latency:** 200-500ms

### Startup Scale (10K-100K)
- **Stack:** Render Standard + Atlas M10 + Redis + CloudFront
- **Cost:** $200-500/month
- **Capacity:** 100K properties
- **Latency:** 50-150ms

### Production Scale (100K-1M)
- **Stack:** Multi-region + Dedicated + Elasticsearch
- **Cost:** $2,000-5,000/month
- **Capacity:** 1M+ properties
- **Latency:** 20-50ms

---

## 🔥 Quick Wins (No Refactor)

1. **Add Redis caching** → 10x faster repeat queries
2. **Add geo indexes** → Enable "Near me" feature
3. **Cursor pagination** → Better than skip/limit at scale
4. **Connection pooling** → Reduce overhead
5. **MongoDB compression** → 50% storage savings

---

## 📚 References

- MongoDB Sharding: https://docs.mongodb.com/manual/sharding/
- Elasticsearch Guide: https://www.elastic.co/guide/
- Redis Patterns: https://redis.io/topics/patterns
- AWS Well-Architected: https://aws.amazon.com/architecture/well-architected/

---

**Last Updated:** November 6, 2025  
**Status:** Planning Phase
