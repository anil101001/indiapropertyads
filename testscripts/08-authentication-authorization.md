# Authentication & Authorization - Test Scripts

## Overview
Test scripts for Authentication and Authorization features including user registration, login, role-based access control.

---

## Prerequisites
- **Frontend URL**: https://indiapropertyads.netlify.app
- **Backend API URL**: https://india-property-ads-api.onrender.com/api/v1

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| PUT | `/api/v1/auth/update-password` | Update password |

---

## Test Cases - Registration

### TC-AU-001: Register New User (Buyer)

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/register`
2. Fill in details:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "9876543210"
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"
   - Role: "buyer"
3. Click "Register"

**Expected Results:**
- Account created successfully
- Redirected to login or dashboard
- Verification email sent (if enabled)

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "SecurePass123!",
    "role": "buyer"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "buyer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### TC-AU-002: Register New User (Owner)

**Steps:**
1. Navigate to register page
2. Fill in details with role: "owner"
3. Click "Register"

**Expected Results:**
- Account created with owner role
- Can access builder registration

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Builder User",
    "email": "builder@example.com",
    "phone": "9876543211",
    "password": "SecurePass123!",
    "role": "owner"
  }'
```

---

### TC-AU-003: Register with Existing Email

**Steps:**
1. Try to register with already registered email
2. Submit form

**Expected Results:**
- Error: "Email already registered"
- Registration fails

---

### TC-AU-004: Register with Invalid Email Format

**Steps:**
1. Enter invalid email: "invalid-email"
2. Submit form

**Expected Results:**
- Validation error: "Invalid email format"
- Form not submitted

---

### TC-AU-005: Register with Weak Password

**Steps:**
1. Enter weak password: "123"
2. Submit form

**Expected Results:**
- Validation error: "Password must be at least 8 characters"
- Form not submitted

---

### TC-AU-006: Register with Mismatched Passwords

**Steps:**
1. Enter password: "SecurePass123!"
2. Enter confirm password: "DifferentPass123!"
3. Submit form

**Expected Results:**
- Validation error: "Passwords do not match"
- Form not submitted

---

## Test Cases - Login

### TC-AU-007: Login with Valid Credentials

**Steps:**
1. Navigate to `https://indiapropertyads.netlify.app/login`
2. Enter email: "john@example.com"
3. Enter password: "SecurePass123!"
4. Click "Login"

**Expected Results:**
- Login successful
- Redirected to dashboard
- JWT token stored

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "buyer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### TC-AU-008: Login with Invalid Email

**Steps:**
1. Enter non-existent email
2. Enter any password
3. Click "Login"

**Expected Results:**
- Error: "Invalid credentials"
- Login fails

---

### TC-AU-009: Login with Wrong Password

**Steps:**
1. Enter valid email
2. Enter wrong password
3. Click "Login"

**Expected Results:**
- Error: "Invalid credentials"
- Login fails

---

### TC-AU-010: Login with Empty Fields

**Steps:**
1. Leave email empty
2. Leave password empty
3. Click "Login"

**Expected Results:**
- Validation errors displayed
- Form not submitted

---

## Test Cases - Session Management

### TC-AU-011: Get Current User

**Steps:**
1. Login successfully
2. Call /auth/me endpoint

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "phone": "9876543210"
  }
}
```

---

### TC-AU-012: Access Protected Route Without Token

**Steps:**
1. Try to access protected endpoint without token

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/builders/profile
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### TC-AU-013: Access Protected Route with Invalid Token

**Steps:**
1. Try to access protected endpoint with invalid token

**API Request:**
```bash
curl -X GET https://india-property-ads-api.onrender.com/api/v1/builders/profile \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

---

### TC-AU-014: Access Protected Route with Expired Token

**Steps:**
1. Use an expired token
2. Try to access protected endpoint

**Expected Results:**
- Error: "Token expired"
- Redirect to login

---

### TC-AU-015: Logout

**Steps:**
1. Login successfully
2. Click "Logout"

**Expected Results:**
- Token cleared from storage
- Redirected to home/login page
- Protected routes inaccessible

---

## Test Cases - Role-Based Access

### TC-AU-016: Buyer Cannot Access Builder Dashboard

**Preconditions:**
- Logged in as buyer role

**Steps:**
1. Try to navigate to `/builder/dashboard`

**Expected Results:**
- Access denied
- Redirected to appropriate page

---

### TC-AU-017: Owner Can Access Builder Registration

**Preconditions:**
- Logged in as owner role

**Steps:**
1. Navigate to `/builder/register`

**Expected Results:**
- Page accessible
- Registration form displayed

---

### TC-AU-018: Buyer Cannot Create Projects

**Preconditions:**
- Logged in as buyer role

**Steps:**
1. Try to POST to /api/v1/projects

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <buyer_token>" \
  -d '{"name": "Test Project"}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### TC-AU-019: Admin Can Access All Routes

**Preconditions:**
- Logged in as admin role

**Steps:**
1. Access various admin endpoints
2. Verify access granted

**Expected Results:**
- All admin routes accessible
- Can manage users, projects, etc.

---

## Test Cases - Password Management

### TC-AU-020: Update Password

**Preconditions:**
- User logged in

**Steps:**
1. Navigate to profile settings
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click "Update Password"

**API Request:**
```bash
curl -X PUT https://india-property-ads-api.onrender.com/api/v1/auth/update-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### TC-AU-021: Update Password with Wrong Current Password

**Steps:**
1. Enter wrong current password
2. Try to update

**Expected Results:**
- Error: "Current password is incorrect"
- Password not changed

---

### TC-AU-022: Forgot Password Request

**Steps:**
1. Navigate to `/forgot-password`
2. Enter registered email
3. Click "Send Reset Link"

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### TC-AU-023: Reset Password with Valid Token

**Steps:**
1. Click reset link from email
2. Enter new password
3. Confirm new password
4. Click "Reset Password"

**API Request:**
```bash
curl -X POST https://india-property-ads-api.onrender.com/api/v1/auth/reset-password/<reset_token> \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePass789!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### TC-AU-024: Reset Password with Invalid/Expired Token

**Steps:**
1. Use invalid or expired reset token
2. Try to reset password

**Expected Results:**
- Error: "Invalid or expired reset token"
- Password not changed

---

## UI Test Checklist

- [ ] Registration form renders correctly
- [ ] Login form renders correctly
- [ ] Password visibility toggle works
- [ ] Form validation messages display
- [ ] Loading states during submission
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Redirect after login works
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Role-based menu items display correctly

---

## Security Tests

- [ ] Passwords are hashed (not stored in plain text)
- [ ] JWT tokens have appropriate expiry
- [ ] Rate limiting on login attempts
- [ ] Rate limiting on password reset
- [ ] HTTPS enforced
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] SQL injection prevention
- [ ] Sensitive data not in URL params
- [ ] Token not exposed in logs

---

## Performance Tests

| Test | Expected |
|------|----------|
| Registration | < 1s |
| Login | < 500ms |
| Token validation | < 100ms |
| Password reset email | < 5s |
