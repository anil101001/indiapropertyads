# 🚀 MVP1 - Core Features Detailed Specification

## **Status:** ✅ APPROVED BY CUSTOMER

**Timeline:** 8-12 Weeks  
**Budget:** To be finalized  
**Team:** Full-stack developers, AI/ML engineer, UI/UX designer, QA

---

# 📋 CORE FEATURES BREAKDOWN

## **1. USER MANAGEMENT & AUTHENTICATION**

### **1.1 User Roles**

#### **A. Buyer/Renter**
- Browse unlimited properties
- Search with advanced filters
- View AI valuations
- Save favorites (wishlist up to 50)
- Contact agents/owners
- Schedule viewings
- Track inquiry history
- Receive email/SMS notifications
- Compare up to 4 properties
- Get personalized recommendations

#### **B. Property Owner**
- List unlimited properties (free tier: 3 active, paid: unlimited)
- Multi-step listing form with AI assistance
- Upload up to 20 images per property
- Get AI price suggestions in real-time
- View listing analytics (views, inquiries, favorites)
- Edit listings anytime
- Mark as sold/rented
- Respond to inquiries via dashboard
- Upgrade to featured listing (₹999/property/month)
- KYC verification for trust badge

#### **C. Real Estate Agent**
- All owner capabilities +
- AI lead scoring (Hot/Warm/Cold: 65-95% scores)
- Lead management CRM
- Commission tracking dashboard
- Performance analytics
- Bulk property upload (CSV import)
- Team collaboration (assign properties)
- Client database management
- Monthly subscription: ₹2,999
- Quarterly subscription: ₹7,999 (save 11%)

#### **D. Platform Admin**
- Full platform oversight
- User management (approve/block/verify)
- Property moderation (approve/reject listings)
- Revenue analytics dashboard
- Fraud detection monitoring
- Support ticket management
- System configuration
- Generate reports (revenue, users, properties)
- AI model monitoring

---

### **1.2 Registration & Verification**

#### **Buyer Registration (Simple - 2 minutes):**
1. Email + Password
2. Email OTP verification
3. Phone number + OTP
4. Basic info (name, location)
5. Preferences (budget, property type)
6. Account active immediately

#### **Owner Registration (Moderate - 5 minutes + verification):**
1. Email + Password
2. Email/Phone OTP
3. Full name, address
4. KYC upload (Aadhaar + PAN)
5. Property ownership proof (optional for first listing)
6. Admin verification (24-48 hours)
7. Verified badge after approval

#### **Agent Registration (Detailed - 10 minutes + verification):**
1. Email + Password + Phone
2. OTP verification
3. RERA registration number (mandatory)
4. RERA certificate upload
5. Operating areas selection (cities)
6. Bank details (for commission payouts)
7. Business documents (GST if applicable)
8. Admin review (48-72 hours)
9. Approved agents get verified badge

#### **Login Options:**
- Email/Phone + Password
- Google Sign-In (OAuth)
- Facebook Login (OAuth)
- Remember me (30-day session)
- Forgot password (email reset link with OTP)
- 2FA for agents/admins (optional, via SMS/Email)

---

## **2. PROPERTY LISTING CREATION**

### **2.1 Multi-Step Form (4 Steps)**

#### **Step 1: Basic Information**
**Fields:**
- Property Title (max 100 characters)
- Property Type:
  - **Residential:** Apartment, Villa, Independent House, Penthouse, Studio Apartment, Builder Floor
  - **Commercial:** Office Space, Shop/Showroom, Warehouse, Commercial Land, Co-working Space
  - **Plot/Land:** Residential Plot, Commercial Plot, Agricultural Land, Industrial Plot
- Listing Type: For Sale / For Rent / PG/Hostel / Lease
- Description (rich text editor, 50-2000 words)
  - Auto-save draft every 30 seconds
  - Formatting: Bold, italic, bullets, numbers

**Validation:**
- Title required, no spammy keywords
- Description minimum 50 words
- Type selections required

---

#### **Step 2: Location Details**
**Fields:**
- Complete Address (street, building name)
- Landmark (optional but recommended)
- City (dropdown: 50+ major cities)
- State (auto-populated based on city)
- Pincode (6 digits, auto-validates)
- **Google Maps Integration:**
  - Auto-populate lat/long from address
  - Draggable pin for exact location
  - Street view preview
  - Boundary verification (property within city limits)

**Nearby Landmarks (Auto-detected by AI):**
- Shows 5-10 nearby points of interest
- Schools, hospitals, metro stations, malls
- Owner can edit/add more

**Validation:**
- All address fields mandatory
- Pincode must match city
- Map coordinates required

---

#### **Step 3: Property Specifications + AI Pricing**

**Specifications:**
- **Area:**
  - Carpet Area (sqft/sqm toggle)
  - Built-up Area (optional)
  - Plot Area (for independent houses)
- **Configuration:**
  - Bedrooms: 0-10+ (0 for studio)
  - Bathrooms: 1-10+
  - Balconies: 0-5+
- **Parking:**
  - Covered parking (count)
  - Open parking (count)
- **Floor Details** (if apartment):
  - Floor number
  - Total floors in building
- **Property Age:**
  - Under construction
  - Ready to move
  - 0-1 year
  - 1-5 years
  - 5-10 years
  - 10+ years
- **Furnishing Status:**
  - Unfurnished
  - Semi-furnished (list: AC, Lights, Fans, Wardrobes)
  - Fully furnished (add: Sofa, Bed, Kitchen appliances)
- **Facing Direction:**
  - North, South, East, West, North-East, North-West, South-East, South-West
- **Possession Status:**
  - Immediate
  - Within 1 month
  - Within 3 months
  - Within 6 months
  - Under construction (expected date)

**Amenities (Multi-select - 30+ options):**
- ✅ Swimming Pool
- ✅ Gymnasium
- ✅ Club House
- ✅ Children's Play Area
- ✅ Landscaped Garden
- ✅ 24/7 Security
- ✅ CCTV Surveillance
- ✅ Power Backup (full/partial)
- ✅ Lift/Elevator
- ✅ Reserved Parking
- ✅ Visitor Parking
- ✅ Intercom Facility
- ✅ Piped Gas
- ✅ Water Softener
- ✅ Rain Water Harvesting
- ✅ Waste Disposal
- ✅ Fire Safety
- ✅ Maintenance Staff
- ✅ Wifi/Broadband
- ✅ DTH/Cable TV
- ✅ Jogging/Cycling Track
- ✅ Party Hall
- ✅ Senior Citizen Sit-out
- ✅ Indoor Games
- ✅ Shopping Center
- ✅ Multipurpose Hall
- ✅ Library
- ✅ Amphitheatre
- ✅ Meditation Area
- ✅ Spa/Jacuzzi

**🤖 AI Price Suggestion Engine:**

**How it works:**
1. As owner fills area + location → Initial estimate appears
2. Adds amenities → Price updates in real-time
3. Selects configuration → Refinement based on market data
4. Final output:
   ```
   ┌───────────────────────────────────────────┐
   │ 🤖 AI Price Suggestion                    │
   ├───────────────────────────────────────────┤
   │ Recommended Price:    ₹1.32 Crore        │
   │ Market Range:         ₹1.25 - ₹1.38 Cr  │
   │ Price/sqft:           ₹9,103            │
   ├───────────────────────────────────────────┤
   │ Based on 523 similar properties          │
   │ in Bandra West within last 6 months      │
   │                                          │
   │ 🔵 Competitive pricing                   │
   │ Expected to sell in 30-45 days           │
   │                                          │
   │ [Accept AI Price] [Enter Custom Price]   │
   └───────────────────────────────────────────┘
   ```

**Owner Actions:**
- Accept AI suggestion (one-click)
- Enter custom price (AI shows comparison)
- View market analysis (chart with comparable properties)
- See price distribution in area

**Pricing Fields:**
- Expected Price (required)
- Price Negotiable: Yes/No
- Maintenance Charges (₹ per month)
- Security Deposit (for rent - typically 2-6 months)
- Token Amount (booking amount)

**Validation:**
- Area must be > 0
- Price must be > 0
- If price >40% from AI suggestion → warning popup
- Maintenance charges reasonable check

---

#### **Step 4: Images & Documents**

**Image Upload:**
- **Requirements:**
  - Minimum: 3 images (enforced)
  - Maximum: 20 images
  - Formats: JPG, PNG, WEBP
  - Max size: 5MB per image
  - Total upload limit: 50MB
- **Features:**
  - Drag-and-drop interface
  - Multiple file selection
  - Auto-compression (optimize for web)
  - Image reordering (drag to rearrange)
  - Set cover image (first image default)
  - Add captions (optional)
  - Delete/replace images

**🤖 AI Image Analysis (Real-time):**
After each image uploads:
```
Analyzing image 3 of 8...
✓ High quality (1920x1080)
✓ Detected: Living Room
✓ Good lighting and composition
✓ No inappropriate content
```

**Final Analysis Summary:**
```
┌──────────────────────────────────────────┐
│ ✅ Image Analysis Complete               │
├──────────────────────────────────────────┤
│ ✓ All 8 images are high quality         │
│ ✓ Detected rooms:                        │
│   - 2 Bedrooms                           │
│   - 1 Living Room                        │
│   - 1 Kitchen                            │
│   - 1 Bathroom                           │
│   - 2 Exterior views                     │
│   - 1 Building amenity                   │
│ ✓ Good lighting in 7/8 images            │
│ ✓ No duplicates found                    │
│                                          │
│ ⚡ Suggestion: Add 2 more images         │
│    Recommended: Balcony view, Parking    │
└──────────────────────────────────────────┘
```

**Document Upload (Optional):**
- Property papers (sale deed, allotment letter)
- RERA certificate (for under-construction)
- NOC (No Objection Certificate)
- Occupancy certificate
- Floor plan/blueprint
- Tax receipts
- Encumbrance certificate
- **Max 5 documents, 10MB each**

**Preview & Submit:**
- Full property preview card
- Edit any section (back navigation)
- Terms & conditions checkbox:
  - "I confirm property details are accurate"
  - "I have legal rights to sell/rent"
  - "I agree to platform terms"
- **Submit** button:
  - Owners → "Submit for Verification"
  - Agents → "Publish Immediately" (pre-verified)

---

### **2.2 Property States & Workflow**

**State Machine:**

1. **Draft** - Auto-saved, incomplete listing
2. **Pending Review** - Submitted by owner, awaiting admin
3. **Verified** - Approved by admin
4. **Active/Published** - Live on platform
5. **Featured** - Paid boost (highlighted in search)
6. **Paused** - Owner temporarily inactive
7. **Sold/Rented** - Transaction completed
8. **Expired** - Listing period ended (3 months default)
9. **Rejected** - Failed verification with reason
10. **Flagged** - Reported by users, under investigation

**Verification Process (24-48 hours):**
1. **Auto-checks** (immediate):
   - AI fraud detection (price anomaly, stolen images)
   - Completeness check (all required fields)
   - Image quality validation
2. **Manual review** (by admin):
   - Verify documents if uploaded
   - Cross-check RERA details
   - Contact owner if clarification needed
3. **Approval/Rejection:**
   - Email + SMS notification
   - If rejected: Detailed reason + option to edit & resubmit

---

## **3. SEARCH & DISCOVERY**

### **3.1 Advanced Search**

**Search Inputs:**
- **Text search:** Location, landmark, project name
- **Auto-suggestions:** Top 10 relevant matches
- **Voice search:** "Show me 3BHK in Bandra under 1.5 crore"

**Filters (Left Panel):**

**Location:**
- City (multi-select, max 3)
- Locality (autocomplete, top 100 per city)
- Nearby (1km, 3km, 5km, 10km, 20km radius)

**Property Type:**
- Apartment, Villa, House, Penthouse, Studio
- Commercial, Plot/Land
- PG/Hostel

**Budget:**
- Slider: ₹10L - ₹10Cr+
- Quick filters: <₹50L, ₹50L-₹1Cr, ₹1-2Cr, ₹2-5Cr, ₹5Cr+

**Configuration:**
- BHK: 1, 2, 3, 4, 5+
- Bathrooms: 1, 2, 3, 4+

**Area Range:**
- Carpet area: 300-5000+ sqft
- Slider with min-max handles

**Amenities (Top 12):**
- Parking, Gym, Pool, Security, Lift, Power Backup
- Garden, Club, Play Area, Intercom, Gas, Water

**More Filters (Expandable):**
- Posted by: Owner, Agent, Builder
- Furnishing: Any, Furnished, Unfurnished
- Possession: Immediate, Under construction
- Age: <1yr, 1-5yr, 5-10yr, 10+yr
- Verified only (toggle)
- With photos only (toggle)
- AI score: 70+, 80+, 90+

**Sort Options:**
- Relevance (AI-ranked, default)
- Price: Low to High / High to Low
- Newest First / Oldest First
- Most Viewed
- AI Score (Best Match)
- Area: Large to Small
- Distance (if location selected)

---

### **3.2 Property Listing Page**

**View Modes:**
- **Grid View** (default): 3 columns, image-heavy
- **List View**: Detailed info, single column
- **Map View**: Properties on interactive map

**Property Card Components:**
```
┌─────────────────────────────────────┐
│  [Property Image - 16:9 ratio]     │
│  🤖 92%  ✓ Verified  ⭐ Featured   │
├─────────────────────────────────────┤
│  ₹1.25 Cr              ❤️ 24       │
│  3 BHK Luxury Apartment             │
│  📍 Bandra West, Mumbai             │
│  🛏️ 3  🛁 2  📐 1450 sqft  🚗 2   │
│  👁️ 342 views  📅 2 days ago      │
│  ─────────────────────────────────  │
│  [View Details]  [Contact Owner]    │
└─────────────────────────────────────┘
```

**Pagination:**
- 20 properties per page
- "Load More" button (infinite scroll option)
- Page numbers: 1, 2, 3, ..., Last

**Save Search:**
- Save current filter combination
- Get email alerts for new matches
- Manage saved searches in profile

---

### **3.3 Property Detail Page**

**Page Sections (Top to Bottom):**

1. **Hero Gallery**
   - Main image (large, 16:9)
   - Thumbnail strip (horizontal scroll)
   - Navigation arrows
   - Fullscreen lightbox
   - Image counter (3 / 15)

2. **Property Header**
   - Title, location (with map pin icon)
   - Badges: Verified, Featured, Hot Deal
   - AI Score badge (92%)
   - Quick actions: Save, Share, Report

3. **Price & Key Stats**
   - Large price display
   - Price per sqft
   - BHK, bath, area, parking
   - Floor, facing, age

4. **🤖 AI Valuation Section** (Prominent)
   - Gradient blue box
   - Estimated value
   - Value range (min-max)
   - Market comparison
   - Investment score
   - Confidence percentage

5. **Description**
   - Owner's description (formatted)
   - Read more/less toggle
   - Highlights in bullets

6. **Amenities Grid**
   - Icons with checkmarks
   - 4-column grid
   - Grouped by category

7. **Location & Map**
   - Interactive Google Map
   - Nearby places (4 categories)
   - Distance indicators
   - Directions button

8. **Property Details Table**
   - All specifications
   - 2-column layout
   - Easy scan format

9. **Similar Properties**
   - AI-recommended (3-4 cards)
   - Match percentage shown
   - Quick view option

10. **Contact Section** (Sticky Sidebar)
    - Agent/owner photo
    - Name, rating, reviews
    - Contact buttons (call, email, WhatsApp)
    - Schedule viewing form
    - Quick inquiry form

---

## **4. AI FEATURES IMPLEMENTATION**

### **4.1 AI Property Valuation**

**Model Specification:**
- Algorithm: XGBoost (Gradient Boosting)
- Training Data: 100K+ property transactions
- Features: 50+ (area, location, amenities, market trends)
- Accuracy: 92-95% (±8% of actual)
- Update Frequency: Weekly retaining with latest data

**Input Variables:**
- Property attributes (area, BHK, age, floor)
- Location (city, locality, pincode, coordinates)
- Amenities count and premium amenities
- Market data (recent sales, average prices, trends)
- Distance to key locations (CBD, metro, schools)

**Output:**
```json
{
  "estimated_value": 13200000,
  "confidence": 92,
  "value_range": {"min": 11800000, "max": 13500000},
  "price_per_sqft": 9103,
  "market_comparison": {
    "area_average": 12500000,
    "difference_percent": 5.6,
    "position": "slightly_above"
  },
  "comparable_count": 523,
  "investment_score": 85,
  "resale_forecast_3yr": 15200000
}
```

---

### **4.2 AI Lead Scoring**

**Scoring Algorithm:**

**Factors (Weighted):**
1. **Budget Match (30%):**
   - Perfect match (±5%): 30 points
   - Good match (±15%): 20 points
   - Acceptable (±25%): 10 points
   - Mismatch (>25%): 0 points

2. **Engagement Level (25%):**
   - Multiple views (3+): 25 points
   - Return visits: +10 points
   - Time on page (>3 min): +5 points
   - Saved to favorites: +10 points

3. **Response Speed (20%):**
   - <2 hours: 20 points
   - 2-12 hours: 15 points
   - 12-24 hours: 10 points
   - >24 hours: 5 points

4. **Action Intent (15%):**
   - Scheduled viewing: 15 points
   - Detailed inquiry: 10 points
   - Quick question: 5 points
   - Generic inquiry: 2 points

5. **Profile Completeness (10%):**
   - Verified phone + email: 10 points
   - Partially verified: 5 points
   - Not verified: 0 points

**Total Score: 0-100**

**Categories:**
- **🔥 Hot (85-100):** Priority 1, contact immediately
- **⚡ Warm (70-84):** Priority 2, follow up within 24 hrs
- **❄️ Cold (0-69):** Priority 3, nurture with content

**Agent Dashboard Display:**
```
Lead: Amit Sharma (Score: 92 🔥)
─────────────────────────────────────
Budget: ₹1.2-1.4 Cr ✓ Perfect Match
Property Views: 4 (3 of this property)
Last Active: 2 hours ago
Response Time: Average 18 minutes
Viewing: Scheduled for tomorrow 11 AM

🤖 AI Recommendation:
Very high conversion probability
Action: Call within 1 hour
Talking Points:
• Highlight ROI potential (market growing 8%/yr)
• Mention 2 similar units sold last month
• Offer flexible payment terms if needed
```

---

### **4.3 AI Price Suggestions**

**For Property Listing:**

Real-time calculator as owner enters data:
- Initial estimate based on location + area
- Updates with each amenity added
- Refines with configuration (BHK, floor, age)
- Final suggestion with confidence level

**Display:**
```
🤖 Your Property Analysis
───────────────────────────────────────
Suggested Price: ₹1.32 Crore
Competitive Range: ₹1.25 - ₹1.38 Cr
Price per sqft: ₹9,103

Based on 12 similar properties in your area:
• 2 sold in last 30 days at ₹1.28 Cr avg
• 10 active listings at ₹1.35 Cr avg
• Market trend: ↑ 3% in last quarter

Market Tag: 🔵 Competitive Pricing
Expected Time to Sell: 30-45 days
Likelihood to Get Full Price: 85%

[Accept This Price] [I'll Set My Own]
```

---

### **4.4 AI Image Analysis**

**Processing Pipeline:**
1. Upload → Compress → Analyze → Store → Display

**Analysis Components:**

**Quality Checks:**
- Resolution (min 1280x720 recommended)
- Blur detection (reject very blurry)
- Brightness/contrast (adjust if needed)
- File corruption check

**Content Recognition:**
- Room type (bedroom, kitchen, living, bath, balcony)
- Scene understanding (interior vs exterior)
- Object detection (furniture, appliances)
- Quality score (composition, lighting)

**Safety Checks:**
- Inappropriate content filter
- Watermark detection
- Duplicate image check
- Reverse image search (anti-theft)

**Output:**
```
Image 3: Living Room
✓ Quality: Excellent (1920x1080)
✓ Lighting: Natural, well-lit
✓ Composition: Good framing
✓ Objects: Sofa, TV unit, Curtains
Quality Score: 94/100
```

---

### **4.5 AI Recommendations**

**Similar Properties Algorithm:**

**Matching Criteria:**
1. **Location (40%):** Same city, nearby localities
2. **Price Range (30%):** ±20% of viewed property
3. **Configuration (20%):** Same/adjacent BHK
4. **Amenities (10%):** At least 60% overlap

**Ranking:**
- Match score: 0-100%
- Sort by: Score → AI valuation → Recency
- Filter: Only verified listings
- Limit: Top 3-4 recommendations

**Display:**
```
🤖 Similar Properties You Might Like

[Property Card 1]  Match: 91%
Similar price, same area, better view

[Property Card 2]  Match: 89%
Slightly larger, same amenities

[Property Card 3]  Match: 88%
Nearby location, immediate possession
```

---

## **5. COMMISSION & PAYMENTS**

### **5.1 Commission Structure**

**For Property Sales:**
- Standard Rate: 1.5% of property value
- Split: 70% to agent, 30% to platform
- Minimum Commission: ₹25,000
- Maximum Commission: ₹5,00,000 per transaction

**Example:**
```
Property Sold: ₹1.25 Crore
Total Commission (1.5%): ₹1,87,500
Agent Receives: ₹1,31,250
Platform Receives: ₹56,250
```

**For Rentals:**
- Standard Rate: 1 month rent
- Split: 60% to agent, 40% to platform
- Paid by tenant OR owner (negotiable)

### **5.2 Subscription Plans**

**For Agents:**
| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0 | 3 active listings, basic lead info |
| Starter | ₹2,999/month | 25 listings, AI lead scoring, analytics |
| Professional | ₹7,999/quarter | Unlimited listings, priority support, bulk upload |
| Agency | ₹24,999/year | Multi-user, team management, API access |

**For Owners (Individual):**
- Free: 1 active listing, basic features
- Premium: ₹999/property/month → Featured listing, top of search

**Payment Methods:**
- Credit/Debit Cards (Razorpay)
- UPI (GPay, PhonePe, Paytm)
- Net Banking
- Wallets (Paytm, PhonePe)

---

## **6. ADMIN DASHBOARD**

### **6.1 Key Metrics**

**Platform Overview:**
- Total Users (buyers, owners, agents)
- Total Properties (active, sold, pending)
- Monthly Revenue (commissions + subscriptions)
- Active Leads
- Conversion Rate
- Growth trends (7d, 30d, 90d)

**User Management:**
- Pending verifications (agents, owners)
- KYC approval queue
- User reports/complaints
- Blocked/flagged accounts

**Property Management:**
- Pending approvals
- Flagged listings
- Expired listings
- Top performing listings

**Revenue Dashboard:**
- Commission earned (daily, weekly, monthly)
- Subscription revenue
- Featured listing revenue
- Payment gateway status
- Payout pending to agents

**AI Model Performance:**
- Valuation accuracy (actual vs predicted)
- Lead score conversion rate
- Image analysis success rate
- Fraud detection stats

---

This covers the core features in detail. Would you like me to continue with:
- Technical Architecture
- API Endpoints
- Database Schema
- Security & Compliance
- Testing Strategy

Let me know which sections you'd like expanded next!
