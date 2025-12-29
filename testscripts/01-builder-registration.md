# Builder Registration - Test Scripts

## Overview
Test scripts for Builder Registration feature allowing users to register as builders/developers on the platform.

---

## Prerequisites
- User account with `owner` role
- **Frontend URL**: https://indiapropertyads.netlify.app
- **Backend API URL**: https://india-property-ads-api.onrender.com/api/v1
- Valid authentication token

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/builders/register` | Register new builder |
| GET | `/api/v1/builders/profile` | Get own builder profile |
| PUT | `/api/v1/builders/profile` | Update builder profile |
| GET | `/api/v1/builders/:id` | Get builder by ID (public) |

---

## Test Cases

### TC-BR-001: Successful Builder Registration

**Preconditions:**
- User logged in with `owner` role
- No existing builder profile

**Steps:**
1. Navigate to `/builder/register`
2. Fill in company name: "ABC Developers Pvt Ltd"
3. Fill in legal name: "ABC Developers Private Limited"
4. Select company type: "pvt-ltd"
5. Fill in RERA number: "RERA/KA/2024/12345"
6. Select RERA state: "Karnataka"
7. Fill in RERA validity: Future date (e.g., 2026-12-31)
8. Fill in contact email: "contact@abcdevelopers.com"
9. Fill in contact phone: "9876543210"
10. Fill in website: "https://abcdevelopers.com"
11. Fill in address: "123 Builder Street, Bangalore"
12. Fill in city: "Bangalore"
13. Select state: "Karnataka"
14. Fill in pincode: "560001"
15. Fill in about: "Leading real estate developer in Bangalore"
16. Fill in year established: "2010"
17. Fill in years of experience: "14"
18. Fill in completed projects: "25"
19. Click "Register as Builder"

**Expected Results:**
- Success message displayed
- Redirected to `/builder/dashboard`
- Dashboard shows "Verification Pending" status
- Builder profile created in database

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/builders/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "companyName": "ABC Developers Pvt Ltd",
    "legalName": "ABC Developers Private Limited",
    "companyType": "pvt-ltd",
    "rera": {
      "registrationNumber": "RERA/KA/2024/12345",
      "state": "Karnataka",
      "validUntil": "2026-12-31"
    },
    "contact": {
      "email": "contact@abcdevelopers.com",
      "phone": "9876543210",
      "website": "https://abcdevelopers.com"
    },
    "address": {
      "fullAddress": "123 Builder Street, Bangalore",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001"
    },
    "about": "Leading real estate developer in Bangalore",
    "portfolio": {
      "yearEstablished": 2010,
      "completedProjects": 25
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Builder profile created successfully",
  "data": {
    "_id": "...",
    "companyName": "ABC Developers Pvt Ltd",
    "verification": {
      "status": "pending"
    }
  }
}
```

---

### TC-BR-002: Registration with Missing Required Fields

**Preconditions:**
- User logged in with `owner` role

**Steps:**
1. Navigate to `/builder/register`
2. Leave company name empty
3. Fill other required fields
4. Click "Register as Builder"

**Expected Results:**
- Validation error displayed
- Form not submitted
- Error message: "Company name is required"

---

### TC-BR-003: Registration with Invalid RERA Number

**Preconditions:**
- User logged in with `owner` role

**Steps:**
1. Navigate to `/builder/register`
2. Fill in RERA number with invalid format: "12345"
3. Fill other fields correctly
4. Click "Register as Builder"

**Expected Results:**
- Validation error for RERA format
- Form not submitted

---

### TC-BR-004: Registration with Expired RERA

**Preconditions:**
- User logged in with `owner` role

**Steps:**
1. Navigate to `/builder/register`
2. Fill in RERA validity with past date: "2020-01-01"
3. Fill other fields correctly
4. Click "Register as Builder"

**Expected Results:**
- Warning about expired RERA
- Registration may proceed with warning flag

---

### TC-BR-005: Duplicate Builder Registration

**Preconditions:**
- User already has a builder profile

**Steps:**
1. Navigate to `/builder/register`
2. Attempt to fill form

**Expected Results:**
- Redirected to `/builder/dashboard`
- Or error message: "Builder profile already exists"

---

### TC-BR-006: Registration with Invalid Phone Number

**Preconditions:**
- User logged in with `owner` role

**Steps:**
1. Navigate to `/builder/register`
2. Fill in phone: "123" (too short)
3. Fill other fields correctly
4. Click "Register as Builder"

**Expected Results:**
- Validation error: "Invalid phone number"
- Form not submitted

---

### TC-BR-007: Registration with Invalid Email

**Preconditions:**
- User logged in with `owner` role

**Steps:**
1. Navigate to `/builder/register`
2. Fill in email: "invalid-email"
3. Fill other fields correctly
4. Click "Register as Builder"

**Expected Results:**
- Validation error: "Invalid email format"
- Form not submitted

---

### TC-BR-008: Get Builder Profile

**Preconditions:**
- User has registered builder profile

**Steps:**
1. Call GET `/api/v1/builders/profile`

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
      "_id": "...",
      "companyName": "ABC Developers Pvt Ltd",
      "verification": { "status": "pending" },
      "stats": {
        "totalProjects": 0,
        "activeProjects": 0,
        "totalUnits": 0,
        "soldUnits": 0,
        "totalLeads": 0
      }
    },
    "projectCounts": {
      "draft": 0,
      "pending-approval": 0,
      "approved": 0,
      "rejected": 0
    }
  }
}
```

---

### TC-BR-009: Update Builder Profile

**Preconditions:**
- User has registered builder profile

**Steps:**
1. Navigate to `/builder/profile/edit`
2. Update company description
3. Add social media links
4. Click "Save Changes"

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/builders/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "about": "Updated description - Premier real estate developer",
    "socialMedia": {
      "facebook": "https://facebook.com/abcdevelopers",
      "linkedin": "https://linkedin.com/company/abcdevelopers"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### TC-BR-010: Unauthorized Access to Builder Registration

**Preconditions:**
- User logged in with `buyer` role (not owner)

**Steps:**
1. Navigate to `/builder/register`

**Expected Results:**
- Access denied or redirected
- Error message: "Only property owners can register as builders"

---

### TC-BR-011: Unauthenticated Access

**Preconditions:**
- User not logged in

**Steps:**
1. Navigate to `/builder/register`

**Expected Results:**
- Redirected to login page
- After login, redirected back to registration

---

## UI Test Checklist

- [ ] Form renders correctly on desktop
- [ ] Form renders correctly on mobile
- [ ] All form fields are accessible
- [ ] Tab navigation works correctly
- [ ] Error messages display correctly
- [ ] Success message displays correctly
- [ ] Loading state shows during submission
- [ ] Company type dropdown works
- [ ] State dropdown works
- [ ] Date picker for RERA validity works
- [ ] Form validation highlights invalid fields
- [ ] "Back" button works correctly

---

## Database Verification

After successful registration, verify in MongoDB:

```javascript
// Connect to MongoDB
use indiapropertyads

// Find builder by user ID
db.builders.findOne({ user: ObjectId("<user_id>") })

// Verify fields
{
  "_id": ObjectId("..."),
  "user": ObjectId("<user_id>"),
  "companyName": "ABC Developers Pvt Ltd",
  "slug": "abc-developers-pvt-ltd",
  "verification": {
    "status": "pending",
    "submittedAt": ISODate("...")
  },
  "subscription": {
    "plan": "free",
    "status": "active"
  },
  "isActive": true,
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

---

## Performance Tests

| Test | Expected |
|------|----------|
| Registration API response time | < 500ms |
| Profile fetch response time | < 200ms |
| Form load time | < 1s |

---

## Security Tests

- [ ] CSRF protection on form submission
- [ ] XSS prevention in text fields
- [ ] SQL injection prevention
- [ ] Rate limiting on registration endpoint
- [ ] Token validation on all protected endpoints
