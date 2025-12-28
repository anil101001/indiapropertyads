# CRM Phase 1 - Complete Documentation

## Overview

Phase 1 CRM transforms IndiaPropertyAds from a simple property listing platform into a lead management system that helps property owners and agents track, nurture, and convert buyer inquiries into successful deals.

---

## Full CRM Cycle Flow

### 1. Lead Generation (Buyer → Seller)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   BUYER     │────▶│  PROPERTY    │────▶│   INQUIRY   │
│  Browses    │     │   DETAIL     │     │    FORM     │
│  Properties │     │    PAGE      │     │             │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │  NEW LEAD   │
                                         │  Created    │
                                         │  status:new │
                                         └─────────────┘
```

**What happens:**
1. Buyer browses property listings
2. Buyer views property detail page
3. Buyer fills inquiry form (name, email, phone, message, preferred contact method)
4. System creates a new Lead/Inquiry with:
   - `status: 'new'`
   - `priority: 'medium'`
   - `source: 'website'`
   - Links to property and buyer/owner

### 2. Lead Pipeline (Seller/Agent Workflow)

```
┌───────┐   ┌───────────┐   ┌────────────┐   ┌────────────┐   ┌─────────────┐   ┌────────────┐
│  NEW  │──▶│ CONTACTED │──▶│ INTERESTED │──▶│ SITE-VISIT │──▶│ NEGOTIATION │──▶│ CLOSED-WON │
└───────┘   └───────────┘   └────────────┘   └────────────┘   └─────────────┘   └────────────┘
                                                                      │
                                                                      ▼
                                                               ┌─────────────┐
                                                               │ CLOSED-LOST │
                                                               └─────────────┘
```

**Pipeline Stages:**

| Stage | Description | Typical Actions |
|-------|-------------|-----------------|
| **New** | Fresh inquiry, not yet contacted | Review lead, prioritize |
| **Contacted** | Initial contact made | Log call/email, gauge interest |
| **Interested** | Buyer shows genuine interest | Share more details, schedule visit |
| **Site-Visit** | Property visit scheduled/done | Conduct tour, gather feedback |
| **Negotiation** | Price/terms discussion | Handle objections, negotiate |
| **Closed-Won** | Deal successful! | Complete paperwork |
| **Closed-Lost** | Deal didn't happen | Log reason, move on |

### 3. Activity Logging

Every interaction with a lead is logged:

```
┌─────────────────────────────────────────────────────────┐
│                    ACTIVITY TYPES                        │
├─────────────────────────────────────────────────────────┤
│  📞 Call      - Phone conversations                      │
│  📧 Email     - Email communications                     │
│  💬 WhatsApp  - WhatsApp messages                        │
│  💬 SMS       - Text messages                            │
│  🏠 Site-Visit - Property tours                          │
│  🤝 Meeting   - In-person meetings                       │
│  📝 Note      - General notes                            │
│  🔄 Status-Change - Pipeline movement (auto-logged)      │
│  ⏰ Follow-up - Follow-up reminders completed            │
└─────────────────────────────────────────────────────────┘
```

### 4. Task Management

```
┌─────────────────────────────────────────────────────────┐
│                      TASK FLOW                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Create Task ──▶ Pending ──▶ In-Progress ──▶ Completed │
│                       │                                  │
│                       └──────────▶ Cancelled             │
│                                                          │
│   Task Types: follow-up, call, email, site-visit,       │
│               meeting, document, other                   │
│                                                          │
│   Priority: low, medium, high, urgent                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5. Quick Response Actions

From any lead view, sellers can instantly:
- 📞 **Call** - Opens phone dialer
- 💬 **WhatsApp** - Opens WhatsApp chat
- 📧 **Email** - Opens email client

---

## System Architecture

### Backend Components

```
backend/src/
├── models/
│   ├── Inquiry.model.ts    # Enhanced with CRM fields
│   ├── Activity.model.ts   # NEW - Activity logging
│   └── Task.model.ts       # NEW - Task management
├── controllers/
│   ├── inquiry.controller.ts  # Existing inquiry CRUD
│   └── crm.controller.ts      # NEW - CRM operations
├── routes/
│   ├── inquiry.routes.ts   # Existing routes
│   └── crm.routes.ts       # NEW - CRM API routes
└── server.ts               # Updated with CRM routes
```

### Frontend Components

```
src/
├── services/
│   └── crmService.ts       # NEW - CRM API client
├── pages/
│   ├── CRMDashboard.tsx    # NEW - Main CRM view
│   └── LeadDetails.tsx     # NEW - Individual lead view
├── components/
│   └── Header.tsx          # Updated with CRM link
└── App.tsx                 # Updated with CRM routes
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/crm/dashboard` | Dashboard stats |
| GET | `/api/v1/crm/leads` | List all leads |
| GET | `/api/v1/crm/leads/:id` | Get lead details |
| PATCH | `/api/v1/crm/leads/:id` | Update lead |
| PATCH | `/api/v1/crm/leads/:id/status` | Quick status update |
| GET | `/api/v1/crm/leads/:id/activities` | Get lead activities |
| POST | `/api/v1/crm/leads/:id/activities` | Add activity |
| POST | `/api/v1/crm/leads/:id/tasks` | Create task |
| GET | `/api/v1/crm/tasks` | Get all tasks |
| PATCH | `/api/v1/crm/tasks/:id` | Update task |
| DELETE | `/api/v1/crm/tasks/:id` | Delete task |

---

## Data Models

### Enhanced Inquiry (Lead) Model

```typescript
{
  // Existing fields
  property: ObjectId,
  buyer: ObjectId,
  owner: ObjectId,
  message: string,
  contactMethod: 'call' | 'email' | 'whatsapp',
  buyerInfo: { name, email, phone },
  
  // NEW CRM Fields
  status: 'new' | 'contacted' | 'interested' | 'site-visit' | 
          'negotiation' | 'closed-won' | 'closed-lost',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  source: 'website' | 'phone' | 'whatsapp' | 'referral' | 'walk-in' | 'other',
  nextFollowUpDate: Date,
  lastContactedAt: Date,
  expectedClosingDate: Date,
  budget: { min: number, max: number },
  notes: string,
  tags: string[]
}
```

### Activity Model

```typescript
{
  inquiry: ObjectId,
  user: ObjectId,
  type: 'call' | 'email' | 'sms' | 'whatsapp' | 'site-visit' | 
        'meeting' | 'note' | 'status-change' | 'follow-up',
  title: string,
  description: string,
  callDetails: { duration, outcome, direction },
  siteVisitDetails: { scheduledAt, completedAt, feedback, rating },
  statusChange: { from, to }
}
```

### Task Model

```typescript
{
  inquiry: ObjectId,
  user: ObjectId,
  assignedTo: ObjectId,
  title: string,
  description: string,
  type: 'follow-up' | 'call' | 'email' | 'site-visit' | 
        'meeting' | 'document' | 'other',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  dueDate: Date,
  reminderDate: Date,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  completedAt: Date
}
```

---

## User Roles & Permissions

| Feature | Buyer | Owner | Agent | Admin |
|---------|-------|-------|-------|-------|
| Create Inquiry | ✅ | ❌ | ❌ | ❌ |
| View Own Inquiries | ✅ | ❌ | ❌ | ✅ |
| View Received Leads | ❌ | ✅ | ✅ | ✅ |
| Update Lead Status | ❌ | ✅ | ✅ | ✅ |
| Log Activities | ❌ | ✅ | ✅ | ✅ |
| Create Tasks | ❌ | ✅ | ✅ | ✅ |
| View CRM Dashboard | ❌ | ✅ | ✅ | ✅ |
| Access Lead Details | ❌ | ✅* | ✅* | ✅ |

*Only for leads they own

---

## UI Screenshots Guide

### CRM Dashboard (`/crm`)
- **Stats Cards**: Total leads, new this week, pending follow-ups, tasks, conversion rate
- **Pipeline Summary**: Clickable status filters with counts
- **List View**: Table with lead info, property, status dropdown, priority, actions
- **Pipeline View**: Kanban-style columns for each status

### Lead Details (`/crm/leads/:id`)
- **Header**: Lead name, contact buttons (Call, WhatsApp, Email)
- **Status Pipeline**: Clickable stages to update status
- **Property Card**: Property info and original inquiry message
- **Tabs**: Activities, Tasks, Notes
- **Sidebar**: Lead details (priority, follow-up date, source), Quick Actions

---

## Conversion Metrics

The dashboard tracks:
- **Total Leads**: All inquiries received
- **New This Week**: Leads created in last 7 days
- **Pending Follow-ups**: Leads with overdue follow-up dates
- **Conversion Rate**: `(Closed-Won / Total Closed) × 100`

