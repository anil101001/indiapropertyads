# 🧪 Test Cases Summary - India Property Ads

## Test Environment
- **Frontend:** https://indiapropertyads.netlify.app
- **Backend:** https://india-property-ads-api.onrender.com

---

## 📊 Test Cases by Module

### **Module 1: User Registration**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-REG-001 | Register as Property Owner | 1. Navigate to /register<br>2. Fill form with Owner role<br>3. Submit | User created, redirected to login/dashboard | ⬜ | |
| TC-REG-002 | Register as Real Estate Agent | 1. Navigate to /register<br>2. Fill form with Agent role<br>3. Submit | User created, redirected to login/dashboard | ⬜ | |
| TC-REG-003 | Register as Property Buyer | 1. Navigate to /register<br>2. Fill form with Buyer role<br>3. Submit | User created, redirected to login/dashboard | ⬜ | |
| TC-REG-004 | Duplicate Email Registration | 1. Try registering with existing email | Error: "Email already exists" | ⬜ | |
| TC-REG-005 | Registration with Missing Fields | 1. Submit form with empty required fields | Validation errors displayed | ⬜ | |

---

### **Module 2: User Authentication**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-AUTH-001 | Login as Owner | 1. Navigate to /login<br>2. Enter owner credentials<br>3. Submit | Redirected to owner dashboard | ⬜ | |
| TC-AUTH-002 | Login as Agent | 1. Navigate to /login<br>2. Enter agent credentials<br>3. Submit | Redirected to agent dashboard | ⬜ | |
| TC-AUTH-003 | Login as Buyer | 1. Navigate to /login<br>2. Enter buyer credentials<br>3. Submit | Redirected to home/properties | ⬜ | |
| TC-AUTH-004 | Login as Admin | 1. Navigate to /login<br>2. Enter admin credentials<br>3. Submit | Redirected to admin dashboard | ⬜ | |
| TC-AUTH-005 | Login with Invalid Credentials | 1. Enter wrong password<br>2. Submit | Error: "Invalid credentials" | ⬜ | |
| TC-AUTH-006 | Logout Functionality | 1. Click profile dropdown<br>2. Click Logout | Redirected to home, session cleared | ⬜ | |

---

### **Module 3: Property Listing - Owner**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-PROP-OWN-001 | Access Add Property Page | 1. Login as owner<br>2. Navigate to /add-property | Form displayed with all fields | ⬜ | |
| TC-PROP-OWN-002 | Submit Property for Approval | 1. Fill complete property form<br>2. Upload images<br>3. Submit | Success message, property status: "Pending Approval" | ⬜ | |
| TC-PROP-OWN-003 | View My Properties | 1. Navigate to "My Properties" | List of owner's properties displayed | ⬜ | |
| TC-PROP-OWN-004 | Property Status Display | 1. Check property in "My Properties" | Status shows "Pending Approval" | ⬜ | |
| TC-PROP-OWN-005 | Submit Property without Required Fields | 1. Leave title empty<br>2. Submit | Validation error displayed | ⬜ | |
| TC-PROP-OWN-006 | Property with All Amenities | 1. Fill form<br>2. Select multiple amenities<br>3. Submit | Property saved with all amenities | ⬜ | |

---

### **Module 4: Property Listing - Agent (Auto-Approval)**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-PROP-AGT-001 | Agent List Property | 1. Login as agent<br>2. Fill property form<br>3. Submit | Property immediately approved | ⬜ | |
| TC-PROP-AGT-002 | Verify Auto-Approval Status | 1. Check "My Properties" | Status shows "Approved" | ⬜ | |
| TC-PROP-AGT-003 | Agent Property Public Visibility | 1. Navigate to public properties page | Agent's property visible immediately | ⬜ | |
| TC-PROP-AGT-004 | Multiple Properties by Agent | 1. Create 3 properties<br>2. Check all statuses | All show "Approved" | ⬜ | |

---

### **Module 5: Admin Approval Workflow**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-ADMIN-001 | Access Admin Dashboard | 1. Login as admin<br>2. Check dashboard | Dashboard with stats displayed | ⬜ | |
| TC-ADMIN-002 | View Pending Properties | 1. Navigate to "Pending Properties" | List of pending properties shown | ⬜ | |
| TC-ADMIN-003 | View Property Details | 1. Click on pending property | Full details, images, owner info displayed | ⬜ | |
| TC-ADMIN-004 | Approve Property | 1. Click "Approve" button<br>2. Confirm | Success message, property removed from pending | ⬜ | |
| TC-ADMIN-005 | Reject Property | 1. Click "Reject" button<br>2. Enter reason<br>3. Confirm | Property status: "Rejected" with reason | ⬜ | |
| TC-ADMIN-006 | Dashboard Statistics | 1. Check dashboard stats | Total properties, pending, approved, users count | ⬜ | |
| TC-ADMIN-007 | Admin View All Properties | 1. Navigate to all properties | Can see all properties (all statuses) | ⬜ | |

---

### **Module 6: Public Property Viewing**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-VIEW-001 | Guest View Properties | 1. Visit site without login<br>2. Go to Properties page | Only approved properties visible | ⬜ | |
| TC-VIEW-002 | Buyer View Properties | 1. Login as buyer<br>2. Browse properties | All approved properties displayed | ⬜ | |
| TC-VIEW-003 | Filter by City | 1. Select city filter | Properties filtered correctly | ⬜ | |
| TC-VIEW-004 | Filter by Property Type | 1. Select type filter | Properties filtered correctly | ⬜ | |
| TC-VIEW-005 | Filter by Price Range | 1. Set price range<br>2. Apply filter | Properties within range displayed | ⬜ | |
| TC-VIEW-006 | View Property Details | 1. Click on property card | Full details, gallery, owner contact, map | ⬜ | |
| TC-VIEW-007 | Property Image Gallery | 1. Open property details<br>2. Click images | Gallery with navigation works | ⬜ | |
| TC-VIEW-008 | Pending Properties Not Visible | 1. Browse as guest/buyer | Pending properties NOT shown | ⬜ | |
| TC-VIEW-009 | Rejected Properties Not Visible | 1. Browse as guest/buyer | Rejected properties NOT shown | ⬜ | |

---

### **Module 7: Cross-Role Verification**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-CROSS-001 | Owner Sees Approved Property | 1. Login as owner<br>2. Check "My Properties" | Status changed to "Approved" | ⬜ | |
| TC-CROSS-002 | Owner Property Public Visibility | 1. Navigate to public page | Owner's approved property visible | ⬜ | |
| TC-CROSS-003 | Agent Dashboard Stats | 1. Login as agent<br>2. Check dashboard | Property count, views displayed | ⬜ | |
| TC-CROSS-004 | Buyer Cannot Access Admin | 1. Login as buyer<br>2. Try /admin-dashboard | Access denied / redirected | ⬜ | |
| TC-CROSS-005 | Owner Cannot Access Admin | 1. Login as owner<br>2. Try /admin-dashboard | Access denied / redirected | ⬜ | |

---

### **Module 8: Image Upload & S3 Integration**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-IMG-001 | Upload Single Image | 1. Add property<br>2. Upload 1 image<br>3. Submit | Image uploads successfully | ⬜ | |
| TC-IMG-002 | Upload Multiple Images | 1. Add property<br>2. Upload 3-5 images<br>3. Submit | All images upload successfully | ⬜ | |
| TC-IMG-003 | Image Preview | 1. Upload images<br>2. Check preview | Preview displays correctly | ⬜ | |
| TC-IMG-004 | S3 URL Verification | 1. Submit property<br>2. Check image URLs | URLs start with S3 domain | ⬜ | |
| TC-IMG-005 | Image Load from S3 | 1. View property details<br>2. Check images | Images load from S3 correctly | ⬜ | |
| TC-IMG-006 | Large Image Upload | 1. Upload image >5MB | Handled correctly (accepted or error) | ⬜ | |
| TC-IMG-007 | Invalid File Type | 1. Try uploading PDF/TXT | Error: "Invalid file type" | ⬜ | |

---

### **Module 9: Error Handling**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-ERR-001 | Invalid Login Credentials | 1. Enter wrong password | Error message displayed | ⬜ | |
| TC-ERR-002 | Network Error Handling | 1. Disconnect internet<br>2. Try action | Friendly error message | ⬜ | |
| TC-ERR-003 | Backend Down/Cold Start | 1. First API call (cold backend) | Loading indicator shown | ⬜ | |
| TC-ERR-004 | Form Validation Errors | 1. Submit incomplete form | Field-specific errors shown | ⬜ | |
| TC-ERR-005 | 404 Page | 1. Navigate to invalid URL | 404 page displayed | ⬜ | |
| TC-ERR-006 | Session Expiry | 1. Wait for session timeout<br>2. Try action | Redirected to login | ⬜ | |

---

### **Module 10: UI/UX - Responsiveness**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-UI-001 | Mobile Navigation | 1. Open on mobile<br>2. Check hamburger menu | Menu works correctly | ⬜ | |
| TC-UI-002 | Mobile Property Cards | 1. View properties on mobile | Cards stack vertically | ⬜ | |
| TC-UI-003 | Mobile Forms | 1. Open registration form<br>2. Fill on mobile | Form usable and submits | ⬜ | |
| TC-UI-004 | Mobile Property Details | 1. Open property details | All sections responsive | ⬜ | |
| TC-UI-005 | Tablet Responsiveness | 1. View on tablet (768px) | Layout adapts correctly | ⬜ | |
| TC-UI-006 | Desktop Layout | 1. View on desktop (1920px) | Optimal layout and spacing | ⬜ | |
| TC-UI-007 | Image Gallery Mobile | 1. Open gallery on mobile | Swipe/navigation works | ⬜ | |

---

### **Module 11: Performance**

| Test Case ID | Test Case Description | Test Steps | Expected Result | Status | Notes |
|--------------|----------------------|------------|-----------------|--------|-------|
| TC-PERF-001 | Frontend First Load | 1. Clear cache<br>2. Open homepage | Loads in <3 seconds | ⬜ | |
| TC-PERF-002 | Backend Cold Start | 1. First API call (cold backend) | Loading indicator, eventual success | ⬜ | |
| TC-PERF-003 | Backend Warm State | 1. Subsequent API calls | Fast response (<2 seconds) | ⬜ | |
| TC-PERF-004 | Page Navigation Speed | 1. Navigate between pages | Instant page transitions | ⬜ | |
| TC-PERF-005 | Image Loading | 1. View property with images | Images load progressively | ⬜ | |
| TC-PERF-006 | Large Property List | 1. View 50+ properties | Smooth scrolling, no lag | ⬜ | |

---

## 📈 Testing Progress Summary

### Overall Statistics
- **Total Test Cases:** 87
- **Passed:** 0
- **Failed:** 0
- **Blocked:** 0
- **Not Executed:** 87

### Module-wise Summary

| Module | Total | Passed | Failed | Blocked | Not Executed | % Complete |
|--------|-------|--------|--------|---------|--------------|-----------|
| User Registration | 5 | 0 | 0 | 0 | 5 | 0% |
| User Authentication | 6 | 0 | 0 | 0 | 6 | 0% |
| Property Listing - Owner | 6 | 0 | 0 | 0 | 6 | 0% |
| Property Listing - Agent | 4 | 0 | 0 | 0 | 4 | 0% |
| Admin Approval Workflow | 7 | 0 | 0 | 0 | 7 | 0% |
| Public Property Viewing | 9 | 0 | 0 | 0 | 9 | 0% |
| Cross-Role Verification | 5 | 0 | 0 | 0 | 5 | 0% |
| Image Upload & S3 | 7 | 0 | 0 | 0 | 7 | 0% |
| Error Handling | 6 | 0 | 0 | 0 | 6 | 0% |
| UI/UX - Responsiveness | 7 | 0 | 0 | 0 | 7 | 0% |
| Performance | 6 | 0 | 0 | 0 | 6 | 0% |

---

## 🔑 Test User Credentials

### Admin (Pre-existing)
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Role:** Admin

### Owner (To Create)
- **Name:** John Owner
- **Email:** `owner@test.com`
- **Password:** `owner123`
- **Phone:** 9876543210
- **Role:** Property Owner
- **Location:** Mumbai, Maharashtra

### Agent (To Create)
- **Name:** Sarah Agent
- **Email:** `agent@test.com`
- **Password:** `agent123`
- **Phone:** 9876543211
- **Role:** Real Estate Agent
- **Location:** Delhi, Delhi

### Buyer (To Create)
- **Name:** Mike Buyer
- **Email:** `buyer@test.com`
- **Password:** `buyer123`
- **Phone:** 9876543212
- **Role:** Property Buyer
- **Location:** Bangalore, Karnataka

---

## 🐛 Bug Tracking Template

### Bug #[ID]: [Brief Description]

**Priority:** High / Medium / Low  
**Severity:** Critical / Major / Minor  
**Module:** [Module Name]  
**Test Case ID:** [Related Test Case]  

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**  


**Actual Result:**  


**Screenshots/Logs:**  


**Environment:**
- Browser: 
- OS: 
- Device: 

**Status:** Open / In Progress / Fixed / Closed

---

## 📝 Testing Notes

### Test Execution Guidelines
1. Execute test cases in sequence (TC-REG-001 through TC-PERF-006)
2. Mark status as: ✅ Pass | ❌ Fail | ⚠️ Blocked | ⬜ Not Executed
3. Document all bugs immediately using the bug template
4. Update progress summary after each module completion
5. Take screenshots for failed test cases

### Priority Modules
1. **High Priority:** User Registration, Authentication, Property Listing
2. **Medium Priority:** Admin Approval, Public Viewing, S3 Integration
3. **Low Priority:** Performance, Advanced Filters

### Known Limitations
- Backend cold start (Render free tier): 50+ seconds on first request
- Image upload limit: [Document if any]
- Property listing limit: [Document if any]

---

## ✅ Sign-off Criteria

### MVP Release Criteria
- [ ] All High Priority modules: 100% passed
- [ ] All Medium Priority modules: ≥95% passed
- [ ] Critical bugs: 0
- [ ] Major bugs: ≤2
- [ ] All user roles functional
- [ ] S3 image upload working
- [ ] Mobile responsive verified
- [ ] Performance acceptable (with known limitations)

### Tested By
- **Name:**
- **Date:**
- **Signature:**

### Approved By
- **Name:**
- **Date:**
- **Signature:**

---

**Last Updated:** [Date]  
**Document Version:** 1.0
