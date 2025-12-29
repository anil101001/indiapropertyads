# Public Project Listing - Test Scripts

## Overview
Test scripts for Public Project Listing feature allowing visitors to browse, search, and view real estate projects.

---

## Prerequisites
- **Frontend URL**: https://indiapropertyads.netlify.app
- **Backend API URL**: https://india-property-ads-api.onrender.com/api/v1
- Some approved projects exist in the system

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects` | List approved projects |
| GET | `/api/v1/projects/slug/:slug` | Get project by slug |
| GET | `/api/v1/projects/:id` | Get project by ID |
| POST | `/api/v1/projects/:id/inquiry` | Submit inquiry |

---

## Test Cases

### TC-PL-001: View Projects Listing Page

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/projects`
2. View project grid

**Expected Results:**
- Project cards displayed in grid
- Each card shows: image, name, location, price range, builder name
- Pagination controls visible

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?page=1&limit=12"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "...",
        "name": "Sunrise Heights",
        "slug": "sunrise-heights",
        "type": "residential",
        "segment": "premium",
        "location": {
          "address": {
            "city": "Bangalore",
            "locality": "Whitefield"
          }
        },
        "pricing": {
          "minPrice": 7500000,
          "maxPrice": 25000000
        },
        "media": {
          "images": [...]
        },
        "builder": {
          "companyName": "ABC Developers",
          "logo": "..."
        }
      }
    ],
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

### TC-PL-002: Search Projects by Keyword

**Steps:**
1. Navigate to projects page
2. Enter search term: "Bangalore"
3. Press Enter or click search

**Expected Results:**
- Projects matching "Bangalore" displayed
- Results include projects in Bangalore city

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?search=Bangalore"
```

---

### TC-PL-003: Filter Projects by Type

**Steps:**
1. Navigate to projects page
2. Select filter: Type = "residential"
3. View filtered results

**Expected Results:**
- Only residential projects displayed

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?type=residential"
```

---

### TC-PL-004: Filter Projects by City

**Steps:**
1. Navigate to projects page
2. Select filter: City = "Bangalore"
3. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?city=Bangalore"
```

---

### TC-PL-005: Filter Projects by Price Range

**Steps:**
1. Navigate to projects page
2. Set min price: ₹50 Lakhs
3. Set max price: ₹1 Crore
4. Apply filter

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?minPrice=5000000&maxPrice=10000000"
```

---

### TC-PL-006: Filter Projects by Segment

**Steps:**
1. Navigate to projects page
2. Select filter: Segment = "premium"
3. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?segment=premium"
```

---

### TC-PL-007: Filter Projects by Construction Status

**Steps:**
1. Navigate to projects page
2. Select filter: Status = "ready-to-move"
3. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?constructionStatus=ready-to-move"
```

---

### TC-PL-008: Sort Projects by Price (Low to High)

**Steps:**
1. Navigate to projects page
2. Select sort: "Price: Low to High"
3. View sorted results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?sortBy=minPrice&sortOrder=asc"
```

---

### TC-PL-009: Sort Projects by Price (High to Low)

**Steps:**
1. Navigate to projects page
2. Select sort: "Price: High to Low"
3. View sorted results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?sortBy=minPrice&sortOrder=desc"
```

---

### TC-PL-010: Sort Projects by Newest First

**Steps:**
1. Navigate to projects page
2. Select sort: "Newest First"
3. View sorted results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?sortBy=createdAt&sortOrder=desc"
```

---

### TC-PL-011: Pagination - Next Page

**Steps:**
1. Navigate to projects page
2. Click "Next" or page 2
3. View next set of results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?page=2&limit=12"
```

---

### TC-PL-012: View Project Detail Page

**Steps:**
1. Click on a project card
2. View project detail page

**Expected Results:**
- Project name and description displayed
- Image gallery with all images
- Location with map
- Amenities list
- Pricing information
- Builder information
- Inquiry form visible

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
    "description": "Premium residential apartments...",
    "type": "residential",
    "segment": "premium",
    "location": {
      "address": {
        "fullAddress": "123 Main Road, Whitefield",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560066",
        "locality": "Whitefield"
      },
      "coordinates": {
        "lat": 12.9716,
        "lng": 77.5946
      }
    },
    "details": {
      "landArea": { "value": 5, "unit": "acres" },
      "totalTowers": 4,
      "totalUnits": 400,
      "totalFloors": 25
    },
    "amenities": ["swimming-pool", "gym", "clubhouse"],
    "pricing": {
      "basePrice": 8500,
      "minPrice": 7500000,
      "maxPrice": 25000000
    },
    "media": {
      "images": [...],
      "videos": [...]
    },
    "builder": {
      "_id": "...",
      "companyName": "ABC Developers",
      "logo": "...",
      "contact": {
        "phone": "9876543210"
      }
    },
    "approvals": {
      "rera": {
        "registered": true,
        "number": "PRM/KA/RERA/1234/2024"
      }
    },
    "construction": {
      "status": "under-construction",
      "completionPercentage": 60
    },
    "possession": {
      "expected": "2026-06-30"
    }
  }
}
```

---

### TC-PL-013: View Project Image Gallery

**Steps:**
1. Navigate to project detail page
2. Click on main image
3. View full-screen gallery
4. Navigate through images

**Expected Results:**
- Gallery opens in lightbox/modal
- All images viewable
- Navigation arrows work
- Close button works

---

### TC-PL-014: View Project Location on Map

**Steps:**
1. Navigate to project detail page
2. Scroll to location section
3. View map

**Expected Results:**
- Map displays project location
- Marker shows exact position
- Nearby landmarks visible

---

### TC-PL-015: Submit Project Inquiry

**Steps:**
1. Navigate to project detail page
2. Fill inquiry form:
   - Name: "John Doe"
   - Phone: "9876543210"
   - Email: "john@example.com"
   - Message: "Interested in 3BHK units"
3. Click "Submit Inquiry"

**Expected Results:**
- Success message displayed
- Inquiry saved in system

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/projects/<project_id>/inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "message": "Interested in 3BHK units",
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

### TC-PL-016: Submit Inquiry with Missing Required Fields

**Steps:**
1. Navigate to project detail page
2. Leave name empty
3. Try to submit

**Expected Results:**
- Validation error displayed
- Form not submitted

---

### TC-PL-017: Submit Inquiry with Invalid Phone

**Steps:**
1. Fill inquiry form with invalid phone: "123"
2. Try to submit

**Expected Results:**
- Validation error: "Invalid phone number"
- Form not submitted

---

### TC-PL-018: View Builder Profile from Project

**Steps:**
1. Navigate to project detail page
2. Click on builder name/logo
3. View builder profile

**Expected Results:**
- Builder profile page opens
- Builder details displayed
- Other projects by builder shown

---

### TC-PL-019: Share Project

**Steps:**
1. Navigate to project detail page
2. Click share button
3. Select sharing option (WhatsApp/Facebook/Copy Link)

**Expected Results:**
- Share dialog opens
- Link copied or share app opens

---

### TC-PL-020: View Featured Projects

**Steps:**
1. Navigate to home page
2. View featured projects section

**Expected Results:**
- Featured projects displayed prominently
- "Featured" badge visible

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/projects?featured=true"
```

---

### TC-PL-021: No Results Found

**Steps:**
1. Search for non-existent term: "xyzabc123"
2. View results

**Expected Results:**
- "No projects found" message displayed
- Suggestion to modify search

---

### TC-PL-022: Clear All Filters

**Steps:**
1. Apply multiple filters
2. Click "Clear All Filters"
3. View results

**Expected Results:**
- All filters cleared
- Full project list displayed

---

## UI Test Checklist

- [ ] Project cards display correctly
- [ ] Images load properly
- [ ] Price formatting correct (₹ Lakhs/Crores)
- [ ] Search input works
- [ ] Filter dropdowns work
- [ ] Sort dropdown works
- [ ] Pagination works
- [ ] Project detail page loads
- [ ] Image gallery works
- [ ] Inquiry form validates
- [ ] Mobile responsive layout
- [ ] Loading states display

---

## Performance Tests

| Test | Expected |
|------|----------|
| Projects list load | < 2s |
| Project detail load | < 1s |
| Search results | < 1s |
| Filter application | < 500ms |
| Image gallery load | < 2s |

---

## SEO Tests

- [ ] Page titles are descriptive
- [ ] Meta descriptions present
- [ ] URLs are SEO-friendly (slugs)
- [ ] Images have alt text
- [ ] Structured data (JSON-LD) present
- [ ] Open Graph tags present

---

## Security Tests

- [ ] Only approved projects visible
- [ ] Draft/rejected projects not accessible
- [ ] Inquiry rate limiting in place
- [ ] XSS prevention in search
- [ ] No sensitive builder data exposed
