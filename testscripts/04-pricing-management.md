# Pricing Management - Test Scripts

## Overview
Test scripts for Pricing Management feature allowing builders to configure unit pricing, offers, and payment plans.

---

## Prerequisites
- User account with `owner` role
- Verified builder profile
- Project with towers and units created
- **Frontend URL**: https://indiapropertyads.netlify.app
- **Backend API URL**: https://india-property-ads-api.onrender.com/api/v1
- Valid authentication token

---

## API Endpoints

### Pricing Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/pricing` | Create pricing config |
| GET | `/api/v1/pricing/project/:projectId` | Get project pricing |
| PUT | `/api/v1/pricing/:id` | Update pricing |
| DELETE | `/api/v1/pricing/:id` | Delete pricing |
| POST | `/api/v1/pricing/calculate` | Calculate unit price |

### Offer Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/pricing/offers` | Create offer |
| GET | `/api/v1/pricing/project/:projectId/offers` | Get project offers |
| PUT | `/api/v1/pricing/offers/:id` | Update offer |
| DELETE | `/api/v1/pricing/offers/:id` | Delete offer |

### Payment Plan Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/pricing/payment-plans` | Create payment plan |
| GET | `/api/v1/pricing/project/:projectId/payment-plans` | Get payment plans |
| PUT | `/api/v1/pricing/payment-plans/:id` | Update payment plan |
| DELETE | `/api/v1/pricing/payment-plans/:id` | Delete payment plan |

---

## Test Cases - Pricing Configuration

### TC-PR-001: Create Base Pricing Configuration

**Preconditions:**
- Project exists with units

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/builder/projects/<project_id>/pricing`
2. Click "Configure Pricing"
3. Set base price per sqft: ₹8,500
4. Configure floor rise: ₹50 per floor
5. Configure facing premiums:
   - East: +₹200/sqft
   - North: +₹150/sqft
   - West: +₹100/sqft
   - South: +₹0/sqft
6. Save configuration

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/pricing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "name": "Standard Pricing",
    "basePrice": 8500,
    "priceUnit": "per-sqft",
    "floorRise": {
      "enabled": true,
      "amount": 50,
      "startFloor": 1,
      "type": "per-floor"
    },
    "facingPremium": {
      "enabled": true,
      "premiums": {
        "east": 200,
        "north": 150,
        "west": 100,
        "south": 0
      }
    },
    "cornerPremium": {
      "enabled": true,
      "percentage": 5
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Pricing configuration created",
  "data": {
    "_id": "...",
    "name": "Standard Pricing",
    "basePrice": 8500,
    "isActive": true
  }
}
```

---

### TC-PR-002: Create Unit Type Specific Pricing

**Preconditions:**
- Project exists

**Steps:**
1. Navigate to pricing configuration
2. Add unit type pricing:
   - 2BHK: ₹7,500/sqft
   - 3BHK: ₹8,500/sqft
   - 4BHK: ₹9,500/sqft
3. Save configuration

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/pricing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "name": "Unit Type Pricing",
    "unitTypePricing": [
      { "unitType": "2BHK", "basePrice": 7500 },
      { "unitType": "3BHK", "basePrice": 8500 },
      { "unitType": "4BHK", "basePrice": 9500 }
    ],
    "priceUnit": "per-sqft"
  }'
```

---

### TC-PR-003: Calculate Unit Price

**Preconditions:**
- Pricing configuration exists

**Steps:**
1. Select a unit
2. View calculated price breakdown

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/pricing/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "unitType": "3BHK",
    "carpetArea": 1200,
    "superBuiltUpArea": 1500,
    "floor": 10,
    "facing": "east",
    "isCorner": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "breakdown": {
      "basePrice": 12750000,
      "floorRise": 75000,
      "facingPremium": 300000,
      "cornerPremium": 0,
      "totalBeforeCharges": 13125000,
      "otherCharges": {
        "parking": 500000,
        "clubMembership": 100000,
        "maintenance": 50000
      },
      "totalCharges": 650000,
      "gst": 657500,
      "stampDuty": 787500,
      "registration": 131250
    },
    "totalPrice": 15351250,
    "pricePerSqft": 10234
  }
}
```

---

### TC-PR-004: Update Pricing Configuration

**Preconditions:**
- Pricing config exists

**Steps:**
1. Edit pricing configuration
2. Update base price to ₹9,000/sqft
3. Save changes

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/pricing/<pricing_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "basePrice": 9000,
    "floorRise": {
      "amount": 75
    }
  }'
```

---

### TC-PR-005: Get Project Pricing

**Steps:**
1. Navigate to project pricing page
2. View all pricing configurations

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/pricing/project/<project_id> \
  -H "Authorization: Bearer <token>"
```

---

## Test Cases - Offers

### TC-PR-006: Create Discount Offer

**Preconditions:**
- Project exists

**Steps:**
1. Navigate to offers section
2. Click "Create Offer"
3. Fill in offer details:
   - Name: "New Year Special"
   - Type: "percentage"
   - Value: 5%
   - Valid From: 2024-12-25
   - Valid Until: 2025-01-15
   - Applicable Units: All
4. Save offer

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/pricing/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "name": "New Year Special",
    "description": "Get 5% off on all units",
    "type": "percentage",
    "value": 5,
    "validFrom": "2024-12-25",
    "validUntil": "2025-01-15",
    "applicableTo": "all",
    "minBookingAmount": 500000,
    "isActive": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Offer created successfully",
  "data": {
    "_id": "...",
    "name": "New Year Special",
    "type": "percentage",
    "value": 5,
    "isActive": true
  }
}
```

---

### TC-PR-007: Create Fixed Amount Offer

**Steps:**
1. Create offer with fixed discount
   - Name: "Festive Bonus"
   - Type: "fixed"
   - Value: ₹2,00,000
2. Save offer

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/pricing/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "name": "Festive Bonus",
    "description": "Flat ₹2 Lakh off",
    "type": "fixed",
    "value": 200000,
    "validFrom": "2024-12-20",
    "validUntil": "2025-01-10",
    "applicableTo": "all",
    "isActive": true
  }'
```

---

### TC-PR-008: Create Unit Type Specific Offer

**Steps:**
1. Create offer for specific unit types
   - Name: "3BHK Special"
   - Applicable To: 3BHK units only
   - Discount: 3%
2. Save offer

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/pricing/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "name": "3BHK Special",
    "type": "percentage",
    "value": 3,
    "applicableTo": "unit-type",
    "applicableUnitTypes": ["3BHK"],
    "validFrom": "2024-12-01",
    "validUntil": "2025-03-31",
    "isActive": true
  }'
```

---

### TC-PR-009: Get Project Offers

**Steps:**
1. Navigate to offers page
2. View all offers

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/pricing/project/<project_id>/offers \
  -H "Authorization: Bearer <token>"
```

---

### TC-PR-010: Deactivate Offer

**Steps:**
1. Click on active offer
2. Toggle "Active" to off
3. Save

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/pricing/offers/<offer_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "isActive": false
  }'
```

---

### TC-PR-011: Delete Offer

**Steps:**
1. Click delete on offer
2. Confirm deletion

**API Request:**
```bash
curl -X DELETE https://india-property-ads-api.onrender.com/api/v1/pricing/offers/<offer_id> \
  -H "Authorization: Bearer <token>"
```

---

## Test Cases - Payment Plans

### TC-PR-012: Create Construction Linked Plan

**Preconditions:**
- Project exists

**Steps:**
1. Navigate to payment plans
2. Click "Create Payment Plan"
3. Select type: "construction-linked"
4. Configure milestones:
   - Booking: 10%
   - Agreement: 10%
   - Foundation: 15%
   - Plinth: 10%
   - 1st Slab: 10%
   - ... (continue milestones)
   - Possession: 5%
5. Save plan

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/pricing/payment-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "name": "Construction Linked Plan",
    "type": "construction-linked",
    "description": "Pay as construction progresses",
    "milestones": [
      { "name": "Booking", "percentage": 10, "description": "At the time of booking" },
      { "name": "Agreement", "percentage": 10, "description": "Within 30 days of booking" },
      { "name": "Foundation", "percentage": 15, "description": "On completion of foundation" },
      { "name": "Plinth", "percentage": 10, "description": "On completion of plinth" },
      { "name": "1st Slab", "percentage": 10, "description": "On completion of 1st slab" },
      { "name": "5th Slab", "percentage": 10, "description": "On completion of 5th slab" },
      { "name": "10th Slab", "percentage": 10, "description": "On completion of 10th slab" },
      { "name": "Brick Work", "percentage": 10, "description": "On completion of brick work" },
      { "name": "Plastering", "percentage": 10, "description": "On completion of plastering" },
      { "name": "Possession", "percentage": 5, "description": "At the time of possession" }
    ],
    "isDefault": true,
    "isActive": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment plan created successfully",
  "data": {
    "_id": "...",
    "name": "Construction Linked Plan",
    "type": "construction-linked",
    "milestones": [...],
    "isDefault": true
  }
}
```

---

### TC-PR-013: Create Time Linked Plan

**Steps:**
1. Create time-based payment plan
   - Type: "time-linked"
   - Milestones based on months from booking

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/pricing/payment-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "name": "Time Linked Plan",
    "type": "time-linked",
    "milestones": [
      { "name": "Booking", "percentage": 10, "monthsFromBooking": 0 },
      { "name": "1st Installment", "percentage": 15, "monthsFromBooking": 3 },
      { "name": "2nd Installment", "percentage": 15, "monthsFromBooking": 6 },
      { "name": "3rd Installment", "percentage": 15, "monthsFromBooking": 9 },
      { "name": "4th Installment", "percentage": 15, "monthsFromBooking": 12 },
      { "name": "5th Installment", "percentage": 15, "monthsFromBooking": 15 },
      { "name": "Possession", "percentage": 15, "monthsFromBooking": 18 }
    ],
    "isActive": true
  }'
```

---

### TC-PR-014: Create Down Payment Plan

**Steps:**
1. Create down payment plan with higher upfront payment

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/pricing/payment-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "name": "Down Payment Plan",
    "type": "down-payment",
    "description": "Pay 50% upfront and get 3% discount",
    "milestones": [
      { "name": "Booking + Down Payment", "percentage": 50, "description": "Within 30 days" },
      { "name": "Possession", "percentage": 50, "description": "At possession" }
    ],
    "discount": {
      "type": "percentage",
      "value": 3
    },
    "isActive": true
  }'
```

---

### TC-PR-015: Get Project Payment Plans

**Steps:**
1. Navigate to payment plans page
2. View all plans

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/pricing/project/<project_id>/payment-plans \
  -H "Authorization: Bearer <token>"
```

---

### TC-PR-016: Set Default Payment Plan

**Steps:**
1. Select a payment plan
2. Mark as default

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/pricing/payment-plans/<plan_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "isDefault": true
  }'
```

---

### TC-PR-017: Delete Payment Plan

**Steps:**
1. Click delete on payment plan
2. Confirm deletion

**API Request:**
```bash
curl -X DELETE https://india-property-ads-api.onrender.com/api/v1/pricing/payment-plans/<plan_id> \
  -H "Authorization: Bearer <token>"
```

---

## UI Test Checklist

- [ ] Pricing configuration form works
- [ ] Floor rise calculator displays correctly
- [ ] Facing premium inputs work
- [ ] Price breakdown shows correctly
- [ ] Offer creation form works
- [ ] Date pickers for offer validity work
- [ ] Payment plan milestone editor works
- [ ] Milestone percentages sum to 100%
- [ ] Default plan indicator shows
- [ ] Active/Inactive toggle works
- [ ] Mobile responsive layout

---

## Validation Tests

### TC-PR-018: Milestone Percentages Must Sum to 100

**Steps:**
1. Create payment plan with milestones totaling 90%
2. Try to save

**Expected Results:**
- Validation error: "Milestone percentages must sum to 100%"

---

### TC-PR-019: Offer Valid Until Must Be After Valid From

**Steps:**
1. Create offer with validUntil before validFrom
2. Try to save

**Expected Results:**
- Validation error: "End date must be after start date"

---

### TC-PR-020: Negative Prices Not Allowed

**Steps:**
1. Try to set base price as -1000
2. Try to save

**Expected Results:**
- Validation error: "Price must be positive"

---

## Performance Tests

| Test | Expected |
|------|----------|
| Create pricing config | < 500ms |
| Calculate unit price | < 300ms |
| Get project pricing | < 300ms |
| Create offer | < 500ms |
| Create payment plan | < 500ms |

---

## Security Tests

- [ ] Only project owner can manage pricing
- [ ] Pricing visible to public only for approved projects
- [ ] Offers cannot be backdated
- [ ] Audit trail for price changes
