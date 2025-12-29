# Inventory Management - Test Scripts

## Overview
Test scripts for Tower and Unit Inventory Management feature allowing builders to manage towers, floors, and units within projects.

---

## Prerequisites
- User account with `owner` role
- Verified builder profile
- At least one project created
- **Frontend URL**: https://indiapropertyads.netlify.app
- **Backend API URL**: https://india-property-ads-api.onrender.com/api/v1
- Valid authentication token

---

## API Endpoints

### Tower Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/inventory/towers` | Create tower |
| GET | `/api/v1/inventory/projects/:projectId/towers` | Get project towers |
| GET | `/api/v1/inventory/towers/:id` | Get tower by ID |
| PUT | `/api/v1/inventory/towers/:id` | Update tower |
| DELETE | `/api/v1/inventory/towers/:id` | Delete tower |

### Unit Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/inventory/units` | Create unit |
| POST | `/api/v1/inventory/units/bulk` | Bulk create units |
| GET | `/api/v1/inventory/towers/:towerId/units` | Get tower units |
| GET | `/api/v1/inventory/units/:id` | Get unit by ID |
| PUT | `/api/v1/inventory/units/:id` | Update unit |
| PUT | `/api/v1/inventory/units/:id/status` | Update unit status |
| DELETE | `/api/v1/inventory/units/:id` | Delete unit |
| GET | `/api/v1/inventory/projects/:projectId/stats` | Get inventory stats |

---

## Test Cases - Towers

### TC-IM-001: Create Tower

**Preconditions:**
- Project exists
- User is project owner

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/builder/projects/<project_id>/inventory`
2. Click "Add Tower"
3. Fill in tower details:
   - Name: "Tower A"
   - Total Floors: 25
   - Units Per Floor: 4
   - Construction Status: "under-construction"
4. Click "Create Tower"

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/inventory/towers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project": "<project_id>",
    "name": "Tower A",
    "totalFloors": 25,
    "unitsPerFloor": 4,
    "constructionStatus": "under-construction",
    "amenities": ["lift", "fire-safety", "power-backup"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tower created successfully",
  "data": {
    "_id": "...",
    "name": "Tower A",
    "totalFloors": 25,
    "unitsPerFloor": 4,
    "totalUnits": 100
  }
}
```

---

### TC-IM-002: Get Project Towers

**Preconditions:**
- Project has towers

**Steps:**
1. Navigate to project inventory page
2. View tower list

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/inventory/projects/<project_id>/towers \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Tower A",
      "totalFloors": 25,
      "totalUnits": 100,
      "availableUnits": 85,
      "soldUnits": 10,
      "blockedUnits": 5
    }
  ]
}
```

---

### TC-IM-003: Update Tower

**Preconditions:**
- Tower exists

**Steps:**
1. Click edit on tower
2. Update tower name to "Tower Alpha"
3. Save changes

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/inventory/towers/<tower_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Tower Alpha",
    "constructionStatus": "completed"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tower updated successfully",
  "data": {
    "name": "Tower Alpha",
    "constructionStatus": "completed"
  }
}
```

---

### TC-IM-004: Delete Tower

**Preconditions:**
- Tower exists with no sold units

**Steps:**
1. Click delete on tower
2. Confirm deletion

**API Request:**
```bash
curl -X DELETE https://india-property-ads-api.onrender.com/api/v1/inventory/towers/<tower_id> \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tower deleted successfully"
}
```

---

## Test Cases - Units

### TC-IM-005: Create Single Unit

**Preconditions:**
- Tower exists

**Steps:**
1. Navigate to tower inventory
2. Click "Add Unit"
3. Fill in unit details:
   - Unit Number: "A-101"
   - Floor: 1
   - Type: "3BHK"
   - Carpet Area: 1200 sqft
   - Super Built-up Area: 1500 sqft
   - Facing: "East"
   - Base Price: 85,00,000
4. Click "Create Unit"

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/inventory/units \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "tower": "<tower_id>",
    "unitNumber": "A-101",
    "floor": 1,
    "unitType": "3BHK",
    "bedrooms": 3,
    "bathrooms": 3,
    "balconies": 2,
    "carpetArea": 1200,
    "superBuiltUpArea": 1500,
    "facing": "east",
    "basePrice": 8500000,
    "status": "available"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Unit created successfully",
  "data": {
    "_id": "...",
    "unitNumber": "A-101",
    "unitType": "3BHK",
    "status": "available"
  }
}
```

---

### TC-IM-006: Bulk Create Units

**Preconditions:**
- Tower exists

**Steps:**
1. Navigate to tower inventory
2. Click "Bulk Add Units"
3. Configure:
   - Floor Range: 1-10
   - Units Per Floor: 4
   - Unit Types: 2BHK, 3BHK alternating
   - Base Price: 75,00,000
4. Click "Generate Units"

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/inventory/units/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "tower": "<tower_id>",
    "floorStart": 1,
    "floorEnd": 10,
    "unitsPerFloor": 4,
    "unitConfigs": [
      {
        "position": 1,
        "unitType": "2BHK",
        "bedrooms": 2,
        "bathrooms": 2,
        "carpetArea": 950,
        "superBuiltUpArea": 1200,
        "facing": "east",
        "basePrice": 6500000
      },
      {
        "position": 2,
        "unitType": "3BHK",
        "bedrooms": 3,
        "bathrooms": 3,
        "carpetArea": 1200,
        "superBuiltUpArea": 1500,
        "facing": "west",
        "basePrice": 8500000
      },
      {
        "position": 3,
        "unitType": "3BHK",
        "bedrooms": 3,
        "bathrooms": 3,
        "carpetArea": 1200,
        "superBuiltUpArea": 1500,
        "facing": "east",
        "basePrice": 8500000
      },
      {
        "position": 4,
        "unitType": "2BHK",
        "bedrooms": 2,
        "bathrooms": 2,
        "carpetArea": 950,
        "superBuiltUpArea": 1200,
        "facing": "west",
        "basePrice": 6500000
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "40 units created successfully",
  "data": {
    "created": 40,
    "units": [...]
  }
}
```

---

### TC-IM-007: Get Tower Units

**Preconditions:**
- Tower has units

**Steps:**
1. Navigate to tower inventory page
2. View unit grid/list

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/inventory/towers/<tower_id>/units?page=1&limit=50" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "units": [...],
    "stats": {
      "total": 100,
      "available": 85,
      "booked": 5,
      "sold": 10,
      "blocked": 0
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "pages": 2
    }
  }
}
```

---

### TC-IM-008: Filter Units by Status

**Steps:**
1. Navigate to tower inventory
2. Select filter: Status = "available"
3. View filtered units

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/inventory/towers/<tower_id>/units?status=available" \
  -H "Authorization: Bearer <token>"
```

---

### TC-IM-009: Filter Units by Type

**Steps:**
1. Navigate to tower inventory
2. Select filter: Type = "3BHK"
3. View filtered units

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/inventory/towers/<tower_id>/units?unitType=3BHK" \
  -H "Authorization: Bearer <token>"
```

---

### TC-IM-010: Filter Units by Floor

**Steps:**
1. Navigate to tower inventory
2. Select filter: Floor = 5
3. View filtered units

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/inventory/towers/<tower_id>/units?floor=5" \
  -H "Authorization: Bearer <token>"
```

---

### TC-IM-011: Update Unit Status - Book Unit

**Preconditions:**
- Unit is available

**Steps:**
1. Click on available unit
2. Click "Book Unit"
3. Enter customer details
4. Confirm booking

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/inventory/units/<unit_id>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "booked",
    "customer": {
      "name": "Rahul Sharma",
      "phone": "9876543210",
      "email": "rahul@example.com"
    },
    "bookingAmount": 500000,
    "bookingDate": "2024-12-29"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Unit status updated to booked",
  "data": {
    "status": "booked",
    "customer": {
      "name": "Rahul Sharma"
    }
  }
}
```

---

### TC-IM-012: Update Unit Status - Mark as Sold

**Preconditions:**
- Unit is booked

**Steps:**
1. Click on booked unit
2. Click "Mark as Sold"
3. Enter sale details
4. Confirm

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/inventory/units/<unit_id>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "sold",
    "salePrice": 8700000,
    "saleDate": "2024-12-29"
  }'
```

---

### TC-IM-013: Update Unit Status - Block Unit

**Preconditions:**
- Unit is available

**Steps:**
1. Click on available unit
2. Click "Block Unit"
3. Enter reason
4. Confirm

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/inventory/units/<unit_id>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "blocked",
    "blockReason": "Reserved for VIP client"
  }'
```

---

### TC-IM-014: Update Unit Status - Release Unit

**Preconditions:**
- Unit is blocked or booked

**Steps:**
1. Click on blocked/booked unit
2. Click "Release Unit"
3. Confirm

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/inventory/units/<unit_id>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "available"
  }'
```

---

### TC-IM-015: Update Unit Details

**Preconditions:**
- Unit exists

**Steps:**
1. Click edit on unit
2. Update carpet area to 1250 sqft
3. Update price to 88,00,000
4. Save changes

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/inventory/units/<unit_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "carpetArea": 1250,
    "basePrice": 8800000
  }'
```

---

### TC-IM-016: Delete Unit

**Preconditions:**
- Unit exists and is not sold

**Steps:**
1. Click delete on unit
2. Confirm deletion

**API Request:**
```bash
curl -X DELETE https://india-property-ads-api.onrender.com/api/v1/inventory/units/<unit_id> \
  -H "Authorization: Bearer <token>"
```

---

### TC-IM-017: Get Project Inventory Stats

**Preconditions:**
- Project has towers and units

**Steps:**
1. Navigate to project inventory dashboard
2. View stats summary

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/inventory/projects/<project_id>/stats \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalTowers": 4,
    "totalUnits": 400,
    "unitsByStatus": {
      "available": 320,
      "booked": 45,
      "sold": 30,
      "blocked": 5
    },
    "unitsByType": {
      "2BHK": 200,
      "3BHK": 150,
      "4BHK": 50
    },
    "revenue": {
      "potential": 340000000,
      "booked": 38250000,
      "realized": 25500000
    }
  }
}
```

---

### TC-IM-018: Cannot Delete Sold Unit

**Preconditions:**
- Unit is sold

**Steps:**
1. Try to delete sold unit

**Expected Results:**
- Error message: "Cannot delete sold unit"
- Unit remains in system

---

### TC-IM-019: Cannot Delete Tower with Sold Units

**Preconditions:**
- Tower has sold units

**Steps:**
1. Try to delete tower

**Expected Results:**
- Error message: "Cannot delete tower with sold units"
- Tower remains in system

---

## UI Test Checklist

- [ ] Tower list displays correctly
- [ ] Unit grid/matrix view works
- [ ] Unit status colors are correct (green=available, yellow=booked, red=sold, gray=blocked)
- [ ] Floor-wise unit view works
- [ ] Bulk unit creation wizard works
- [ ] Unit details modal displays correctly
- [ ] Status change confirmation dialogs work
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Mobile responsive layout
- [ ] Stats dashboard displays correctly

---

## Performance Tests

| Test | Expected |
|------|----------|
| Create tower | < 500ms |
| Bulk create 100 units | < 3s |
| Get tower units | < 500ms |
| Update unit status | < 300ms |
| Get inventory stats | < 500ms |

---

## Security Tests

- [ ] Only project owner can manage inventory
- [ ] Cannot modify sold unit details
- [ ] Cannot delete sold units
- [ ] Audit trail for status changes
- [ ] Customer data protected
