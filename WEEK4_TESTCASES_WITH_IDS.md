# Week 4: Test Cases with Unique IDs

**Project:** India Property Ads | **Module:** Week 4 Features  
**Total Test Cases:** 85 | **Date:** November 8, 2025

---

## Test Case Format
```
ID: TC-W4-XXX | Priority: Critical/High/Medium/Low | Type: Functional/UI/Integration
Status: ⬜ Not Started | ✅ Pass | ❌ Fail | ⚠️ Blocked
Tester: _______ | Date: _______
```

---

## 🔍 SEARCH & FILTER (TC-W4-001 to TC-W4-020)

| ID | Title | Priority | Type | Expected Result | Status |
|----|-------|----------|------|-----------------|--------|
| TC-W4-001 | Basic Search with Debounce | High | Functional | Search triggers after 500ms delay, Mumbai properties only | ⬜ |
| TC-W4-002 | Search Clear Button | Medium | UI | X button clears search, shows all properties | ⬜ |
| TC-W4-003 | Search No Results | Medium | Functional | "No Properties Found" message displayed | ⬜ |
| TC-W4-004 | Filter Panel Toggle | Medium | UI | Panel expands/collapses smoothly | ⬜ |
| TC-W4-005 | City Filter Single Selection | High | Functional | Only Mumbai properties shown, badge = 1 | ⬜ |
| TC-W4-006 | Property Type Filter | High | Functional | Only selected type shown (Apartment/Villa/House/Plot) | ⬜ |
| TC-W4-007 | Listing Type Filter | High | Functional | Sale/Rent filter works correctly | ⬜ |
| TC-W4-008 | Price Min Only | High | Functional | Properties >= min price only | ⬜ |
| TC-W4-009 | Price Max Only | High | Functional | Properties <= max price only | ⬜ |
| TC-W4-010 | Price Range Both | High | Functional | Properties between min-max only | ⬜ |
| TC-W4-011 | Bedrooms Filter | Medium | Functional | Correct BHK properties shown | ⬜ |
| TC-W4-012 | Multiple Filters Combined | Critical | Integration | All 6 filters work together (AND logic) | ⬜ |
| TC-W4-013 | Clear All Filters | High | Functional | All filters reset, badge removed | ⬜ |
| TC-W4-014 | Sort Newest First | Medium | Functional | Properties sorted by date DESC | ⬜ |
| TC-W4-015 | Sort Price Low to High | Medium | Functional | Properties sorted by price ASC | ⬜ |
| TC-W4-016 | Sort Price High to Low | Medium | Functional | Properties sorted by price DESC | ⬜ |
| TC-W4-017 | Sort Most Viewed | Medium | Functional | Properties sorted by views DESC | ⬜ |
| TC-W4-018 | Filter + Sort Combination | High | Integration | Both work together without conflict | ⬜ |
| TC-W4-019 | Filter Badge Count Accuracy | Low | UI | Badge shows correct active filter count | ⬜ |
| TC-W4-020 | Search + Filter + Sort All | Critical | Integration | All features work together perfectly | ⬜ |

---

## 💬 INQUIRY & CONTACT (TC-W4-021 to TC-W4-040)

| ID | Title | Priority | Type | Expected Result | Status |
|----|-------|----------|------|-----------------|--------|
| TC-W4-021 | Contact Section Not Logged In | High | Functional | Form disabled, "Please login" message | ⬜ |
| TC-W4-022 | Direct Call Button | High | Functional | Opens phone dialer with owner number | ⬜ |
| TC-W4-023 | Direct WhatsApp Button | High | Functional | Opens WhatsApp with pre-filled message | ⬜ |
| TC-W4-024 | Direct Email Button | High | Functional | Opens email with pre-filled subject/body | ⬜ |
| TC-W4-025 | Inquiry Form Login Required | High | Security | Cannot interact without login | ⬜ |
| TC-W4-026 | Form Enabled After Login | High | Functional | All form fields editable when logged in | ⬜ |
| TC-W4-027 | Validation Empty Message | High | Validation | Error: "Message is required" | ⬜ |
| TC-W4-028 | Validation Short Message (<10 chars) | High | Validation | Error: "Min 10 characters" | ⬜ |
| TC-W4-029 | Validation Max Characters (500) | Medium | Validation | Cannot exceed 500 characters | ⬜ |
| TC-W4-030 | Character Counter Real-time | Low | UI | Counter updates instantly (X/500) | ⬜ |
| TC-W4-031 | Contact Method Selection | Medium | UI | Only one method selected at a time | ⬜ |
| TC-W4-032 | Send Inquiry Success | Critical | Functional | Inquiry sent, green success message shown | ⬜ |
| TC-W4-033 | Duplicate Inquiry Prevention | High | Business Logic | Error: "Already sent inquiry" | ⬜ |
| TC-W4-034 | Inquiry Database Record | Critical | Integration | All fields saved correctly in MongoDB | ⬜ |
| TC-W4-035 | Property Inquiry Count Increment | High | Integration | Property stats.inquiries +1 | ⬜ |
| TC-W4-036 | Special Characters Handling | Medium | Validation | Special chars accepted and saved | ⬜ |
| TC-W4-037 | Multiple Properties Multiple Inquiries | Medium | Functional | Can inquire different properties | ⬜ |
| TC-W4-038 | Contact Button Colors | Low | UI | Call=Blue, WhatsApp=Green, Email=Gray | ⬜ |
| TC-W4-039 | Cannot Modify Sent Inquiry | Medium | Functional | No edit after submission | ⬜ |
| TC-W4-040 | Network Error Handling | Medium | Error Handling | Error message shown, can retry | ⬜ |

---

## 📊 BUYER DASHBOARD (TC-W4-041 to TC-W4-055)

| ID | Title | Priority | Type | Expected Result | Status |
|----|-------|----------|------|-----------------|--------|
| TC-W4-041 | Access Buyer Dashboard | High | Functional | Navigate to /buyer-dashboard successfully | ⬜ |
| TC-W4-042 | Stats Cards Display | High | Functional | 4 cards: Total, New, Contacted, Interested with correct counts | ⬜ |
| TC-W4-043 | Filter Tabs Visible | Medium | UI | 6 tabs: All, New, Contacted, Interested, Not Interested, Closed | ⬜ |
| TC-W4-044 | Filter by New | High | Functional | Only new inquiries shown | ⬜ |
| TC-W4-045 | Filter by Contacted | High | Functional | Only contacted inquiries shown | ⬜ |
| TC-W4-046 | Filter by Interested | High | Functional | Only interested inquiries shown | ⬜ |
| TC-W4-047 | Inquiry Card Display | High | UI | Image, title, location, price, status, message, response | ⬜ |
| TC-W4-048 | Status Badge Colors | Medium | UI | New=Blue, Contacted=Yellow, Interested=Green, etc. | ⬜ |
| TC-W4-049 | Your Message Display | Medium | UI | Gray box with message text and contact method | ⬜ |
| TC-W4-050 | Owner Response Display | High | UI | Green box with owner's reply (if responded) | ⬜ |
| TC-W4-051 | Timestamps Display | Medium | UI | "Sent on [date]" and "Responded on [date]" | ⬜ |
| TC-W4-052 | View Property Link | Medium | Functional | Navigates to property detail page | ⬜ |
| TC-W4-053 | Empty State Display | Medium | UI | Icon, message, "Browse Properties" button | ⬜ |
| TC-W4-054 | Stats Auto-Update | High | Functional | Stats update when inquiry status changes | ⬜ |
| TC-W4-055 | Pagination Works | Medium | Functional | Load more inquiries if >20 | ⬜ |

---

## 🏢 OWNER DASHBOARD (TC-W4-056 to TC-W4-070)

| ID | Title | Priority | Type | Expected Result | Status |
|----|-------|----------|------|-----------------|--------|
| TC-W4-056 | Access Owner Dashboard | High | Functional | Navigate to /owner-dashboard successfully | ⬜ |
| TC-W4-057 | Stats Cards Owner | High | Functional | 4 cards: Total Inquiries, New, Properties, Total Views | ⬜ |
| TC-W4-058 | Tab Switching | Medium | UI | Switch between Inquiries and Properties tabs | ⬜ |
| TC-W4-059 | Inquiries Tab Default | Medium | UI | Inquiries tab active by default | ⬜ |
| TC-W4-060 | Filter Inquiries by Status | High | Functional | Filter tabs work (All, New, Contacted, etc.) | ⬜ |
| TC-W4-061 | Buyer Info Display | High | UI | Name, phone, email, WhatsApp links visible | ⬜ |
| TC-W4-062 | Buyer Contact Links Work | High | Functional | Call, Email, WhatsApp links functional | ⬜ |
| TC-W4-063 | Message Box Display | Medium | UI | Blue box with buyer message and timestamp | ⬜ |
| TC-W4-064 | Respond Button | High | Functional | "Respond to Inquiry" expands form | ⬜ |
| TC-W4-065 | Response Form Fields | High | UI | Textarea + 4 buttons (Contacted, Interested, Not Interested, Cancel) | ⬜ |
| TC-W4-066 | Mark as Contacted | Critical | Functional | Status updated, response saved, form closes | ⬜ |
| TC-W4-067 | Mark as Interested | High | Functional | Status=interested, response saved | ⬜ |
| TC-W4-068 | Mark Not Interested | High | Functional | Status=not-interested, response saved | ⬜ |
| TC-W4-069 | Cancel Response | Low | UI | Form closes, no changes saved | ⬜ |
| TC-W4-070 | Existing Response Display | Medium | UI | Green box showing previous response | ⬜ |

---

## 🏠 PROPERTY MANAGEMENT (TC-W4-071 to TC-W4-085)

| ID | Title | Priority | Type | Expected Result | Status |
|----|-------|----------|------|-----------------|--------|
| TC-W4-071 | Access My Properties | High | Functional | Navigate to /my-properties successfully | ⬜ |
| TC-W4-072 | Stats Cards Property Mgmt | High | Functional | 5 cards: Total, Approved, Pending, Views, Inquiries | ⬜ |
| TC-W4-073 | Status Filter Tabs | High | Functional | 6 tabs: All, Approved, Pending, Draft, Sold, Rented | ⬜ |
| TC-W4-074 | Filter by Approved | High | Functional | Only approved properties shown | ⬜ |
| TC-W4-075 | Filter by Pending | High | Functional | Only pending properties shown | ⬜ |
| TC-W4-076 | Filter by Sold | Medium | Functional | Only sold properties shown | ⬜ |
| TC-W4-077 | Property Card Layout | High | UI | Image left, details right, status badge visible | ⬜ |
| TC-W4-078 | Analytics Display | High | UI | Views, inquiries, conversion rate (XX.X%) | ⬜ |
| TC-W4-079 | Conversion Calculation | High | Functional | (inquiries/views)*100 = correct percentage | ⬜ |
| TC-W4-080 | Action Buttons Visible | High | UI | View, Edit, Mark Sold/Rented, Delete | ⬜ |
| TC-W4-081 | Mark as Sold | Critical | Functional | Confirmation, status=sold, blue badge, stats update | ⬜ |
| TC-W4-082 | Mark as Rented | High | Functional | Confirmation, status=rented, purple badge, stats update | ⬜ |
| TC-W4-083 | Delete Property | High | Functional | Warning confirmation, property removed, stats update | ⬜ |
| TC-W4-084 | View Property Button | Medium | Functional | Opens property detail in new tab/same tab | ⬜ |
| TC-W4-085 | Edit Property Button | High | Functional | Navigates to edit page with pre-filled data | ⬜ |

---

## 📋 Test Execution Summary

| Category | Total Tests | Passed | Failed | Blocked | Not Started |
|----------|-------------|--------|--------|---------|-------------|
| Search & Filter | 20 | ___ | ___ | ___ | ___ |
| Inquiry & Contact | 20 | ___ | ___ | ___ | ___ |
| Buyer Dashboard | 15 | ___ | ___ | ___ | ___ |
| Owner Dashboard | 15 | ___ | ___ | ___ | ___ |
| Property Management | 15 | ___ | ___ | ___ | ___ |
| **TOTAL** | **85** | **___** | **___** | **___** | **___** |

**Pass Rate:** ____%  
**Test Start Date:** ___________  
**Test End Date:** ___________  
**Tested By:** ___________

---

## 🐛 Defect Tracking Template

```
Bug ID: BUG-W4-XXX
Related Test Case: TC-W4-XXX
Title: [Bug title]
Severity: Critical | High | Medium | Low
Priority: Critical | High | Medium | Low
Steps to Reproduce:
1. Step 1
2. Step 2
Expected: [What should happen]
Actual: [What actually happened]
Environment: [Browser, OS]
Screenshot: [If applicable]
Status: Open | In Progress | Fixed | Closed
Reported By: _______
Date: _______
```

---

## ✅ Sign-off

**QA Lead Approval:**  
Name: ___________  
Signature: ___________  
Date: ___________

**Product Manager Approval:**  
Name: ___________  
Signature: ___________  
Date: ___________

**Ready for Production:** ☐ Yes ☐ No

---

**Document Version:** 1.0  
**Last Updated:** November 8, 2025
