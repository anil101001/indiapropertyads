# CRM Phase 1 - Comprehensive Test Scripts

## Test Environment Setup

### Prerequisites
1. Backend running on `http://localhost:5000`
2. Frontend running on `http://localhost:5173`
3. MongoDB connected
4. Test users created for each role

### Test Users to Create

| Role | Email | Password | Name |
|------|-------|----------|------|
| Buyer | buyer@test.com | Test@123 | Test Buyer |
| Owner | owner@test.com | Test@123 | Test Owner |
| Agent | agent@test.com | Test@123 | Test Agent |
| Admin | admin@test.com | Test@123 | Test Admin |

---

## Test Suite 1: Buyer Flow

### TC-B001: Buyer Registration
**Precondition:** No existing account
**Steps:**
1. Navigate to `/register`
2. Fill form: name, email, phone, password
3. Select role: "Buyer"
4. Submit form

**Expected:**
- Account created successfully
- Redirect to login or verification page
- Welcome email sent (if configured)

---

### TC-B002: Buyer Login
**Precondition:** Buyer account exists
**Steps:**
1. Navigate to `/login`
2. Enter buyer credentials
3. Click Login

**Expected:**
- Login successful
- Redirect to home page
- User menu shows "My Dashboard" option

---

### TC-B003: Browse Properties
**Precondition:** Logged in as buyer, properties exist
**Steps:**
1. Navigate to `/properties`
2. Apply filters (property type, price range, location)
3. View property cards

**Expected:**
- Properties displayed with images, price, location
- Filters work correctly
- Pagination works

---

### TC-B004: View Property Detail
**Precondition:** Logged in as buyer
**Steps:**
1. Click on any property card
2. View property detail page

**Expected:**
- Full property details displayed
- Images gallery works
- Inquiry form visible
- Owner/Agent contact info shown

---

### TC-B005: Submit Property Inquiry (Lead Creation)
**Precondition:** Logged in as buyer, viewing property detail
**Steps:**
1. Fill inquiry form:
   - Message: "I am interested in this property"
   - Preferred contact: "WhatsApp"
2. Click Submit

**Expected:**
- Success message displayed
- Inquiry created in database
- Lead appears in owner's CRM dashboard
- Lead status = "new"
- Lead priority = "medium"
- Lead source = "website"

---

### TC-B006: View My Inquiries (Buyer Dashboard)
**Precondition:** Logged in as buyer, has submitted inquiries
**Steps:**
1. Click user menu → "My Dashboard"
2. View sent inquiries section

**Expected:**
- List of all inquiries sent by buyer
- Shows property info, status, date
- Can see if owner has responded

---

### TC-B007: Buyer Cannot Access CRM
**Precondition:** Logged in as buyer
**Steps:**
1. Try to navigate to `/crm` directly

**Expected:**
- Access denied or redirect to home
- CRM link NOT visible in navigation

---

## Test Suite 2: Owner Flow

### TC-O001: Owner Registration
**Precondition:** No existing account
**Steps:**
1. Navigate to `/register`
2. Fill form with owner details
3. Select role: "Property Owner"
4. Submit

**Expected:**
- Account created
- Can access owner dashboard
- Can list properties

---

### TC-O002: Owner Login
**Precondition:** Owner account exists
**Steps:**
1. Navigate to `/login`
2. Enter owner credentials

**Expected:**
- Login successful
- User menu shows: Dashboard, My Properties, CRM / Leads

---

### TC-O003: List a Property
**Precondition:** Logged in as owner
**Steps:**
1. Click "+ List Property" button
2. Fill all required fields:
   - Title, Description
   - Property Type, Listing Type
   - Address details
   - Price
   - Specs (area, bedrooms, etc.)
   - Upload images
3. Submit

**Expected:**
- Property created (pending approval or active)
- Appears in "My Properties"
- Ready to receive inquiries

---

### TC-O004: Access CRM Dashboard
**Precondition:** Logged in as owner
**Steps:**
1. Click user menu → "CRM / Leads"
2. View CRM dashboard

**Expected:**
- Dashboard loads at `/crm`
- Stats cards visible (may show 0 if no leads)
- Pipeline summary visible
- List/Pipeline view toggle works

---

### TC-O005: View Leads List
**Precondition:** Logged in as owner, has received inquiries
**Steps:**
1. Go to CRM Dashboard
2. View leads in list view

**Expected:**
- All leads for owner's properties displayed
- Shows: buyer name, email, phone, property, status, priority, date
- Quick action buttons visible (call, WhatsApp, email, view)

---

### TC-O006: Filter Leads by Status
**Precondition:** Logged in as owner, has leads in different statuses
**Steps:**
1. Go to CRM Dashboard
2. Click on a status in pipeline summary (e.g., "New")

**Expected:**
- Only leads with selected status shown
- Click again to clear filter
- Count badges update correctly

---

### TC-O007: Search Leads
**Precondition:** Logged in as owner, has multiple leads
**Steps:**
1. Go to CRM Dashboard
2. Enter search term (buyer name, email, or phone)
3. Press Enter

**Expected:**
- Leads filtered by search term
- Partial matches work
- Case-insensitive search

---

### TC-O008: Change Lead Status (List View)
**Precondition:** Logged in as owner, has leads
**Steps:**
1. Go to CRM Dashboard (List View)
2. Find a lead with status "New"
3. Click status dropdown
4. Select "Contacted"

**Expected:**
- Status updates immediately
- Activity auto-logged: "Status changed from new to contacted"
- `lastContactedAt` updated if moving from "new"

---

### TC-O009: View Pipeline (Kanban) View
**Precondition:** Logged in as owner, has leads
**Steps:**
1. Go to CRM Dashboard
2. Click "Pipeline View" button

**Expected:**
- Kanban columns displayed for each status
- Leads appear as cards in correct columns
- Shows buyer name, property, price, priority
- Quick action buttons on cards

---

### TC-O010: View Lead Details
**Precondition:** Logged in as owner, has leads
**Steps:**
1. Go to CRM Dashboard
2. Click on a lead (arrow icon or card)

**Expected:**
- Lead details page loads at `/crm/leads/:id`
- Header shows buyer name, contact buttons
- Status pipeline visible
- Property info card visible
- Tabs: Activities, Tasks, Notes

---

### TC-O011: Update Lead Status (Detail View)
**Precondition:** Viewing lead details
**Steps:**
1. Click on different status in pipeline
2. Observe changes

**Expected:**
- Status updates
- Activity logged automatically
- Page refreshes with new data

---

### TC-O012: Log a Call Activity
**Precondition:** Viewing lead details
**Steps:**
1. Click "Log a Call" in Quick Actions (or "Log Activity" button)
2. Fill form:
   - Type: Call
   - Title: "Initial call with buyer"
   - Description: "Discussed property features, buyer interested"
3. Submit

**Expected:**
- Activity created
- Appears in Activities tab
- `lastContactedAt` updated on lead
- Shows timestamp and user name

---

### TC-O013: Log an Email Activity
**Precondition:** Viewing lead details
**Steps:**
1. Click "Log an Email" or "Log Activity"
2. Fill form:
   - Type: Email
   - Title: "Sent property brochure"
   - Description: "Attached floor plan and pricing"
3. Submit

**Expected:**
- Activity created and displayed
- `lastContactedAt` updated

---

### TC-O014: Log a Site Visit Activity
**Precondition:** Viewing lead details
**Steps:**
1. Click "Log Site Visit"
2. Fill form:
   - Type: Site Visit
   - Title: "Property tour completed"
   - Description: "Buyer liked the location, concerned about price"
3. Submit

**Expected:**
- Activity created
- Appears in timeline

---

### TC-O015: Add a Note
**Precondition:** Viewing lead details
**Steps:**
1. Click "Notes" tab
2. Click Edit icon
3. Enter note: "Buyer is relocating from Mumbai, needs 3BHK, budget flexible"
4. Click Save

**Expected:**
- Note saved to lead
- Displays in Notes tab
- Persists on page refresh

---

### TC-O016: Create a Follow-up Task
**Precondition:** Viewing lead details
**Steps:**
1. Click "Schedule Follow-up" or "Add Task"
2. Fill form:
   - Title: "Call buyer about site visit"
   - Type: Follow-up
   - Priority: High
   - Due Date: Tomorrow
3. Submit

**Expected:**
- Task created
- Appears in Tasks tab
- `nextFollowUpDate` updated on lead if this is earliest

---

### TC-O017: Create a Call Task
**Precondition:** Viewing lead details
**Steps:**
1. Click "Add Task"
2. Fill form:
   - Title: "Confirm site visit timing"
   - Type: Call
   - Priority: Medium
   - Due Date: Today
3. Submit

**Expected:**
- Task created with type "call"
- Appears in Tasks tab

---

### TC-O018: Complete a Task
**Precondition:** Viewing lead details, has pending tasks
**Steps:**
1. Go to Tasks tab
2. Click checkbox next to a task

**Expected:**
- Task status changes to "completed"
- Task appears with strikethrough
- Activity logged: "Task completed: [task title]"

---

### TC-O019: Uncomplete a Task
**Precondition:** Has completed task
**Steps:**
1. Click checkbox on completed task

**Expected:**
- Task status changes back to "pending"
- Strikethrough removed

---

### TC-O020: Edit Lead Priority
**Precondition:** Viewing lead details
**Steps:**
1. Click Edit icon in Lead Details sidebar
2. Change Priority from "Medium" to "High"
3. Click Save

**Expected:**
- Priority updated
- Badge color changes
- Persists on refresh

---

### TC-O021: Set Follow-up Date
**Precondition:** Viewing lead details, in edit mode
**Steps:**
1. Click Edit icon
2. Set "Next Follow-up" date to tomorrow
3. Save

**Expected:**
- Date saved
- Shows in sidebar
- Lead appears in "Pending Follow-ups" count on dashboard

---

### TC-O022: Set Expected Closing Date
**Precondition:** Viewing lead details, in edit mode
**Steps:**
1. Set "Expected Closing" date
2. Save

**Expected:**
- Date saved and displayed

---

### TC-O023: Quick Call Action
**Precondition:** Viewing lead (list or detail)
**Steps:**
1. Click phone icon

**Expected:**
- Opens phone dialer with buyer's number
- `tel:` link works

---

### TC-O024: Quick WhatsApp Action
**Precondition:** Viewing lead
**Steps:**
1. Click WhatsApp icon

**Expected:**
- Opens WhatsApp (web or app) with buyer's number
- URL: `https://wa.me/91[phone]`

---

### TC-O025: Quick Email Action
**Precondition:** Viewing lead
**Steps:**
1. Click email icon

**Expected:**
- Opens email client with buyer's email
- `mailto:` link works

---

### TC-O026: View Dashboard Stats
**Precondition:** Logged in as owner, has leads
**Steps:**
1. Go to CRM Dashboard
2. Review stats cards

**Expected:**
- **Total Leads**: Count of all inquiries
- **New This Week**: Leads created in last 7 days
- **Pending Follow-ups**: Leads with overdue follow-up dates
- **Pending Tasks**: Tasks not completed
- **Overdue Tasks**: Tasks past due date
- **Conversion Rate**: (Won / Total Closed) × 100

---

### TC-O027: View All Tasks
**Precondition:** Logged in as owner, has tasks
**Steps:**
1. Note: Currently tasks are viewed per-lead
2. Future: Global tasks view at `/crm/tasks`

**Expected:**
- Tasks accessible from lead details
- API endpoint `/api/v1/crm/tasks` returns all user's tasks

---

### TC-O028: Close Lead as Won
**Precondition:** Lead in negotiation stage
**Steps:**
1. View lead details
2. Click "Closed Won" in pipeline

**Expected:**
- Status changes to "closed-won"
- Activity logged
- Conversion rate updates on dashboard

---

### TC-O029: Close Lead as Lost
**Precondition:** Lead exists
**Steps:**
1. View lead details
2. Click "Closed Lost" in pipeline

**Expected:**
- Status changes to "closed-lost"
- Activity logged

---

### TC-O030: Owner Cannot See Other Owner's Leads
**Precondition:** Two owners with different properties
**Steps:**
1. Login as Owner A
2. View CRM dashboard
3. Logout, login as Owner B
4. View CRM dashboard

**Expected:**
- Each owner only sees leads for their own properties
- No cross-owner data leakage

---

## Test Suite 3: Agent Flow

### TC-A001: Agent Registration
**Steps:**
1. Register with role "Agent"

**Expected:**
- Account created
- Can access agent features

---

### TC-A002: Agent Access to CRM
**Precondition:** Logged in as agent
**Steps:**
1. Check navigation menu

**Expected:**
- "CRM / Leads" link visible
- Can access `/crm`

---

### TC-A003: Agent Lists Property
**Steps:**
1. Login as agent
2. List a property

**Expected:**
- Property created
- Agent is the owner of the property

---

### TC-A004: Agent Receives Leads
**Precondition:** Agent has listed property, buyer submits inquiry
**Steps:**
1. Login as agent
2. Go to CRM Dashboard

**Expected:**
- Lead appears in agent's CRM
- Full CRM functionality available

---

### TC-A005: Agent Full CRM Access
**Precondition:** Agent has leads
**Steps:**
1. Test all owner CRM features (TC-O004 to TC-O029)

**Expected:**
- All features work identically for agents
- Can update status, log activities, create tasks

---

## Test Suite 4: Admin Flow

### TC-AD001: Admin Login
**Steps:**
1. Login with admin credentials

**Expected:**
- Login successful
- Admin menu options visible

---

### TC-AD002: Admin CRM Access
**Precondition:** Logged in as admin
**Steps:**
1. Navigate to `/crm`

**Expected:**
- Currently: May show admin's own leads (if any)
- Future enhancement: Admin sees all leads across platform

---

### TC-AD003: Admin View Any Lead (API)
**Precondition:** Admin logged in
**Steps:**
1. Call API: `GET /api/v1/crm/leads/:id` with any lead ID

**Expected:**
- Admin can view any lead (role check allows admin)

---

### TC-AD004: Admin Update Any Lead (API)
**Steps:**
1. Call API: `PATCH /api/v1/crm/leads/:id` with any lead ID

**Expected:**
- Admin can update any lead

---

## Test Suite 5: API Tests (Postman/cURL)

### TC-API001: Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/v1/crm/dashboard \
  -H "Authorization: Bearer <owner_token>"
```
**Expected:** 200 OK with stats object

---

### TC-API002: Get Leads with Filters
```bash
curl -X GET "http://localhost:5000/api/v1/crm/leads?status=new&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer <owner_token>"
```
**Expected:** 200 OK with filtered leads array

---

### TC-API003: Get Lead Details
```bash
curl -X GET http://localhost:5000/api/v1/crm/leads/<lead_id> \
  -H "Authorization: Bearer <owner_token>"
```
**Expected:** 200 OK with lead, activities, tasks

---

### TC-API004: Update Lead
```bash
curl -X PATCH http://localhost:5000/api/v1/crm/leads/<lead_id> \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"priority": "high", "notes": "Hot lead"}'
```
**Expected:** 200 OK with updated lead

---

### TC-API005: Update Lead Status
```bash
curl -X PATCH http://localhost:5000/api/v1/crm/leads/<lead_id>/status \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "contacted"}'
```
**Expected:** 200 OK, activity auto-created

---

### TC-API006: Add Activity
```bash
curl -X POST http://localhost:5000/api/v1/crm/leads/<lead_id>/activities \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"type": "call", "title": "Follow-up call", "description": "Discussed pricing"}'
```
**Expected:** 201 Created with activity object

---

### TC-API007: Get Activities
```bash
curl -X GET http://localhost:5000/api/v1/crm/leads/<lead_id>/activities \
  -H "Authorization: Bearer <owner_token>"
```
**Expected:** 200 OK with activities array

---

### TC-API008: Create Task
```bash
curl -X POST http://localhost:5000/api/v1/crm/leads/<lead_id>/tasks \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Schedule site visit", "type": "site-visit", "priority": "high", "dueDate": "2024-12-30"}'
```
**Expected:** 201 Created with task object

---

### TC-API009: Get All Tasks
```bash
curl -X GET "http://localhost:5000/api/v1/crm/tasks?status=pending" \
  -H "Authorization: Bearer <owner_token>"
```
**Expected:** 200 OK with tasks array and stats

---

### TC-API010: Update Task
```bash
curl -X PATCH http://localhost:5000/api/v1/crm/tasks/<task_id> \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```
**Expected:** 200 OK, activity logged if completed

---

### TC-API011: Delete Task
```bash
curl -X DELETE http://localhost:5000/api/v1/crm/tasks/<task_id> \
  -H "Authorization: Bearer <owner_token>"
```
**Expected:** 200 OK

---

### TC-API012: Unauthorized Access
```bash
curl -X GET http://localhost:5000/api/v1/crm/leads/<other_owner_lead_id> \
  -H "Authorization: Bearer <owner_token>"
```
**Expected:** 403 Forbidden

---

### TC-API013: No Token
```bash
curl -X GET http://localhost:5000/api/v1/crm/dashboard
```
**Expected:** 401 Unauthorized

---

### TC-API014: Invalid Token
```bash
curl -X GET http://localhost:5000/api/v1/crm/dashboard \
  -H "Authorization: Bearer invalid_token"
```
**Expected:** 401 Unauthorized

---

## Test Suite 6: Edge Cases

### TC-E001: Empty CRM Dashboard
**Precondition:** Owner with no properties or no inquiries
**Steps:**
1. Login as new owner
2. Go to CRM Dashboard

**Expected:**
- Dashboard loads without errors
- Stats show 0
- Empty state message in leads list

---

### TC-E002: Lead with Deleted Property
**Precondition:** Lead exists, property gets deleted
**Steps:**
1. View lead in CRM

**Expected:**
- Lead still visible
- Property info shows gracefully (null handling)

---

### TC-E003: Very Long Notes
**Steps:**
1. Add note with 2000+ characters

**Expected:**
- Note truncated or saved (based on model limit)
- No crash

---

### TC-E004: Special Characters in Search
**Steps:**
1. Search with: `<script>alert('xss')</script>`

**Expected:**
- No XSS execution
- Search handles safely

---

### TC-E005: Concurrent Status Updates
**Steps:**
1. Open lead in two browser tabs
2. Update status in both simultaneously

**Expected:**
- Last update wins
- No data corruption
- Both activities logged

---

### TC-E006: Past Due Date Task
**Steps:**
1. Create task with past due date

**Expected:**
- Task created
- Shows as overdue
- Counted in "Overdue Tasks" stat

---

### TC-E007: Mobile Responsiveness
**Steps:**
1. Open CRM Dashboard on mobile device
2. Test all features

**Expected:**
- Responsive layout
- Pipeline view scrollable
- Modals work on mobile
- Touch targets adequate

---

## Test Suite 7: Performance Tests

### TC-P001: Load 100+ Leads
**Steps:**
1. Create 100+ inquiries for an owner
2. Load CRM Dashboard

**Expected:**
- Page loads in < 3 seconds
- Pagination works
- No browser freeze

---

### TC-P002: Load 50+ Activities
**Steps:**
1. Add 50+ activities to a lead
2. View lead details

**Expected:**
- Activities load with pagination
- Scroll performance smooth

---

### TC-P003: Rapid Status Changes
**Steps:**
1. Change status 10 times quickly

**Expected:**
- All changes processed
- Activities logged correctly
- No duplicate entries

---

## Test Execution Checklist

| Test ID | Description | Pass/Fail | Notes |
|---------|-------------|-----------|-------|
| TC-B001 | Buyer Registration | | |
| TC-B002 | Buyer Login | | |
| TC-B003 | Browse Properties | | |
| TC-B004 | View Property Detail | | |
| TC-B005 | Submit Inquiry | | |
| TC-B006 | View My Inquiries | | |
| TC-B007 | Buyer Cannot Access CRM | | |
| TC-O001 | Owner Registration | | |
| TC-O002 | Owner Login | | |
| TC-O003 | List Property | | |
| TC-O004 | Access CRM Dashboard | | |
| TC-O005 | View Leads List | | |
| TC-O006 | Filter by Status | | |
| TC-O007 | Search Leads | | |
| TC-O008 | Change Status (List) | | |
| TC-O009 | Pipeline View | | |
| TC-O010 | View Lead Details | | |
| TC-O011 | Update Status (Detail) | | |
| TC-O012 | Log Call Activity | | |
| TC-O013 | Log Email Activity | | |
| TC-O014 | Log Site Visit | | |
| TC-O015 | Add Note | | |
| TC-O016 | Create Follow-up Task | | |
| TC-O017 | Create Call Task | | |
| TC-O018 | Complete Task | | |
| TC-O019 | Uncomplete Task | | |
| TC-O020 | Edit Priority | | |
| TC-O021 | Set Follow-up Date | | |
| TC-O022 | Set Closing Date | | |
| TC-O023 | Quick Call | | |
| TC-O024 | Quick WhatsApp | | |
| TC-O025 | Quick Email | | |
| TC-O026 | Dashboard Stats | | |
| TC-O027 | View All Tasks | | |
| TC-O028 | Close as Won | | |
| TC-O029 | Close as Lost | | |
| TC-O030 | Data Isolation | | |
| TC-A001-005 | Agent Tests | | |
| TC-AD001-004 | Admin Tests | | |
| TC-API001-014 | API Tests | | |
| TC-E001-007 | Edge Cases | | |
| TC-P001-003 | Performance | | |

---

## Bug Report Template

```
Bug ID: CRM-XXX
Title: 
Severity: Critical / High / Medium / Low
Test Case: TC-XXXX

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:

Actual Result:

Screenshots/Logs:

Environment:
- Browser: 
- OS: 
- Backend Version: 
- Frontend Version: 
```

