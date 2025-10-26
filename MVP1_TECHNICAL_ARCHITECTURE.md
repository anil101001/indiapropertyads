# 🏗️ MVP1 - Technical Architecture

## **System Architecture Overview**

---

# 📐 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Web App      │  │ Admin Panel  │  │ Mobile Web   │     │
│  │ (React +TS)  │  │ (React +TS)  │  │ (Responsive) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js + Express.js                                 │  │
│  │  • Authentication (JWT)                               │  │
│  │  • Rate Limiting                                      │  │
│  │  • Request Validation                                 │  │
│  │  • API Documentation (Swagger)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ User Service │  │Property Svc  │  │ Payment Svc  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Search Svc   │  │ Lead Svc     │  │ Notification │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Price Model  │  │ Lead Scoring │  │ Image AI     │     │
│  │ (XGBoost)    │  │ (ML Model)   │  │ (TensorFlow) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Fraud Detect │  │ Recommender  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ MongoDB      │  │ Redis Cache  │  │ AWS S3       │     │
│  │ (Primary DB) │  │ (Sessions)   │  │ (Images)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Elasticsearch│  │ PostgreSQL   │                        │
│  │ (Search)     │  │ (Analytics)  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Google Maps  │  │ Razorpay     │  │ SendGrid     │     │
│  │ (Location)   │  │ (Payments)   │  │ (Email)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Twilio (SMS) │  │ AWS ML       │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

# 🔧 TECHNOLOGY STACK

## **Frontend**

### **Web Application:**
- **Framework:** React 18.x with TypeScript
- **Build Tool:** Vite 5.x
- **Routing:** React Router DOM v6
- **State Management:** 
  - Zustand (global state)
  - React Query (server state)
- **Styling:** 
  - Tailwind CSS 3.x
  - Headless UI (components)
- **Form Handling:** React Hook Form + Zod (validation)
- **HTTP Client:** Axios
- **Maps:** @react-google-maps/api
- **Charts:** Recharts
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Image Upload:** react-dropzone

### **Admin Panel:**
- Same stack as web app
- Additional: React Admin (admin framework)

---

## **Backend**

### **API Server:**
- **Runtime:** Node.js 20.x LTS
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **API Documentation:** Swagger/OpenAPI
- **Validation:** Joi or Zod
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, express-rate-limit
- **File Upload:** Multer + AWS SDK
- **Logging:** Winston or Pino
- **Process Manager:** PM2

### **Microservices (if needed):**
- **User Service:** Authentication, profiles, KYC
- **Property Service:** CRUD, search, analytics
- **Payment Service:** Razorpay integration, commissions
- **Notification Service:** Email, SMS, push notifications
- **Search Service:** Elasticsearch integration
- **AI Service:** ML model serving

---

## **Database**

### **Primary Database:**
- **MongoDB 7.x** (NoSQL)
- **Why:** Flexible schema, horizontal scaling, good for property data
- **Collections:**
  - users
  - properties
  - leads
  - transactions
  - reviews
  - notifications

### **Cache Layer:**
- **Redis 7.x**
- **Purpose:** 
  - Session storage
  - API response caching
  - Real-time counters (views, likes)
  - Rate limiting

### **Search Engine:**
- **Elasticsearch 8.x**
- **Purpose:**
  - Full-text property search
  - Location-based queries
  - Faceted filtering
  - Auto-suggestions

### **Analytics Database:**
- **PostgreSQL 15.x** (optional)
- **Purpose:**
  - Time-series analytics
  - Complex reporting
  - Data warehousing

---

## **AI/ML Stack**

### **Model Training:**
- **Language:** Python 3.11
- **Framework:** 
  - Scikit-learn (preprocessing)
  - XGBoost (property valuation)
  - TensorFlow/Keras (image analysis)
- **Data Processing:** Pandas, NumPy
- **Deployment:** 
  - Option 1: AWS SageMaker
  - Option 2: FastAPI microservice

### **Model Serving:**
- **FastAPI** (Python web framework)
- **ONNX Runtime** (optimized inference)
- **Redis** (model result caching)

---

## **File Storage**

### **Images & Documents:**
- **AWS S3** (primary)
- **CloudFront CDN** (content delivery)
- **Alternative:** Cloudinary (image optimization)

### **Backup:**
- **AWS S3 Glacier** (long-term backup)

---

## **Third-Party Integrations**

### **Maps & Location:**
- **Google Maps API:**
  - Maps JavaScript API
  - Places API
  - Geocoding API
  - Distance Matrix API

### **Payments:**
- **Razorpay:**
  - Payment Gateway
  - Subscription Management
  - Payouts API
- **Alternative:** Stripe (for international)

### **Communication:**
- **Email:** SendGrid or AWS SES
- **SMS:** Twilio or MSG91
- **Push Notifications:** Firebase Cloud Messaging

### **Authentication:**
- **Social Login:**
  - Google OAuth 2.0
  - Facebook Login

### **Monitoring:**
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics 4
- **Uptime:** Pingdom or UptimeRobot
- **APM:** New Relic or DataDog

---

## **DevOps & Infrastructure**

### **Hosting:**
- **Option 1: AWS**
  - EC2 (compute)
  - RDS (managed DB)
  - S3 (storage)
  - CloudFront (CDN)
  - ElastiCache (Redis)
  - Elastic Beanstalk (easy deployment)

- **Option 2: DigitalOcean**
  - Droplets (VMs)
  - Managed Databases
  - Spaces (object storage)
  - App Platform (PaaS)

- **Option 3: Vercel + Railway**
  - Vercel (frontend)
  - Railway (backend + DB)

### **CI/CD:**
- **GitHub Actions** (preferred)
  - Auto-deploy on push to main
  - Run tests before deploy
  - Build Docker images
- **Alternative:** GitLab CI or CircleCI

### **Containerization:**
- **Docker** (containerize services)
- **Docker Compose** (local development)
- **Optional:** Kubernetes (if scaling significantly)

### **Load Balancing:**
- **AWS ALB** (Application Load Balancer)
- **Nginx** (reverse proxy + load balancer)

### **SSL/TLS:**
- **Let's Encrypt** (free SSL certificates)
- **Certbot** (auto-renewal)

---

# 🔐 SECURITY ARCHITECTURE

## **Authentication & Authorization**

### **JWT Token Strategy:**
```javascript
{
  // Access Token (short-lived)
  expiresIn: "15m",
  payload: { userId, role, permissions }
  
  // Refresh Token (long-lived)
  expiresIn: "7d",
  stored: "Redis + HTTP-only cookie"
}
```

### **Role-Based Access Control (RBAC):**
```
Roles: buyer, owner, agent, admin

Permissions:
- buyers: [view_properties, save_favorites, contact_agents]
- owners: [create_listing, edit_listing, view_analytics]
- agents: [all_owner_permissions, view_leads, bulk_upload]
- admins: [all_permissions, user_management, platform_config]
```

### **Password Security:**
- **Hashing:** bcrypt (cost factor: 12)
- **Requirements:** Min 8 chars, 1 uppercase, 1 number, 1 special
- **Reset:** Time-limited tokens (1 hour expiry)

---

## **API Security**

### **Rate Limiting:**
```javascript
General API: 100 requests/15min per IP
Auth endpoints: 5 requests/15min per IP
Search: 50 requests/min per user
Image upload: 10 uploads/hour per user
```

### **Input Validation:**
- Validate all inputs (body, query, params)
- Sanitize HTML/SQL injection attempts
- File upload validation (type, size, content)

### **CORS Policy:**
```javascript
allowedOrigins: [
  'https://indiapropertyads.com',
  'https://www.indiapropertyads.com',
  'http://localhost:3000' // dev only
]
```

---

## **Data Protection**

### **Encryption:**
- **In Transit:** TLS 1.3
- **At Rest:** 
  - Database encryption (MongoDB encryption at rest)
  - S3 bucket encryption (AES-256)
- **Sensitive Data:** 
  - Aadhaar (masked: XXXX-XXXX-1234)
  - PAN (masked: XXXXX5678Z)
  - Bank details (encrypted with app key)

### **Privacy Compliance:**
- **GDPR-ready** (for future)
- **Data retention policies:**
  - User data: Retained until account deletion
  - Logs: 90 days
  - Analytics: 2 years
- **Right to deletion:** User can request data deletion

---

## **Fraud Prevention**

### **AI Fraud Detection:**
- Price anomaly detection (>40% deviation)
- Duplicate image detection (reverse search)
- Fake document detection (OCR + validation)
- Multiple account detection (same phone/email)

### **Manual Review:**
- All new agents verified manually
- Random property audits
- User-reported flags reviewed within 24 hours

---

# 📊 DATABASE SCHEMA

## **MongoDB Collections**

### **Users Collection:**
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  phone: String (unique, indexed),
  passwordHash: String,
  role: Enum['buyer', 'owner', 'agent', 'admin'],
  profile: {
    name: String,
    avatar: String (S3 URL),
    location: {
      city: String,
      state: String,
      pincode: String
    }
  },
  verification: {
    emailVerified: Boolean,
    phoneVerified: Boolean,
    kycStatus: Enum['pending', 'approved', 'rejected'],
    kycDocuments: [{
      type: String, // 'aadhaar', 'pan', 'rera'
      url: String,
      uploadedAt: Date
    }]
  },
  preferences: {
    budget: { min: Number, max: Number },
    propertyTypes: [String],
    locations: [String]
  },
  subscription: {
    plan: Enum['free', 'starter', 'professional', 'agency'],
    validUntil: Date,
    autoRenew: Boolean
  },
  stats: {
    propertiesListed: Number,
    propertiesSold: Number,
    totalCommission: Number,
    rating: Number,
    reviewCount: Number
  },
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

**Indexes:**
- email (unique)
- phone (unique)
- role
- createdAt (descending)

---

### **Properties Collection:**
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: users),
  agentId: ObjectId (ref: users, optional),
  
  basic: {
    title: String (indexed, text),
    description: String (text),
    propertyType: Enum['apartment', 'villa', 'house', ...],
    listingType: Enum['sale', 'rent', 'lease'],
    category: Enum['residential', 'commercial', 'plot']
  },
  
  location: {
    address: String,
    landmark: String,
    city: String (indexed),
    state: String,
    pincode: String (indexed),
    coordinates: {
      type: "Point",
      coordinates: [longitude, latitude] // GeoJSON
    }
  },
  
  specifications: {
    carpetArea: Number,
    builtUpArea: Number,
    plotArea: Number,
    bedrooms: Number,
    bathrooms: Number,
    balconies: Number,
    parking: { covered: Number, open: Number },
    floor: Number,
    totalFloors: Number,
    furnishing: Enum['unfurnished', 'semi', 'fully'],
    age: Number (years),
    facing: String,
    possession: String
  },
  
  amenities: [String], // array of amenity IDs
  
  pricing: {
    expectedPrice: Number (indexed),
    priceNegotiable: Boolean,
    pricePerSqft: Number,
    maintenanceCharges: Number,
    securityDeposit: Number,
    tokenAmount: Number
  },
  
  media: {
    images: [{
      url: String (S3 URL),
      caption: String,
      isCover: Boolean,
      order: Number
    }],
    documents: [{
      type: String,
      url: String,
      uploadedAt: Date
    }]
  },
  
  aiData: {
    valuationScore: Number, // 0-100
    estimatedValue: Number,
    valueRange: { min: Number, max: Number },
    confidence: Number,
    investmentScore: Number,
    marketPosition: String,
    comparableCount: Number,
    lastCalculated: Date
  },
  
  status: {
    state: Enum['draft', 'pending', 'active', 'featured', 
                'inactive', 'sold', 'expired', 'rejected', 'flagged'],
    verificationStatus: Enum['pending', 'verified', 'rejected'],
    rejectionReason: String,
    expiresAt: Date,
    soldAt: Date,
    soldPrice: Number
  },
  
  analytics: {
    views: Number,
    uniqueViews: Number,
    inquiries: Number,
    favorites: Number,
    shares: Number,
    viewsByDate: [{
      date: Date,
      count: Number
    }]
  },
  
  featured: {
    isFeatured: Boolean,
    featuredUntil: Date,
    featuredOrderPriority: Number
  },
  
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date
}
```

**Indexes:**
- location.coordinates (2dsphere for geo queries)
- location.city
- pricing.expectedPrice
- status.state
- basic.propertyType
- createdAt (descending)
- Compound: (location.city, pricing.expectedPrice, status.state)
- Text index: (basic.title, basic.description, location.address)

---

### **Leads Collection:**
```javascript
{
  _id: ObjectId,
  propertyId: ObjectId (ref: properties),
  agentId: ObjectId (ref: users),
  buyerId: ObjectId (ref: users),
  
  contact: {
    name: String,
    email: String,
    phone: String,
    preferredContact: Enum['phone', 'email', 'whatsapp']
  },
  
  inquiry: {
    message: String,
    interestedIn: Enum['buying', 'renting', 'more_info'],
    budget: { min: Number, max: Number },
    timeline: String,
    preferredViewingTime: Date
  },
  
  aiScore: {
    score: Number, // 0-100
    category: Enum['hot', 'warm', 'cold'],
    factors: {
      budgetMatch: Number,
      engagement: Number,
      responseSpeed: Number,
      actionIntent: Number,
      profileComplete: Number
    },
    recommendation: String,
    lastCalculated: Date
  },
  
  engagement: {
    propertyViews: Number,
    timeSpent: Number, // seconds
    repeatVisits: Number,
    savedToFavorites: Boolean,
    sharedProperty: Boolean
  },
  
  interactions: [{
    type: Enum['call', 'email', 'message', 'viewing', 'note'],
    byUser: ObjectId (ref: users),
    content: String,
    timestamp: Date
  }],
  
  status: Enum['new', 'contacted', 'viewing_scheduled', 
              'negotiating', 'converted', 'lost', 'spam'],
  
  viewing: {
    scheduled: Boolean,
    dateTime: Date,
    attended: Boolean,
    feedback: String
  },
  
  conversion: {
    converted: Boolean,
    convertedAt: Date,
    dealValue: Number,
    commission: Number
  },
  
  createdAt: Date,
  updatedAt: Date,
  lastContactedAt: Date
}
```

**Indexes:**
- propertyId
- agentId
- buyerId
- aiScore.score (descending)
- status
- createdAt (descending)

---

### **Transactions Collection:**
```javascript
{
  _id: ObjectId,
  propertyId: ObjectId (ref: properties),
  buyerId: ObjectId (ref: users),
  sellerId: ObjectId (ref: users),
  agentId: ObjectId (ref: users, optional),
  
  type: Enum['sale', 'rent'],
  
  financial: {
    propertyPrice: Number,
    commissionRate: Number, // percentage
    totalCommission: Number,
    agentCommission: Number,
    platformCommission: Number,
    
    payment: {
      tokenAmount: Number,
      tokenPaidAt: Date,
      remainingAmount: Number,
      fullPaymentAt: Date,
      paymentMethod: String
    }
  },
  
  status: Enum['initiated', 'token_paid', 'completed', 'cancelled'],
  
  documents: [{
    type: String, // 'sale_agreement', 'receipt'
    url: String,
    uploadedAt: Date
  }],
  
  timeline: [{
    event: String,
    timestamp: Date,
    notes: String
  }],
  
  createdAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}
```

---

## **Redis Cache Structure**

### **Session Storage:**
```
Key: session:{userId}
Value: {
  token: "jwt_token",
  role: "agent",
  lastActivity: timestamp,
  deviceInfo: {}
}
TTL: 7 days
```

### **API Response Cache:**
```
Key: property:{propertyId}
Value: JSON of property data
TTL: 5 minutes

Key: search:{hash(filters)}
Value: Array of property IDs
TTL: 2 minutes
```

### **Real-time Counters:**
```
Key: views:property:{propertyId}:{date}
Value: count
Increment on each view
```

---

## **Elasticsearch Index Mapping**

### **Properties Index:**
```json
{
  "mappings": {
    "properties": {
      "title": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text" },
      "location": {
        "type": "geo_point"
      },
      "city": { "type": "keyword" },
      "price": { "type": "integer" },
      "bedrooms": { "type": "integer" },
      "propertyType": { "type": "keyword" },
      "amenities": { "type": "keyword" },
      "createdAt": { "type": "date" }
    }
  }
}
```

---

# 🔄 API ARCHITECTURE

## **RESTful API Design**

### **Base URL:**
```
Production: https://api.indiapropertyads.com/v1
Staging: https://api-staging.indiapropertyads.com/v1
Development: http://localhost:5000/api/v1
```

### **API Versioning:**
- Version in URL path: `/v1/`, `/v2/`
- Maintain backward compatibility
- Deprecation notices 3 months in advance

---

## **Response Format**

### **Success Response:**
```json
{
  "success": true,
  "data": {
    // response data
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  },
  "timestamp": "2025-10-26T10:30:00Z"
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2025-10-26T10:30:00Z"
}
```

---

# 🚀 DEPLOYMENT ARCHITECTURE

## **Production Environment**

### **Server Configuration:**
- **Web Server:** 2x EC2 t3.medium (4GB RAM, 2 vCPU)
- **API Server:** 2x EC2 t3.large (8GB RAM, 2 vCPU)
- **Database:** MongoDB Atlas M30 (8GB RAM, dedicated)
- **Cache:** ElastiCache Redis (2GB)
- **Search:** Elasticsearch Service (2 nodes)
- **Load Balancer:** AWS ALB
- **CDN:** CloudFront

### **Scaling Strategy:**
- **Horizontal:** Auto-scaling based on CPU >70%
- **Vertical:** Upgrade instance types as needed
- **Database:** Sharding after 100M documents

---

## **Monitoring & Alerting**

### **Key Metrics:**
- Response time (p50, p95, p99)
- Error rate (<1% target)
- Uptime (99.9% SLA)
- Database query performance
- Cache hit rate (>80%)
- API rate limit breaches

### **Alerts:**
- Error rate >2%: Immediate (PagerDuty)
- Server down: Immediate
- High CPU/Memory: Warning
- SSL cert expiry: 7 days notice

---

This technical architecture provides a solid foundation for MVP1. Ready to scale to millions of users! 

Would you like me to create:
1. API Endpoints documentation
2. Development timeline & milestones
3. Testing strategy
4. Cost estimation

Let me know what you need next! 🚀
