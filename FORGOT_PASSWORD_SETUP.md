# 🔐 Forgot Password Feature - Setup Instructions

## ✅ Backend Implementation Complete!

The forgot password feature is now fully implemented in the backend. You just need to update your `.env` file.

---

## 📧 Step 1: Update Your .env File

Add these lines to `backend/.env`:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_DWKq6rP9_85fCSQXub8CEd8GHuPueLCnE
EMAIL_FROM=India Property Ads <onboarding@resend.dev>

# Frontend URL
FRONTEND_URL=https://indiapropertyads.netlify.app

# Password Reset
RESET_PASSWORD_TOKEN_EXPIRES=1h
```

**Important:** Make sure `FRONTEND_URL` matches your actual frontend URL:
- Development: `http://localhost:5173`
- Production: `https://indiapropertyads.netlify.app`

---

## 🎯 What's Been Implemented (Backend)

### ✅ Database Updates
- Added `resetPasswordToken` field to User model
- Added `resetPasswordExpires` field to User model

### ✅ Email Service
- Created `email.service.ts` with Resend integration
- Beautiful HTML email templates
- Password reset email with secure link
- Password reset confirmation email

### ✅ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/forgot-password` | Request password reset (sends email) |
| `GET` | `/api/v1/auth/verify-reset-token/:token` | Verify if token is valid |
| `POST` | `/api/v1/auth/reset-password/:token` | Reset password with token |

### ✅ Security Features
- Tokens are hashed before storing in database
- Tokens expire after 1 hour
- One-time use tokens (cleared after use)
- Rate limiting on forgot password endpoint
- Password strength validation
- Confirmation email after successful reset

---

## 🧪 Testing the Backend

###After updating .env, restart your backend:

```bash
cd backend
npm run dev
```

### Test with Postman:

**1. Request Password Reset:**
```
POST http://localhost:5000/api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "your-test-email@gmail.com"
}
```

**2. Check your email for the reset link**

**3. Verify Token (Optional):**
```
GET http://localhost:5000/api/v1/auth/verify-reset-token/[TOKEN_FROM_EMAIL]
```

**4. Reset Password:**
```
POST http://localhost:5000/api/v1/auth/reset-password/[TOKEN_FROM_EMAIL]
Content-Type: application/json

{
  "password": "NewPassword123!"
}
```

---

## 📱 Next Steps: Frontend

The frontend pages still need to be created:

1. **Forgot Password Page** (`/forgot-password`)
   - Email input form
   - Submit button
   - Success/error messages

2. **Reset Password Page** (`/reset-password/:token`)
   - New password input
   - Confirm password input
   - Submit button
   - Token validation

3. **Update Login Page**
   - Add "Forgot Password?" link

Would you like me to create the frontend pages next?

---

## 📊 Email Templates Preview

### Password Reset Email:
- 🎨 Beautiful branded design
- 🔗 Clear "Reset Password" button
- ⏰ Shows expiration time (1 hour)
- ⚠️ Security warning
- 📱 Mobile responsive

### Confirmation Email:
- ✅ Success confirmation
- 🔒 Security notification
- 📞 Support contact info

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update `RESEND_API_KEY` in Render environment variables
- [ ] Update `EMAIL_FROM` if using custom domain
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Test email delivery
- [ ] Test complete password reset flow
- [ ] Monitor Resend dashboard for email delivery status

---

## 💰 Cost

**FREE for development and testing!**
- Resend free tier: 3,000 emails/month
- Your current usage: ~0 emails/month
- Estimated usage: ~100-300 emails/month (password resets)

---

## 📞 Support

If emails aren't sending:
1. Check Resend API key is correct
2. Check backend logs for errors
3. Verify email address exists in your test database
4. Check Resend dashboard: https://resend.com/emails

---

**Backend Status: ✅ Complete**  
**Frontend Status: ⏳ Pending**  
**Ready for testing!** 🎉
