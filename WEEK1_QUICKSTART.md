# 🚀 Week 1 - Quick Start Guide

## **Authentication System - Ready to Run!**

I've created the complete backend authentication system for you. Here's how to get it running in 5 minutes!

---

## ✅ What's Been Built

### **Backend Structure (Complete)**
```
backend/
├── src/
│   ├── config/         # Database connection
│   ├── controllers/    # Business logic (auth, user)
│   ├── middleware/     # Auth, error handling, rate limiting
│   ├── models/         # User schema with validation
│   ├── routes/         # API endpoints
│   ├── utils/          # JWT, email, logger
│   └── server.ts       # Express app
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### **Features Implemented:**
- ✅ User registration (email, password, phone, role)
- ✅ Email OTP verification
- ✅ Login with JWT tokens
- ✅ Password hashing (bcrypt)
- ✅ Access + Refresh tokens
- ✅ Profile management
- ✅ Rate limiting (security)
- ✅ Error handling
- ✅ Request logging

---

## 🏃 Quick Start (5 Minutes)

### **Step 1: Navigate to Backend**
```bash
cd backend
```

### **Step 2: Install Dependencies**
```bash
npm install
```

This installs:
- Express, Mongoose, JWT
- TypeScript & types
- Security packages
- Email service
- Logger

**Wait 2-3 minutes** for installation...

### **Step 3: Create .env File**
```bash
# Copy template
cp .env.example .env
```

Edit `.env` file with these minimum settings:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/india-property-ads
JWT_SECRET=my-super-secret-jwt-key-change-in-production-32-chars-min
JWT_REFRESH_SECRET=my-refresh-secret-key-change-in-production-32-chars-min
FRONTEND_URL=http://localhost:3000
```

### **Step 4: Start MongoDB**

**Option A: Local MongoDB** (if installed)
```bash
mongod
```

**Option B: MongoDB Atlas** (Recommended - Free)
1. Go to: https://cloud.mongodb.com
2. Sign in/Register
3. Create FREE cluster (M0)
4. Create database user
5. Get connection string
6. Replace `MONGODB_URI` in `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/india-property-ads
```

### **Step 5: Run Backend Server**
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📦 Database: india-property-ads
🚀 Server running on port 5000 in development mode
📊 API available at http://localhost:5000/api/v1
```

---

## 🧪 Test the API

### **1. Health Check** (Verify server is running)
Open browser or use curl:
```
http://localhost:5000/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-10-26T...",
  "uptime": 12.5,
  "environment": "development"
}
```

### **2. Test Registration**

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","phone":"9876543210","role":"buyer","profile":{"name":"Test User","location":{"city":"Mumbai","state":"Maharashtra"}}}'
```

**Using Postman:**
- Method: POST
- URL: `http://localhost:5000/api/v1/auth/register`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "Test@1234",
  "phone": "9876543210",
  "role": "buyer",
  "profile": {
    "name": "Test User",
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra"
    }
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "test@example.com",
    "role": "buyer",
    "emailVerified": false
  },
  "message": "Registration successful. Please check your email for verification code."
}
```

**Check console** - you'll see the OTP logged (since email is not configured yet).

### **3. Verify Email**
```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

Use the OTP from console logs.

### **4. Login**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "role": "buyer",
      "name": "Test User"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

**Copy the `accessToken`** - you'll need it for protected routes!

### **5. Get Profile (Protected Route)**
```bash
curl http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Replace `YOUR_ACCESS_TOKEN_HERE` with the token from login response.

---

## 📊 Available API Endpoints

### **Authentication** (`/api/v1/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/verify-email` | Verify email with OTP |
| POST | `/resend-otp` | Resend verification OTP |
| POST | `/login` | Login user |
| POST | `/refresh` | Refresh access token |
| POST | `/forgot-password` | Request password reset |
| POST | `/logout` | Logout (protected) |

### **User** (`/api/v1/users/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user (protected) |
| PATCH | `/me` | Update profile (protected) |

---

## 🔍 Check MongoDB Data

### **Using MongoDB Compass:**
1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Open database: `india-property-ads`
4. View collection: `users`

You should see the registered user!

### **Using MongoDB CLI:**
```bash
mongosh
use india-property-ads
db.users.find().pretty()
```

---

## 🐛 Troubleshooting

### **Error: Cannot find module**
**Solution:** Run `npm install` in backend folder

### **Error: MongoDB connection failed**
**Solutions:**
- Make sure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- For Atlas: Whitelist your IP (0.0.0.0/0 for testing)

### **Error: Port 5000 in use**
**Solutions:**
- Change `PORT=5001` in `.env`
- Kill existing process: `netstat -ano | findstr :5000` (Windows)
  Then: `taskkill /PID <PID> /F`

### **TypeScript errors in VS Code**
**Solution:** The errors will disappear after `npm install`
- If not, reload VS Code: `Ctrl+Shift+P` → "Reload Window"

### **Email OTP not showing**
**Solution:** Check console logs - OTP is printed there in development mode.

---

## ✅ Week 1 Complete Checklist

Verify everything works:
- [ ] Backend server starts without errors
- [ ] MongoDB connects successfully
- [ ] Health check endpoint works
- [ ] Can register new user
- [ ] OTP shows in console
- [ ] Can verify email
- [ ] Can login successfully
- [ ] Receive JWT tokens
- [ ] Can access protected route (`/users/me`)
- [ ] Profile data returns correctly

---

## 🎯 What's Next? (Week 2)

After Week 1 is working, we'll build:
- Property model & schema
- Property CRUD operations (Create, Read, Update, Delete)
- AWS S3 image upload
- Image compression
- Property listing form

---

## 📚 Useful Commands

```bash
# Start development server (with auto-reload)
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# View logs
tail -f logs/combined.log

# MongoDB shell
mongosh
```

---

## 🎉 Success!

If all steps worked, you now have a fully functional authentication API!

**Time to celebrate! 🎊 Then move on to Week 2...**

---

## 📞 Need Help?

Check the detailed `backend/README.md` for more information.

**Happy coding! 🚀**
