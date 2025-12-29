# Document Management - Test Scripts

## Overview
Test scripts for Document Management feature allowing builders to upload, manage, and generate documents from templates.

---

## Prerequisites
- User account with `owner` role
- Verified builder profile
- **Frontend URL**: https://indiapropertyads.netlify.app
- **Backend API URL**: https://india-property-ads-api.onrender.com/api/v1
- Valid authentication token
- AWS S3 configured for document storage

---

## API Endpoints

### Document Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents` | Upload document |
| GET | `/api/v1/documents` | Get builder's documents |
| GET | `/api/v1/documents/:id` | Get document by ID |
| PUT | `/api/v1/documents/:id` | Update document |
| POST | `/api/v1/documents/:id/version` | Upload new version |
| DELETE | `/api/v1/documents/:id` | Delete document |
| POST | `/api/v1/documents/:id/share` | Share document |
| GET | `/api/v1/documents/project/:projectId` | Get project documents |
| GET | `/api/v1/documents/unit/:unitId` | Get unit documents |

### Template Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/templates` | Create template |
| GET | `/api/v1/documents/templates` | Get builder's templates |
| GET | `/api/v1/documents/templates/:id` | Get template by ID |
| PUT | `/api/v1/documents/templates/:id` | Update template |
| DELETE | `/api/v1/documents/templates/:id` | Delete template |
| POST | `/api/v1/documents/templates/:id/preview` | Preview template |
| POST | `/api/v1/documents/templates/:id/generate` | Generate document |

---

## Test Cases - Document Upload

### TC-DM-001: Upload PDF Document

**Preconditions:**
- Builder profile exists
- PDF file ready for upload

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/builder/documents`
2. Click "Upload Document"
3. Select PDF file (e.g., "RERA_Certificate.pdf")
4. Fill in details:
   - Name: "RERA Certificate"
   - Type: "rera-certificate"
   - Description: "Project RERA registration certificate"
5. Click "Upload"

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/RERA_Certificate.pdf" \
  -F 'metadata={"name":"RERA Certificate","documentType":"rera-certificate","description":"Project RERA registration certificate"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "...",
    "name": "RERA Certificate",
    "documentType": "rera-certificate",
    "file": {
      "url": "https://s3.amazonaws.com/...",
      "key": "documents/builder-.../...",
      "originalName": "RERA_Certificate.pdf",
      "mimeType": "application/pdf",
      "size": 125000,
      "extension": "pdf"
    },
    "status": "active",
    "version": 1
  }
}
```

---

### TC-DM-002: Upload Image Document (ID Proof)

**Steps:**
1. Click "Upload Document"
2. Select image file (JPG/PNG)
3. Fill in details:
   - Name: "Customer Aadhar"
   - Type: "id-proof"
   - Customer Name: "Rahul Sharma"
   - Customer Phone: "9876543210"
4. Click "Upload"

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/aadhar.jpg" \
  -F 'metadata={"name":"Customer Aadhar","documentType":"id-proof","customer":{"name":"Rahul Sharma","phone":"9876543210"}}'
```

---

### TC-DM-003: Upload Document with Project Association

**Steps:**
1. Upload document
2. Associate with specific project
3. Save

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/approval.pdf" \
  -F 'metadata={"name":"Building Approval","documentType":"approval","projectId":"<project_id>"}'
```

---

### TC-DM-004: Upload Document with Tags

**Steps:**
1. Upload document
2. Add tags: "important", "2024", "tower-a"
3. Save

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/document.pdf" \
  -F 'metadata={"name":"Tower A Plans","documentType":"floor-plan","tags":["important","2024","tower-a"]}'
```

---

### TC-DM-005: Get Builder's Documents

**Steps:**
1. Navigate to documents page
2. View document list

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/documents?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "documents": [...],
    "typeCounts": {
      "agreement": 5,
      "receipt": 10,
      "id-proof": 15,
      "rera-certificate": 2
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 32,
      "pages": 2
    }
  }
}
```

---

### TC-DM-006: Filter Documents by Type

**Steps:**
1. Select filter: Type = "agreement"
2. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/documents?documentType=agreement" \
  -H "Authorization: Bearer <token>"
```

---

### TC-DM-007: Search Documents

**Steps:**
1. Enter search term: "RERA"
2. View search results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/documents?search=RERA" \
  -H "Authorization: Bearer <token>"
```

---

### TC-DM-008: Get Single Document

**Steps:**
1. Click on document to view details

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/documents/<document_id> \
  -H "Authorization: Bearer <token>"
```

---

### TC-DM-009: Update Document Metadata

**Steps:**
1. Click edit on document
2. Update name and description
3. Save changes

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/documents/<document_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Updated Document Name",
    "description": "Updated description",
    "tags": ["updated", "important"]
  }'
```

---

### TC-DM-010: Upload New Document Version

**Preconditions:**
- Document exists

**Steps:**
1. Click on document
2. Click "Upload New Version"
3. Select updated file
4. Add change note: "Updated with latest amendments"
5. Upload

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents/<document_id>/version \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/updated_document.pdf" \
  -F "changeNote=Updated with latest amendments"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document updated to version 2",
  "data": {
    "version": 2,
    "previousVersions": [
      {
        "version": 1,
        "file": {...},
        "uploadedAt": "..."
      }
    ]
  }
}
```

---

### TC-DM-011: Delete Document (Soft Delete)

**Steps:**
1. Click delete on document
2. Confirm deletion

**API Request:**
```bash
curl -X DELETE https://india-property-ads-api.onrender.com/api/v1/documents/<document_id> \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

### TC-DM-012: Delete Document (Hard Delete with S3)

**Steps:**
1. Delete document with hardDelete flag

**API Request:**
```bash
curl -X DELETE "https://india-property-ads-api.onrender.com/api/v1/documents/<document_id>?hardDelete=true" \
  -H "Authorization: Bearer <token>"
```

**Expected Results:**
- Document removed from database
- File removed from S3

---

### TC-DM-013: Share Document

**Steps:**
1. Click share on document
2. Enter recipient email
3. Select access type: "view" or "download"
4. Set expiry: 7 days
5. Share

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents/<document_id>/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "email": "customer@example.com",
    "accessType": "download",
    "expiresInDays": 7
  }'
```

---

### TC-DM-014: Get Project Documents

**Steps:**
1. Navigate to project
2. View associated documents

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/documents/project/<project_id> \
  -H "Authorization: Bearer <token>"
```

---

### TC-DM-015: Get Unit Documents

**Steps:**
1. Navigate to unit
2. View associated documents

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/documents/unit/<unit_id> \
  -H "Authorization: Bearer <token>"
```

---

## Test Cases - Document Templates

### TC-DM-016: Create Booking Agreement Template

**Steps:**
1. Navigate to Templates tab
2. Click "Create Template"
3. Fill in details:
   - Name: "Booking Agreement"
   - Type: "booking-agreement"
   - Category: "legal"
4. Enter HTML content with variables:
   ```html
   <h1>Booking Agreement</h1>
   <p>Project: {{projectName}}</p>
   <p>Builder: {{builderName}}</p>
   <p>Buyer: {{buyerName}}</p>
   <p>Unit: {{unitNumber}}, {{towerName}}</p>
   <p>Price: {{totalPrice}}</p>
   <p>Booking Amount: {{bookingAmount}}</p>
   <p>Date: {{date}}</p>
   ```
5. Save template

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Booking Agreement",
    "templateType": "booking-agreement",
    "category": "legal",
    "description": "Standard booking agreement template",
    "content": {
      "body": "<h1>Booking Agreement</h1><p>Project: {{projectName}}</p><p>Builder: {{builderName}}</p><p>Buyer: {{buyerName}}</p><p>Unit: {{unitNumber}}, {{towerName}}</p><p>Price: {{totalPrice}}</p><p>Booking Amount: {{bookingAmount}}</p><p>Date: {{date}}</p>"
    },
    "variables": [
      { "name": "projectName", "label": "Project Name", "type": "text", "required": true },
      { "name": "builderName", "label": "Builder Name", "type": "text", "required": true },
      { "name": "buyerName", "label": "Buyer Name", "type": "text", "required": true },
      { "name": "unitNumber", "label": "Unit Number", "type": "text", "required": true },
      { "name": "towerName", "label": "Tower Name", "type": "text", "required": true },
      { "name": "totalPrice", "label": "Total Price", "type": "currency", "required": true },
      { "name": "bookingAmount", "label": "Booking Amount", "type": "currency", "required": true },
      { "name": "date", "label": "Date", "type": "date", "required": true }
    ],
    "pageSettings": {
      "size": "A4",
      "orientation": "portrait",
      "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "_id": "...",
    "name": "Booking Agreement",
    "templateType": "booking-agreement",
    "variables": [...],
    "isActive": true
  }
}
```

---

### TC-DM-017: Create Payment Receipt Template

**Steps:**
1. Create receipt template with variables

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Payment Receipt",
    "templateType": "payment-receipt",
    "category": "financial",
    "content": {
      "body": "<h1>Payment Receipt</h1><p>Receipt No: {{receiptNumber}}</p><p>Date: {{date}}</p><p>Received from: {{customerName}}</p><p>Amount: {{amount}}</p><p>Payment Mode: {{paymentMode}}</p><p>For: {{description}}</p>"
    },
    "variables": [
      { "name": "receiptNumber", "label": "Receipt Number", "type": "text", "required": true },
      { "name": "date", "label": "Date", "type": "date", "required": true },
      { "name": "customerName", "label": "Customer Name", "type": "text", "required": true },
      { "name": "amount", "label": "Amount", "type": "currency", "required": true },
      { "name": "paymentMode", "label": "Payment Mode", "type": "select", "options": ["Cash", "Cheque", "NEFT", "RTGS", "UPI"], "required": true },
      { "name": "description", "label": "Description", "type": "text", "required": true }
    ]
  }'
```

---

### TC-DM-018: Get Builder's Templates

**Steps:**
1. Navigate to Templates tab
2. View template list

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/documents/templates?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

---

### TC-DM-019: Filter Templates by Type

**Steps:**
1. Select filter: Type = "booking-agreement"
2. View filtered results

**API Request:**
```bash
curl -X GET "https://india-property-ads-api.onrender.com/api/v1/documents/templates?templateType=booking-agreement" \
  -H "Authorization: Bearer <token>"
```

---

### TC-DM-020: Update Template

**Steps:**
1. Click edit on template
2. Update content
3. Save changes

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/documents/templates/<template_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Updated Booking Agreement",
    "content": {
      "body": "<h1>Updated Booking Agreement</h1>..."
    }
  }'
```

---

### TC-DM-021: Preview Template

**Steps:**
1. Click preview on template
2. Enter sample variable values
3. View preview

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents/templates/<template_id>/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "variables": {
      "projectName": "Sunrise Heights",
      "builderName": "ABC Developers",
      "buyerName": "Rahul Sharma",
      "unitNumber": "A-1001",
      "towerName": "Tower A",
      "totalPrice": "₹85,00,000",
      "bookingAmount": "₹5,00,000",
      "date": "29-Dec-2024"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "html": "<h1>Booking Agreement</h1><p>Project: Sunrise Heights</p>..."
  }
}
```

---

### TC-DM-022: Generate Document from Template

**Steps:**
1. Click "Use Template" on a template
2. Fill in all variable values
3. Click "Generate Document"

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/documents/templates/<template_id>/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "variables": {
      "projectName": "Sunrise Heights",
      "builderName": "ABC Developers",
      "buyerName": "Rahul Sharma",
      "unitNumber": "A-1001",
      "towerName": "Tower A",
      "totalPrice": "₹85,00,000",
      "bookingAmount": "₹5,00,000",
      "date": "29-Dec-2024"
    },
    "projectId": "<project_id>",
    "unitId": "<unit_id>",
    "customer": {
      "name": "Rahul Sharma",
      "phone": "9876543210",
      "email": "rahul@example.com"
    },
    "saveAsDocument": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document generated successfully",
  "data": {
    "html": "...",
    "document": {
      "_id": "...",
      "name": "Booking Agreement - Rahul Sharma",
      "documentType": "agreement",
      "category": "generated"
    }
  }
}
```

---

### TC-DM-023: Delete Template

**Steps:**
1. Click delete on template
2. Confirm deletion

**API Request:**
```bash
curl -X DELETE https://india-property-ads-api.onrender.com/api/v1/documents/templates/<template_id> \
  -H "Authorization: Bearer <token>"
```

---

## File Type Tests

### TC-DM-024: Upload Supported File Types

**Test each file type:**
- PDF (.pdf) ✓
- Word (.doc, .docx) ✓
- Excel (.xls, .xlsx) ✓
- Text (.txt) ✓
- CSV (.csv) ✓
- JPEG (.jpg, .jpeg) ✓
- PNG (.png) ✓
- WebP (.webp) ✓
- GIF (.gif) ✓

---

### TC-DM-025: Reject Unsupported File Types

**Steps:**
1. Try to upload .exe file
2. Try to upload .zip file

**Expected Results:**
- Error: "Invalid file type"
- Upload rejected

---

### TC-DM-026: File Size Limit (25MB)

**Steps:**
1. Try to upload file > 25MB

**Expected Results:**
- Error: "File size exceeds 25MB limit"
- Upload rejected

---

## UI Test Checklist

- [ ] Document list displays correctly
- [ ] Document type badges show correct colors
- [ ] File icons display based on type
- [ ] Upload modal works
- [ ] File picker accepts correct types
- [ ] Upload progress indicator shows
- [ ] Template list displays correctly
- [ ] Template editor works
- [ ] Variable input form generates correctly
- [ ] Preview modal displays HTML
- [ ] Search and filters work
- [ ] Pagination works
- [ ] Mobile responsive layout

---

## Performance Tests

| Test | Expected |
|------|----------|
| Upload document (5MB) | < 5s |
| Get documents list | < 500ms |
| Generate from template | < 1s |
| Preview template | < 500ms |
| Delete document | < 500ms |

---

## Security Tests

- [ ] Only builder can access own documents
- [ ] Shared documents expire correctly
- [ ] File URLs are signed/protected
- [ ] XSS prevention in template content
- [ ] File type validation on server
- [ ] File size validation on server
- [ ] Customer data protected in documents
