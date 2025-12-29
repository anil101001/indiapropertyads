# Builder Analytics - Test Scripts

## Overview
Test scripts for Builder Analytics feature providing insights into project performance, leads, and sales metrics.

---

## Prerequisites
- User account with `owner` role
- Verified builder profile with projects
- **Frontend URL**: https://indiapropertyads.netlify.app
- **Backend API URL**: https://india-property-ads-api.onrender.com/api/v1
- Valid authentication token

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/builders/profile` | Get profile with stats |
| GET | `/api/v1/builders/analytics` | Get detailed analytics |
| GET | `/api/v1/projects/my` | Get projects with counts |

---

## Test Cases

### TC-BA-001: View Builder Dashboard Stats

**Preconditions:**
- Builder has projects and leads

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/builder/dashboard`
2. View stats cards

**Expected Results:**
- Total Projects count displayed
- Total Units count displayed
- Total Leads count displayed
- Average Rating displayed

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/builders/profile \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "builder": {
      "stats": {
        "totalProjects": 5,
        "activeProjects": 3,
        "totalUnits": 500,
        "soldUnits": 150,
        "totalLeads": 250,
        "avgRating": 4.5,
        "totalReviews": 45
      }
    },
    "projectCounts": {
      "draft": 1,
      "pending-approval": 1,
      "approved": 3,
      "rejected": 0
    }
  }
}
```

---

### TC-BA-002: View Analytics Page

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/builder/analytics`
2. View analytics dashboard

**Expected Results:**
- Overview stats displayed
- Project performance metrics shown
- Lead analytics visible
- Sales metrics displayed

---

### TC-BA-003: View Project Status Distribution

**Steps:**
1. Navigate to builder dashboard
2. View project status summary

**Expected Results:**
- Draft count displayed
- Pending approval count displayed
- Approved/Live count displayed
- Rejected count displayed
- Archived count displayed

---

### TC-BA-004: View Recent Projects

**Steps:**
1. Navigate to builder dashboard
2. View recent projects list

**Expected Results:**
- Last 10 projects displayed
- Project name, status, and stats shown
- Click navigates to project details

---

### TC-BA-005: View Project-wise Analytics

**Steps:**
1. Navigate to analytics page
2. Select specific project
3. View project metrics

**Expected Results:**
- Project views count
- Inquiries received
- Units sold
- Revenue generated

---

### TC-BA-006: View Lead Analytics

**Steps:**
1. Navigate to analytics page
2. View lead metrics

**Expected Results:**
- Total leads count
- Leads by source
- Conversion rate
- Lead status breakdown

---

### TC-BA-007: View Sales Analytics

**Steps:**
1. Navigate to analytics page
2. View sales metrics

**Expected Results:**
- Total units sold
- Total revenue
- Average sale price
- Sales trend over time

---

### TC-BA-008: Filter Analytics by Date Range

**Steps:**
1. Navigate to analytics page
2. Select date range: Last 30 days
3. View filtered data

**Expected Results:**
- All metrics filtered by date range
- Charts updated accordingly

---

### TC-BA-009: Filter Analytics by Project

**Steps:**
1. Navigate to analytics page
2. Select specific project from dropdown
3. View project-specific analytics

**Expected Results:**
- Analytics filtered for selected project
- Project-specific metrics displayed

---

### TC-BA-010: Export Analytics Report

**Steps:**
1. Navigate to analytics page
2. Click "Export Report"
3. Select format (PDF/Excel)
4. Download report

**Expected Results:**
- Report generated with current filters
- File downloaded successfully

---

## UI Test Checklist

- [ ] Stats cards display correctly
- [ ] Numbers format correctly (lakhs/crores)
- [ ] Project status badges show correct colors
- [ ] Recent projects list renders
- [ ] Charts render correctly
- [ ] Date range picker works
- [ ] Project filter dropdown works
- [ ] Export button works
- [ ] Mobile responsive layout
- [ ] Loading states display correctly

---

## Performance Tests

| Test | Expected |
|------|----------|
| Dashboard load | < 2s |
| Analytics page load | < 3s |
| Filter application | < 1s |
| Export generation | < 5s |

---

## Security Tests

- [ ] Only builder can view own analytics
- [ ] Cannot access other builder's analytics
- [ ] Data aggregation is accurate
- [ ] No sensitive customer data exposed
