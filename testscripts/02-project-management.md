# Project Management - Test Scripts

## Overview
Test scripts for Project Management feature allowing builders to create, manage, and publish real estate projects.

---

## Prerequisites
- User account with `owner` role
- Verified builder profile exists
- **Frontend URL**: https://indiapropertyads.netlify.app
- **Backend API URL**: https://india-property-ads-api.onrender.com/api/v1
- Valid authentication token

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/projects` | Create new project |
| GET | `/api/v1/projects/my` | Get builder's projects |
| GET | `/api/v1/projects/:id` | Get project by ID |
| GET | `/api/v1/projects/slug/:slug` | Get project by slug |
| PUT | `/api/v1/projects/:id` | Update project |
| DELETE | `/api/v1/projects/:id` | Delete project |
| POST | `/api/v1/projects/:id/submit` | Submit for approval |
| GET | `/api/v1/projects` | List all approved projects (public) |

---

## Test Cases

### TC-PM-001: Create New Project - Full Flow

**Preconditions:**
- Builder profile verified
- Logged in as builder

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/builder/projects/new`
2. **Step 1 - Basic Info:**
   - Name: "Sunrise Heights"
   - Type: "residential"
   - Segment: "premium"
   - Description: "Premium residential apartments in prime location"
3. **Step 2 - Location:**
   - Address: "123 Main Road, Whitefield"
   - City: "Bangalore"
   - State: "Karnataka"
   - Pincode: "560066"
   - Locality: "Whitefield"
   - Landmark: "Near Phoenix Mall"
4. **Step 3 - Project Details:**
   - Land Area: 5 (acres)
   - Total Towers: 4
   - Total Units: 400
   - Total Floors: 25
   - RERA Number: "PRM/KA/RERA/1234/2024"
   - Commencement Certificate: Yes
   - Occupancy Certificate: No
   - Construction Status: "under-construction"
   - Completion: 60%
   - Possession Date: "2026-06-30"
5. **Step 4 - Amenities:**
   - Select: Swimming Pool, Gym, Clubhouse, Power Backup, Security
6. **Step 5 - Media:**
   - Upload 3 project images
   - Add YouTube video URL
7. **Step 6 - Pricing:**
   - Base Price: 8500 (per sqft)
   - Min Price: 75,00,000
   - Max Price: 2,50,00,000
8. Click "Create Project"

**Expected Results:**
- Project created with status "draft"
- Redirected to project details page
- Success message displayed

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Sunrise Heights",
    "type": "residential",
    "segment": "premium",
    "description": "Premium residential apartments in prime location",
    "location": {
      "address": {
        "fullAddress": "123 Main Road, Whitefield",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560066",
        "locality": "Whitefield",
        "landmark": "Near Phoenix Mall"
      }
    },
    "details": {
      "landArea": { "value": 5, "unit": "acres" },
      "totalTowers": 4,
      "totalUnits": 400,
      "totalFloors": 25
    },
    "approvals": {
      "rera": {
        "registered": true,
        "number": "PRM/KA/RERA/1234/2024"
      },
      "commencementCertificate": true,
      "occupancyCertificate": false
    },
    "construction": {
      "status": "under-construction",
      "completionPercentage": 60
    },
    "possession": {
      "expected": "2026-06-30",
      "status": "future"
    },
    "amenities": ["swimming-pool", "gym", "clubhouse", "power-backup", "security"],
    "pricing": {
      "basePrice": 8500,
      "priceUnit": "per-sqft",
      "minPrice": 7500000,
      "maxPrice": 25000000
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "...",
    "name": "Sunrise Heights",
    "slug": "sunrise-heights",
    "status": "draft",
    "builder": "..."
  }
}
```

---

### TC-PM-002: Get Builder's Projects

**Preconditions:**
- Builder has created projects

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/builder/projects`
2. View project list

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects/my?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "statusCounts": {
      "draft": 2,
      "pending-approval": 1,
      "approved": 3,
      "rejected": 0
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 6,
      "pages": 1
    }
  }
}
```

---

### TC-PM-003: Filter Projects by Status

**Preconditions:**
- Builder has projects in different statuses

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/builder/projects`
2. Click on "Draft" filter tab
3. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects/my?status=draft" \
  -H "Authorization: Bearer <token>"
```

**Expected Results:**
- Only draft projects displayed
- Status count badges updated

---

### TC-PM-004: Update Project

**Preconditions:**
- Project exists in draft status

**Steps:**
1. Navigate to project edit page
2. Update project name to "Sunrise Heights Phase 2"
3. Update description
4. Click "Save Changes"

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/projects/<project_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Sunrise Heights Phase 2",
    "description": "Updated description for phase 2"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "_id": "...",
    "name": "Sunrise Heights Phase 2"
  }
}
```

---

### TC-PM-005: Submit Project for Approval

**Preconditions:**
- Project in draft status
- All required fields filled

**Steps:**
1. Navigate to project details
2. Click "Submit for Approval"
3. Confirm submission

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/projects/<project_id>/submit \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Project submitted for approval",
  "data": {
    "status": "pending-approval"
  }
}
```

---

### TC-PM-006: Delete Project

**Preconditions:**
- Project exists
- User is project owner

**Steps:**
1. Navigate to project list
2. Click delete icon on project
3. Confirm deletion

**API Request:**
```bash
curl -X DELETE https://india-property-ads-api.onrender.com/api/v1/projects/<project_id> \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

### TC-PM-007: Get Public Project List

**Preconditions:**
- Some projects are approved and published

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/projects`
2. View public project listing

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?page=1&limit=12"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

### TC-PM-008: Get Project by Slug (Public)

**Preconditions:**
- Project is approved

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/projects/sunrise-heights`

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/projects/slug/sunrise-heights
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Sunrise Heights",
    "slug": "sunrise-heights",
    "builder": {
      "companyName": "ABC Developers",
      "logo": "..."
    },
    ...
  }
}
```

---

### TC-PM-009: Search Projects

**Preconditions:**
- Multiple projects exist

**Steps:**
1. Navigate to projects listing
2. Enter search term: "Bangalore"
3. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?search=Bangalore"
```

**Expected Results:**
- Projects matching search term displayed
- Results include projects in Bangalore

---

### TC-PM-010: Filter Projects by Type

**Steps:**
1. Navigate to projects listing
2. Select filter: Type = "residential"
3. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?type=residential"
```

---

### TC-PM-011: Filter Projects by City

**Steps:**
1. Navigate to projects listing
2. Select filter: City = "Bangalore"
3. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?city=Bangalore"
```

---

### TC-PM-012: Filter Projects by Price Range

**Steps:**
1. Navigate to projects listing
2. Set min price: 50,00,000
3. Set max price: 1,00,00,000
4. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?minPrice=5000000&maxPrice=10000000"
```

---

### TC-PM-013: Create Project with Missing Required Fields

**Preconditions:**
- Builder profile verified

**Steps:**
1. Navigate to add project page
2. Leave project name empty
3. Try to proceed

**Expected Results:**
- Validation error displayed
- Cannot proceed without required fields

---

### TC-PM-014: Create Project - Unauthorized User

**Preconditions:**
- User logged in with `buyer` role (not builder)

**Steps:**
1. Try to navigate to `/builder/projects/new`

**Expected Results:**
- Access denied
- Redirected to appropriate page

---

### TC-PM-015: Submit Inquiry on Project

**Preconditions:**
- Project is approved and public

**Steps:**
1. Navigate to project detail page
2. Fill inquiry form:
   - Name: "John Doe"
   - Phone: "9876543210"
   - Email: "john@example.com"
   - Message: "Interested in 3BHK"
3. Click "Submit Inquiry"

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/projects/<project_id>/inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "message": "Interested in 3BHK",
    "preferredUnitType": "3BHK"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Inquiry submitted successfully"
}
```

---

## UI Test Checklist

- [ ] Multi-step form navigation works
- [ ] Form data persists between steps
- [ ] Back button retains data
- [ ] Image upload preview works
- [ ] Amenities multi-select works
- [ ] Date picker for possession date works
- [ ] Price formatting displays correctly
- [ ] Project cards display correctly
- [ ] Status badges show correct colors
- [ ] Pagination works
- [ ] Search filters work
- [ ] Mobile responsive layout

---

## Performance Tests

| Test | Expected |
|------|----------|
| Create project API | < 1s |
| Get projects list | < 500ms |
| Get single project | < 300ms |
| Image upload | < 5s per image |
| Page load time | < 2s |

---

## Security Tests

- [ ] Only builder can create projects
- [ ] Only owner can edit/delete own projects
- [ ] Draft projects not visible publicly
- [ ] Rejected projects not visible publicly
- [ ] XSS prevention in text fields
- [ ] File upload validation
