# India Property Ads - Test Scripts Index

## Overview
Comprehensive test scripts for all features of the India Property Ads platform.

---

## Environment URLs

| Environment | URL |
|-------------|-----|
| **Frontend (Production)** | https://indiapropertyads.netlify.app |
| **Backend API (Production)** | https://india-property-ads-api.onrender.com/api/v1 |

---

## Test Scripts by Feature

| # | Feature | File | Test Cases |
|---|---------|------|------------|
| 01 | Builder Registration | [01-builder-registration.md](./01-builder-registration.md) | 11 |
| 02 | Project Management | [02-project-management.md](./02-project-management.md) | 15 |
| 03 | Inventory Management | [03-inventory-management.md](./03-inventory-management.md) | 19 |
| 04 | Pricing Management | [04-pricing-management.md](./04-pricing-management.md) | 20 |
| 05 | Document Management | [05-document-management.md](./05-document-management.md) | 26 |
| 06 | Builder Analytics | [06-builder-analytics.md](./06-builder-analytics.md) | 10 |
| 07 | Public Project Listing | [07-public-project-listing.md](./07-public-project-listing.md) | 22 |
| 08 | Authentication & Authorization | [08-authentication-authorization.md](./08-authentication-authorization.md) | 24 |

**Total Test Cases: 147**

---

## Quick Start Testing

### 1. Get Authentication Token

```bash
# Login to get token
curl -X POST https://india-property-ads-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the token from response for subsequent requests.

### 2. Test API Health

```bash
# Check API is running
curl https://india-property-ads-api.onrender.com/api/v1/health
```

### 3. Run Feature Tests

Follow the test scripts in order:
1. Authentication (create test user)
2. Builder Registration (create builder profile)
3. Project Management (create projects)
4. Inventory Management (add towers/units)
5. Pricing Management (configure pricing)
6. Document Management (upload documents)
7. Public Listing (verify public access)
8. Analytics (view metrics)

---

## Test Data Setup

### Create Test User (Owner Role)

```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Builder",
    "email": "testbuilder@example.com",
    "phone": "9876543210",
    "password": "TestPass123!",
    "role": "owner"
  }'
```

### Create Builder Profile

```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/builders/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "companyName": "Test Developers Pvt Ltd",
    "legalName": "Test Developers Private Limited",
    "companyType": "pvt-ltd",
    "rera": {
      "registrationNumber": "RERA/KA/TEST/12345",
      "state": "Karnataka",
      "validUntil": "2026-12-31"
    },
    "contact": {
      "email": "contact@testdevelopers.com",
      "phone": "9876543210"
    },
    "address": {
      "fullAddress": "123 Test Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001"
    },
    "about": "Test developer for QA testing"
  }'
```

### Create Test Project

```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Test Heights",
    "type": "residential",
    "segment": "premium",
    "description": "Test project for QA",
    "location": {
      "address": {
        "fullAddress": "123 Test Road",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560001"
      }
    },
    "details": {
      "totalTowers": 2,
      "totalUnits": 100,
      "totalFloors": 15
    },
    "pricing": {
      "basePrice": 8000,
      "minPrice": 6000000,
      "maxPrice": 15000000
    }
  }'
```

---

## Test Categories

### Functional Tests
- CRUD operations for all entities
- Business logic validation
- Workflow tests (e.g., project approval flow)

### UI Tests
- Form validations
- Navigation
- Responsive design
- Loading states

### API Tests
- Request/Response validation
- Error handling
- Authentication/Authorization

### Security Tests
- Role-based access control
- Input validation
- XSS/CSRF prevention

### Performance Tests
- Response time benchmarks
- Load handling

---

## Reporting Issues

When reporting test failures, include:
1. Test Case ID (e.g., TC-PM-001)
2. Steps to reproduce
3. Expected result
4. Actual result
5. Screenshots/logs
6. Environment details

---

## Test Execution Checklist

### Pre-Test
- [ ] Backend API is running
- [ ] Frontend is accessible
- [ ] Database is connected
- [ ] S3 bucket is accessible
- [ ] Test user credentials ready

### Post-Test
- [ ] Clean up test data (if needed)
- [ ] Document any failures
- [ ] Update test scripts if needed

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-29 | Initial test scripts for Phase 3A features |
