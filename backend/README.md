# India Property Ads - Backend API

## 🚀 Week 1: Authentication System - COMPLETE!

Backend API built with Node.js, Express, TypeScript, and MongoDB.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.ts   # Auth logic (register, login, etc.)
│   │   └── user.controller.ts   # User profile logic
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── errorHandler.ts      # Global error handler
│   │   └── rateLimiter.ts       # Rate limiting
│   ├── models/
│   │   └── User.model.ts        # User schema
│   ├── routes/
│   │   ├── auth.routes.ts       # Auth endpoints
│   │   └── user.routes.ts       # User endpoints
│   ├── utils/
│   │   ├── email.ts             # Email service
│   │   ├── jwt.ts               # JWT utilities
│   │   └── logger.ts            # Winston logger
│   └── server.ts                # Express app entry point
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Setup Instructions

### **Step 1: Install Dependencies**

```bash
cd backend
npm install
```

This will install:
- express, mongoose, bcryptjs, jsonwebtoken
- cors, helmet, dotenv, nodemailer
- winston, express-rate-limit
- TypeScript & dev dependencies

### **Step 2: Setup Environment Variables**

Create `.env` file in backend folder:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Required for development
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/india-property-ads
JWT_SECRET=your-secret-key-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Email (optional for now, will log to console)
# SENDGRID_API_KEY=your-key-here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### **Step 3: Start MongoDB**

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### **Step 4: Run Development Server**

```bash
npm run dev
```

Server will start on http://localhost:5000

---

## 📡 API Endpoints

### **Base URL:** `http://localhost:5000/api/v1`

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/verify-email` | Verify email with OTP | No |
| POST | `/auth/resend-otp` | Resend OTP | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/logout` | Logout user | Yes |

### **User Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get current user profile | Yes |
| PATCH | `/users/me` | Update user profile | Yes |

---

## 🧪 Testing the API

### **1. Health Check**
```bash
curl http://localhost:5000/health
```

### **2. Register User**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### **3. Verify Email**
```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### **4. Login**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

### **5. Get Profile (with token)**
```bash
curl http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔐 Authentication Flow

```
1. Register → Email sent with OTP
2. Verify Email → Email marked verified
3. Login → Returns access token + refresh token
4. Use access token in Authorization header
5. Token expires in 15 min → Use refresh token
6. Refresh token expires in 7 days → Login again
```

---

## 📧 Email Configuration

### **Development (Console Logging)**
Emails are logged to console by default.

### **Production (SendGrid)**
1. Sign up at https://sendgrid.com
2. Get API key
3. Add to `.env`:
```env
SENDGRID_API_KEY=your-key
EMAIL_FROM=noreply@indiapropertyads.com
```

---

## 🛡️ Security Features

- ✅ Password hashing (bcrypt, cost factor 12)
- ✅ JWT token authentication
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ Helmet (security headers)
- ✅ CORS (cross-origin protection)
- ✅ Input validation
- ✅ Error handling

---

## 📝 Scripts

```bash
# Development (with hot reload)
npm run dev

# Build TypeScript
npm run build

# Production
npm start

# Lint code
npm run lint
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: MongoDB Connection Failed**
**Solution:**
- Check if MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`
- For Atlas: Check IP whitelist (allow 0.0.0.0/0 for testing)

### **Issue 2: Port 5000 Already in Use**
**Solution:**
- Change `PORT` in `.env` to 5001 or 8000
- Or kill process: `lsof -ti:5000 | xargs kill` (Mac/Linux)

### **Issue 3: TypeScript Errors**
**Solution:**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Make sure all `@types/*` packages installed

### **Issue 4: Email Not Sending**
**Solution:**
- Check console logs (emails logged in development)
- For production: Verify SendGrid API key
- Check SendGrid dashboard for delivery status

---

## ✅ Week 1 Checklist

- [x] Project structure setup
- [x] MongoDB connection
- [x] User model with validation
- [x] Password hashing
- [x] JWT authentication
- [x] Email OTP verification
- [x] Login/Register APIs
- [x] Profile management
- [x] Rate limiting
- [x] Error handling
- [x] Security middleware
- [x] API documentation

---

## 🎯 Next Steps (Week 2)

Week 2 will focus on:
- Property model
- Property CRUD APIs
- AWS S3 image upload
- Property listing creation
- Image compression

---

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Best Practices](https://jwt.io/introduction)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [SendGrid API](https://docs.sendgrid.com/)

---

## 🤝 Need Help?

Check logs in `backend/logs/` folder or console output for debugging.

**Happy Coding! 🚀**
