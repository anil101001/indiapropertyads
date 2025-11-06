# 🧪 Complete Testing Guide - India Property Ads

## 📋 Testing Checklist

Your live sites:
- **Frontend:** https://indiapropertyads.netlify.app
- **Backend:** https://india-property-ads-api.onrender.com

---

## **Test 1: Create Users (All Roles)**

### **A. Create Owner Account**
1. Go to: https://indiapropertyads.netlify.app/register
2. Fill in:
   - **Name:** `John Owner`
   - **Email:** `owner@test.com`
   - **Password:** `owner123`
   - **Phone:** `9876543210`
   - **Role:** Select **"Property Owner"**
   - **Location:** Mumbai, Maharashtra
3. Click **"Create Account"**
4. ✅ **Expected:** Redirected to login or dashboard
5. **Note down:** Email and password

---

### **B. Create Agent Account**
1. Go to: https://indiapropertyads.netlify.app/register
2. Fill in:
   - **Name:** `Sarah Agent`
   - **Email:** `agent@test.com`
   - **Password:** `agent123`
   - **Phone:** `9876543211`
   - **Role:** Select **"Real Estate Agent"**
   - **Location:** Delhi, Delhi
3. Click **"Create Account"**
4. ✅ **Expected:** Redirected to login or agent dashboard
5. **Note down:** Email and password

---

### **C. Create Buyer Account**
1. Go to: https://indiapropertyads.netlify.app/register
2. Fill in:
   - **Name:** `Mike Buyer`
   - **Email:** `buyer@test.com`
   - **Password:** `buyer123`
   - **Phone:** `9876543212`
   - **Role:** Select **"Property Buyer"**
   - **Location:** Bangalore, Karnataka
3. Click **"Create Account"**
4. ✅ **Expected:** Redirected to login or home page
5. **Note down:** Email and password

---

### **D. Admin Account (Already Exists)**
- **Email:** `admin@test.com`
- **Password:** `admin123`

---

## **Test 2: Property Listing (Owner)**

### **Step 1: Login as Owner**
1. Go to: https://indiapropertyads.netlify.app/login
2. Enter:
   - **Email:** `owner@test.com`
   - **Password:** `owner123`
3. Click **"Login"**
4. ✅ **Expected:** Redirected to owner dashboard

---

### **Step 2: List a Property**
1. Click **"List Property"** or navigate to `/add-property`
2. Fill in property details:

**Basic Info:**
- **Title:** `Beautiful 3BHK Apartment in Mumbai`
- **Description:** `Spacious apartment with sea view, modern amenities`
- **Property Type:** `Apartment`
- **Listing Type:** `Sale`

**Location:**
- **Address:** `123 Marine Drive`
- **City:** `Mumbai`
- **State:** `Maharashtra`
- **Pincode:** `400001`

**Specs:**
- **Carpet Area:** `1500 sq ft`
- **Bedrooms:** `3`
- **Bathrooms:** `2`
- **Balconies:** `2`
- **Parking:** `1 covered`
- **Floor:** `5`
- **Total Floors:** `10`
- **Age:** `1-5 years`
- **Furnishing:** `Semi-furnished`

**Pricing:**
- **Expected Price:** `15000000` (1.5 Crore)
- **Price Negotiable:** ✅ Check
- **Maintenance:** `5000`

**Amenities:** Select a few (Gym, Swimming Pool, Security)

3. **Upload Images:** Upload 2-3 property images
4. Click **"Submit for Approval"**
5. ✅ **Expected:** Success message + Property submitted for approval

---

### **Step 3: Check Property Status**
1. Go to **"My Properties"** section
2. ✅ **Expected:** See your property with status: **"Pending Approval"**

---

## **Test 3: Property Listing (Agent - Auto-Approved)**

### **Step 1: Login as Agent**
1. Logout from owner account
2. Login with:
   - **Email:** `agent@test.com`
   - **Password:** `agent123`

---

### **Step 2: List a Property**
1. Click **"List Property"**
2. Fill in another property:
   - **Title:** `Luxury Villa in Goa`
   - **Type:** `Villa`
   - **Listing:** `Sale`
   - **Price:** `25000000` (2.5 Crore)
   - **Location:** Goa
   - (Fill other details)
3. Upload images
4. Click **"Submit"**
5. ✅ **Expected:** Property **immediately approved** (agents auto-approved)

---

### **Step 3: Verify Auto-Approval**
1. Go to **"My Properties"**
2. ✅ **Expected:** Property status: **"Approved"**
3. Go to main **"Properties"** page
4. ✅ **Expected:** Your property is **visible publicly**

---

## **Test 4: Admin Approval Workflow**

### **Step 1: Login as Admin**
1. Logout from agent account
2. Login with:
   - **Email:** `admin@test.com`
   - **Password:** `admin123`
3. ✅ **Expected:** Redirected to **Admin Dashboard**

---

### **Step 2: View Pending Properties**
1. Click **"Pending Properties"** from sidebar
2. ✅ **Expected:** See the owner's property (Mumbai apartment) in pending list

---

### **Step 3: Review Property Details**
1. Click on the property card to expand details
2. ✅ **Expected:** See all property information, images, owner details

---

### **Step 4: Approve Property**
1. Click **"Approve"** button
2. Confirm approval
3. ✅ **Expected:** 
   - Success message
   - Property removed from pending list
   - Property status changed to "Approved"

---

### **Step 5: Test Rejection (Optional)**
1. If owner lists another property, try rejecting it
2. Click **"Reject"**
3. Enter reason: `Images quality is poor, please re-upload`
4. ✅ **Expected:** Property status = "Rejected" with reason

---

## **Test 5: Public Property Viewing (Buyer)**

### **Step 1: Logout from Admin**
1. Click profile dropdown → Logout

---

### **Step 2: View as Guest (Public)**
1. Go to: https://indiapropertyads.netlify.app
2. Click **"Properties"** in navigation
3. ✅ **Expected:** See **ONLY approved properties**:
   - Mumbai apartment (owner, now approved)
   - Goa villa (agent, auto-approved)
4. ✅ **Should NOT see:** Pending or rejected properties

---

### **Step 3: Login as Buyer**
1. Click **"Login"**
2. Enter:
   - **Email:** `buyer@test.com`
   - **Password:** `buyer123`

---

### **Step 4: Browse Properties**
1. Go to **"Properties"** page
2. ✅ **Expected:** See all approved properties
3. Try filters:
   - Filter by **City:** Mumbai
   - Filter by **Type:** Apartment
   - Filter by **Price Range**
4. ✅ **Expected:** Results update correctly

---

### **Step 5: View Property Details**
1. Click on the Mumbai apartment
2. ✅ **Expected:** 
   - Full property details displayed
   - Images in gallery
   - Owner contact info
   - Map/location (if implemented)
   - Amenities list

---

## **Test 6: Cross-Role Verification**

### **A. Owner Checks Approved Property**
1. Login as `owner@test.com`
2. Go to **"My Properties"**
3. ✅ **Expected:** Property status changed to **"Approved"**
4. Go to public **"Properties"** page
5. ✅ **Expected:** See your property listed publicly

---

### **B. Agent Dashboard**
1. Login as `agent@test.com`
2. Check **"My Properties"**
3. ✅ **Expected:** All properties show "Approved"
4. Check dashboard stats
5. ✅ **Expected:** Shows property count, views (if implemented)

---

### **C. Admin Dashboard**
1. Login as `admin@test.com`
2. View **Admin Dashboard**
3. ✅ **Expected:** 
   - Total properties count
   - Pending count (should be 0 now)
   - Approved count
   - Users count by role

---

## **Test 7: Image Upload & S3 Integration**

### **Test Property with Images**
1. Login as owner or agent
2. Create new property
3. Upload 3-5 images
4. ✅ **Expected:** 
   - Images upload successfully
   - Preview shows correctly
   - After submission, images load from S3
   - Image URLs start with: `https://india-property-ads.s3.amazonaws.com/`

---

## **Test 8: Error Handling**

### **A. Invalid Login**
1. Try login with wrong password
2. ✅ **Expected:** "Invalid credentials" error

---

### **B. Duplicate Email**
1. Try registering with existing email
2. ✅ **Expected:** "Email already exists" error

---

### **C. Missing Required Fields**
1. Try submitting property without title
2. ✅ **Expected:** Validation error

---

### **D. Unauthorized Access**
1. Login as buyer
2. Try accessing: `/admin-dashboard` directly
3. ✅ **Expected:** Redirected or "Access Denied"

---

## **Test 9: Mobile Responsiveness**

1. Open site on mobile device or use browser dev tools (F12 → Mobile view)
2. Test:
   - ✅ Navigation menu (hamburger)
   - ✅ Property cards layout
   - ✅ Forms (Register, Login, Add Property)
   - ✅ Image gallery
3. ✅ **Expected:** All elements responsive and usable

---

## **Test 10: Performance**

### **First Load (Cold Start)**
1. Clear browser cache
2. Open: https://indiapropertyads.netlify.app
3. ✅ **Expected:** 
   - Frontend loads in <3 seconds
   - Backend (first API call) may take 50+ seconds (Render free tier cold start)
   - Show loading indicator

---

### **Subsequent Loads**
1. Navigate between pages
2. ✅ **Expected:** Instant page loads

---

## 📊 Testing Summary Sheet

Create a table and mark ✅ or ❌ as you test:

| Test Case | Status | Notes |
|-----------|--------|-------|
| Register Owner | ⬜ | |
| Register Agent | ⬜ | |
| Register Buyer | ⬜ | |
| Owner List Property | ⬜ | |
| Property Pending Status | ⬜ | |
| Agent List Property (Auto-approve) | ⬜ | |
| Admin View Pending | ⬜ | |
| Admin Approve Property | ⬜ | |
| Buyer View Properties | ⬜ | |
| Public View (No Auth) | ⬜ | |
| Image Upload to S3 | ⬜ | |
| Mobile Responsive | ⬜ | |
| Error Handling | ⬜ | |

---

## 🐛 Found Issues? Track Them

**Format:**
```
Issue #1: [Description]
Steps to reproduce:
1. ...
2. ...
Expected: ...
Actual: ...
```

---

## 🎉 Success Criteria

✅ All user roles can register and login  
✅ Owners can list properties (pending approval)  
✅ Agents can list properties (auto-approved)  
✅ Admins can approve/reject properties  
✅ Approved properties visible to public  
✅ Images upload to S3 successfully  
✅ Mobile responsive  
✅ No console errors  

---

## 🔑 Test User Credentials

### Admin
- **Email:** `admin@test.com`
- **Password:** `admin123`

### Owner (To be created)
- **Email:** `owner@test.com`
- **Password:** `owner123`

### Agent (To be created)
- **Email:** `agent@test.com`
- **Password:** `agent123`

### Buyer (To be created)
- **Email:** `buyer@test.com`
- **Password:** `buyer123`

---

**Happy Testing!** 🚀✨
