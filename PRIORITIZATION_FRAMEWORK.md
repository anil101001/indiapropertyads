# 🎯 Feature Prioritization Framework
**India Property Ads - Decision-Making Guide**

---

## 📐 RICE Scoring Model

Use this to prioritize features objectively:

```
RICE Score = (Reach × Impact × Confidence) / Effort

Where:
- Reach: How many users affected per quarter? (scale: 0-1000+)
- Impact: How much will it help? (scale: 0.25=minimal, 0.5=low, 1=medium, 2=high, 3=massive)
- Confidence: How sure are we? (scale: 50%=low, 80%=medium, 100%=high)
- Effort: Team-months to build (scale: 0.5=days, 1=week, 2=weeks, 4=month, 8=quarter)
```

### Example Scoring

| Feature | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------|-------|--------|------------|--------|------------|----------|
| Agent Verification | 200 | 3 | 100% | 1 | 600 | 🔴 High |
| AI Lead Scoring | 500 | 2 | 80% | 2 | 400 | 🔴 High |
| WhatsApp Integration | 1000 | 2 | 80% | 4 | 400 | 🔴 High |
| Neighborhood Pages | 5000 | 1 | 100% | 2 | 2500 | 🔴 High |
| Chatbot MVP | 800 | 1 | 80% | 1 | 640 | 🟡 Medium |
| Dark Mode | 500 | 0.25 | 100% | 0.5 | 250 | 🟢 Low |
| VR Tours | 100 | 2 | 50% | 8 | 12.5 | 🟢 Low |

---

## 🎯 North Star Metric

**Primary:** Verified Leads Generated per Month
- Measures platform value
- Impacts revenue directly
- Easy to track

**Secondary Metrics:**
1. Lead Quality Score (agent feedback)
2. Lead-to-Visit Conversion Rate
3. Agent Monthly Retention Rate
4. Buyer Search-to-Inquiry Rate

**Vanity Metrics to Avoid:**
- ❌ Total signups (without activation)
- ❌ Page views (without engagement)
- ❌ Social media followers (without conversion)

---

## 🚦 Feature Prioritization Matrix

### 🔴 P0 (Must Have - Ship This Sprint)
**Criteria:** Core to MVP, blocks other features, or critical bug

Examples:
- Agent verification system
- Basic lead scoring
- Email/OTP delivery
- Search & filter functionality
- Security patches

### 🟠 P1 (Should Have - Next Sprint)
**Criteria:** High impact, differentiates us, requested by multiple users

Examples:
- AI lead scoring (ML-based)
- Neighborhood intelligence
- Review & rating system
- WhatsApp notifications

### 🟡 P2 (Nice to Have - Backlog)
**Criteria:** Good idea, but not urgent, low effort

Examples:
- Property comparison tool
- Saved searches
- Dark mode
- Email digest
- Share buttons

### 🟢 P3 (Won't Have - Parking Lot)
**Criteria:** Innovation/future, high effort, unclear ROI

Examples:
- VR tours
- Blockchain verification
- Metaverse properties
- Voice search
- AR property visualization

---

## 🧭 Strategic Alignment Check

Before building ANY feature, answer these 5 questions:

### 1. Does it solve a REAL pain point?
- [ ] Validated through agent/buyer interviews?
- [ ] Data shows this is a top complaint?
- [ ] Competitors failing at this?

### 2. Does it move the North Star Metric?
- [ ] Increases verified leads?
- [ ] Improves lead quality?
- [ ] Boosts agent retention?

### 3. Can we build it with current resources?
- [ ] Team has skills?
- [ ] No external dependencies?
- [ ] Can ship in <4 weeks?

### 4. Is this the RIGHT time?
- [ ] Foundation features done?
- [ ] Market ready for this?
- [ ] Not distracting from core?

### 5. What's the opportunity cost?
- [ ] What are we NOT building by doing this?
- [ ] Is there a higher-leverage feature?

**If 3+ answers are NO → Deprioritize**

---

## 🎨 The Build vs Buy vs Partner Decision Tree

```
Is this a core differentiator?
├─ YES → Build in-house
│  └─ Examples: AI lead scoring, verification system
│
└─ NO → Is this available as API/SaaS?
   ├─ YES → Buy/Integrate
   │  └─ Examples: Payment gateway, SMS/Email, Maps
   │
   └─ NO → Can we partner?
      ├─ YES → Partnership
      │  └─ Examples: Builder inventory, property photos
      │
      └─ NO → Build minimal version or skip
```

---

## 💰 Revenue Impact Assessment

### High Revenue Potential (Build First)
- ✅ Pay-per-lead marketplace
- ✅ Premium agent subscriptions
- ✅ Property boosting
- ✅ Featured listings
- ✅ Lead intelligence tools

### Medium Revenue Potential (Build Later)
- 🟡 Advertising (display ads)
- 🟡 Builder partnerships (commission)
- 🟡 Affiliate (home loans, insurance)
- 🟡 Data licensing (to banks, etc.)

### Low Revenue Potential (Nice to Have)
- 🟢 Freemium features
- 🟢 Community forums
- 🟢 Educational content
- 🟢 Free tools (calculators)

---

## 🔄 The MVP → MMP → MLP Journey

### MVP (Minimum Viable Product)
**Goal:** Validate core hypothesis
**Timeline:** Weeks 1-8
**Features:**
- Agent profiles + verification
- Property listings (CRUD)
- Search & filters
- Basic inquiry system
- Lead scoring (rule-based)

**Success Criteria:**
- 50 agents onboarded
- 100 inquiries generated
- Lead quality >3/5 (agent feedback)

---

### MMP (Minimum Marketable Product)
**Goal:** Ready to acquire paying customers
**Timeline:** Weeks 9-24
**Features:**
- All MVP features +
- AI lead scoring (ML)
- Reputation system
- Neighborhood intelligence
- WhatsApp integration
- Chatbot MVP

**Success Criteria:**
- 200 active agents
- 1000 inquiries/month
- 10% paying customers
- LTV > CAC

---

### MLP (Minimum Lovable Product)
**Goal:** Users love it, high retention
**Timeline:** Weeks 25-52
**Features:**
- All MMP features +
- Personalized feed
- Advanced agent CRM
- Mobile app
- Builder partnerships
- Analytics dashboard

**Success Criteria:**
- NPS >50
- Agent retention >80%
- Organic growth >30% MoM
- Profitability (or clear path)

---

## 🧪 The Experimentation Framework

### Before Building Big Features

**Step 1: Smoke Test (2 days)**
- Create landing page
- Describe feature
- "Coming Soon" + Email signup
- Target: >10% click-through = validate demand

**Step 2: Wizard of Oz (1 week)**
- Fake the feature (manual behind scenes)
- Example: "AI recommendations" → Human curator
- Test if users find value

**Step 3: Prototype (2 weeks)**
- Build simplest version
- Release to 10 beta users
- Collect feedback

**Step 4: Beta (1 month)**
- Build full feature
- Release to 20% users
- Measure impact

**Step 5: GA (General Availability)**
- Polish & scale
- Release to 100%
- Monitor metrics

---

## 📊 Data-Driven Decision Making

### When to Kill a Feature

**Kill if:**
- 🚫 <10% adoption after 2 months
- 🚫 No measurable impact on North Star
- 🚫 Negative user feedback (NPS drop)
- 🚫 High maintenance cost vs value
- 🚫 Better alternatives found

**Don't kill immediately if:**
- ✅ Early stage (< 1 month live)
- ✅ Poor marketing (not user's fault)
- ✅ Technical issues (fixable)
- ✅ Qualitative love (even if low usage)

### When to Double Down

**Invest more if:**
- 🚀 >30% adoption within 1 month
- 🚀 Positive North Star impact (>10%)
- 🚀 High NPS (>70)
- 🚀 Competitive advantage
- 🚀 Scalable & defensible

---

## 🎯 Weekly Prioritization Ritual

### Every Monday 9am (30 mins)

**Agenda:**
1. **Review Last Week** (5 mins)
   - What shipped?
   - What slipped? Why?
   - Learnings?

2. **Review Metrics** (5 mins)
   - North Star trend
   - User feedback summary
   - Support tickets themes

3. **Prioritize This Week** (15 mins)
   - Top 3 must-dos
   - Known blockers
   - Resource allocation

4. **Look Ahead** (5 mins)
   - Next sprint preview
   - Upcoming risks
   - External dependencies

**Output:** 
- Updated Jira/Notion board
- Team alignment
- Clear sprint goal

---

## 🧠 Mental Models for Product Decisions

### 1. The 80/20 Rule (Pareto Principle)
- 80% of value comes from 20% of features
- Build the critical 20% first
- Say no to the 80% (for now)

### 2. The Kano Model
- **Basic Needs:** Must have (search, listings)
- **Performance Needs:** More is better (speed, accuracy)
- **Excitement Needs:** Delighters (AI insights, chatbot)

Focus: Nail basics → Improve performance → Add delighters

### 3. Jobs To Be Done (JTBD)
Don't ask "What features do users want?"
Ask "What job are users hiring our product to do?"

**Agent's Job:** "Help me find serious buyers faster"
**Buyer's Job:** "Help me find the right property without broker hassle"

Build features that do these jobs BETTER.

### 4. Hooked Model (Habit Formation)
1. **Trigger:** Email, WhatsApp notification
2. **Action:** Search property, contact agent
3. **Reward:** Find dream property, get qualified lead
4. **Investment:** Save property, complete profile

Build loops, not just features.

---

## 🚀 Bias Towards Action

### Avoid Analysis Paralysis

**The 70% Rule:**
- If you're 70% confident → Ship it
- Learn from real users
- Iterate quickly

**The Two-Way Door:**
- Most decisions are reversible
- If it's a two-way door (can undo) → Move fast
- If it's a one-way door (can't undo) → Think deep

Examples:
- UI change → Two-way door (ship fast)
- Database schema → One-way door (think carefully)
- Pricing model → One-way door (test with cohorts)

---

## 🎁 Feature Request Handling

### When Users/Agents Request Features

**Step 1: Understand the WHY**
- Don't ask: "What feature do you want?"
- Ask: "What problem are you trying to solve?"

**Step 2: Check Alternatives**
- Can existing feature solve this?
- Can we tweak something vs build new?

**Step 3: Quantify Demand**
- Is this a one-off or many users want this?
- Create "Feature Request" board
- Users upvote (voting system)

**Step 4: RICE Score It**
- Add to backlog with RICE score
- Review monthly

**Step 5: Communicate**
- "Thanks for the idea!"
- "We've added it to our backlog"
- "We'll consider it based on demand"
- (Don't commit to timeline)

---

## 📝 Feature Spec Template

Before building ANY feature, fill this:

```markdown
## Feature: [Name]

### Problem Statement
[What problem does this solve? For whom?]

### Success Metrics
- Primary: [e.g., Increase leads by 20%]
- Secondary: [e.g., Reduce agent churn by 10%]

### User Stories
- As a [buyer/agent/admin], I want to [action], so that [benefit].

### Requirements (Must Have)
- [ ] Req 1
- [ ] Req 2

### Requirements (Nice to Have)
- [ ] Req 3

### Out of Scope (Explicitly NOT doing)
- [ ] Item 1

### Design Mockups
[Link to Figma]

### Technical Approach
[High-level architecture]

### Dependencies
- External APIs
- Other features
- Third-party services

### Rollout Plan
- Week 1: Dev
- Week 2: QA
- Week 3: Beta (10 users)
- Week 4: GA (100%)

### Rollback Plan
[If feature breaks, how to disable it?]

### Open Questions
- [ ] Question 1
```

---

## 🏆 Prioritization in Action: Real Examples

### Example 1: Dark Mode vs Lead Scoring
**Request:** "Users want dark mode"

**Analysis:**
- Reach: 500 (50% of users may use it)
- Impact: 0.25 (nice-to-have, not critical)
- Confidence: 100%
- Effort: 0.5 weeks
- **RICE: 250**

vs

**Lead Scoring:**
- Reach: 200 agents
- Impact: 3 (massive - core differentiation)
- Confidence: 80%
- Effort: 2 weeks
- **RICE: 240**

**Decision:** Almost tied, but Lead Scoring aligns with North Star (verified leads) → **Build Lead Scoring first**

---

### Example 2: Chatbot vs WhatsApp
**Both are high priority. Which first?**

**Chatbot:**
- Reach: 80% of website visitors = 1000/month
- Impact: 1 (helps discovery)
- Confidence: 80% (unproven in real estate)
- Effort: 2 weeks
- **RICE: 400**

**WhatsApp:**
- Reach: 100% of agents = 200
- Impact: 2 (agents love WhatsApp)
- Confidence: 100% (proven in India)
- Effort: 1 week
- **RICE: 400**

**Decision:** Tied on RICE, but WhatsApp has:
- Higher confidence
- Lower effort
- Proven channel in India

→ **Build WhatsApp first, Chatbot next**

---

## 🎯 Final Checklist: Before Starting Any Feature

- [ ] Problem clearly defined?
- [ ] Success metrics identified?
- [ ] RICE score calculated (>100)?
- [ ] Aligns with North Star?
- [ ] User research done (5+ interviews)?
- [ ] Design mockups ready?
- [ ] Technical feasibility confirmed?
- [ ] Effort estimated (with buffer)?
- [ ] Dependencies resolved?
- [ ] Rollback plan exists?
- [ ] Team has capacity?
- [ ] Stakeholder buy-in?

**If any answer is NO → Don't start yet**

---

**Remember:** Every YES to a feature is a NO to something else.

**Choose wisely. Build strategically. Ship fast. Learn faster. 🚀**
