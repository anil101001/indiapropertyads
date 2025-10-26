# 🏗️ Tech Stack & Best Practices - India Property Ads

## **Complete Technology Stack for MVP1**

---

## 🎨 **FRONTEND STACK**

### **Core Technologies:**
- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Build tool (fast HMR)
- **React Router DOM 6.x** - Client-side routing

### **Styling:**
- **Tailwind CSS 3.4** - Utility-first CSS
- **Lucide React** - Icon library (modern, lightweight)

### **State Management:**
- **React Context API** - Auth state, user data
- **Zustand** (to add) - Global state (optional, lightweight)
- **React Query/TanStack Query** (to add) - Server state management

### **Forms & Validation:**
- **React Hook Form** (to add) - Form handling
- **Zod** (to add) - Schema validation

### **HTTP Client:**
- **Axios** (to add) - API calls with interceptors

### **File Structure:**
```
src/
├── assets/          # Images, fonts, static files
├── components/      # Reusable UI components
│   ├── common/      # Button, Input, Modal, etc.
│   └── layout/      # Header, Footer, Sidebar
├── pages/           # Route pages
├── hooks/           # Custom React hooks
├── context/         # React Context providers
├── services/        # API service layer
├── utils/           # Helper functions
├── types/           # TypeScript types/interfaces
├── constants/       # App constants
└── App.tsx          # Main app component
```

---

## ⚙️ **BACKEND STACK**

### **Core Technologies:**
- **Node.js 20.x** - Runtime
- **Express.js 4.18** - Web framework
- **TypeScript 5.3** - Type safety
- **MongoDB 7.x** - Primary database
- **Mongoose 8.x** - ODM (Object Data Modeling)

### **Authentication:**
- **bcryptjs 2.4** - Password hashing
- **jsonwebtoken 9.x** - JWT tokens
- **express-validator 7.x** - Input validation

### **Security:**
- **helmet 7.x** - Security headers
- **cors 2.8** - Cross-Origin Resource Sharing
- **express-rate-limit 7.x** - Rate limiting

### **Email:**
- **nodemailer 6.9** - Email service
- **SendGrid** - Email delivery (production)

### **Storage:**
- **AWS SDK 2.x** - S3 for image storage
- **Multer 1.4** - File upload handling

### **Logging:**
- **Winston 3.11** - Application logging

### **File Structure:**
```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper utilities
│   ├── types/          # TypeScript types
│   └── server.ts       # Entry point
├── logs/               # Application logs
├── .env                # Environment variables
└── package.json
```

---

## 📱 **DEPLOYMENT STACK**

### **Frontend Hosting:**
- **Vercel** or **Netlify** - Static site hosting
- **CDN** - Automatic with Vercel/Netlify

### **Backend Hosting:**
- **Railway** or **Render** - Node.js hosting
- **AWS EC2** (future) - For more control

### **Database:**
- **MongoDB Atlas** - Managed MongoDB (M0 free tier)

### **Storage:**
- **AWS S3** - Images, documents, files

### **Email:**
- **SendGrid** - Transactional emails

### **Payments:**
- **Razorpay** - Payment gateway (India)

### **Monitoring:**
- **Sentry** - Error tracking
- **Google Analytics** - User analytics

---

# 🎯 **FRONTEND BEST PRACTICES**

## **1. Component Structure**

### **Naming Convention:**
```typescript
// PascalCase for components
export const PropertyCard = ({ property }: PropertyCardProps) => { }

// camelCase for functions
const handleSubmit = () => { }

// UPPER_CASE for constants
const API_BASE_URL = 'http://localhost:5000'
```

### **Component Organization:**
```typescript
// ✅ GOOD - Small, focused components
const PropertyCard = ({ property }) => {
  return (
    <div className="card">
      <PropertyImage src={property.image} />
      <PropertyDetails property={property} />
      <PropertyActions id={property.id} />
    </div>
  )
}

// ❌ BAD - Too much in one component
const PropertyCard = ({ property }) => {
  // 200 lines of code...
}
```

### **Props with TypeScript:**
```typescript
// ✅ GOOD - Define interfaces
interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  className?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onFavorite,
  className = ''
}) => { }

// ❌ BAD - No types
export const PropertyCard = (props) => { }
```

---

## **2. State Management**

### **Local State (useState):**
```typescript
// ✅ GOOD - For component-specific state
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });
```

### **Global State (Context):**
```typescript
// ✅ GOOD - For app-wide state (auth, user)
// src/context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### **Server State (React Query - to add):**
```typescript
// ✅ GOOD - For API data
const { data, isLoading, error } = useQuery({
  queryKey: ['properties'],
  queryFn: () => fetchProperties()
});
```

---

## **3. API Calls**

### **Service Layer Pattern:**
```typescript
// ✅ GOOD - Centralized API calls
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// src/services/auth.service.ts
export const authService = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// ❌ BAD - Direct fetch in components
const SomeComponent = () => {
  const login = async () => {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  }
}
```

---

## **4. Error Handling**

```typescript
// ✅ GOOD - Proper error handling
const loginUser = async (credentials: LoginData) => {
  try {
    const response = await authService.login(credentials);
    setUser(response.data.user);
    toast.success('Login successful!');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    } else {
      toast.error('An unexpected error occurred');
    }
  }
};

// ❌ BAD - Silent failures
const loginUser = async (credentials) => {
  const response = await authService.login(credentials);
  setUser(response.data.user);
}
```

---

## **5. Styling Best Practices**

### **Tailwind CSS:**
```typescript
// ✅ GOOD - Consistent spacing, responsive
<div className="flex flex-col gap-4 p-6 md:p-8 lg:flex-row">
  <div className="w-full lg:w-1/3">...</div>
</div>

// ✅ GOOD - Extract common styles to components
const Button = ({ variant = 'primary', children }) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
};

// ❌ BAD - Inline styles, no responsiveness
<div style={{ padding: '20px', display: 'flex' }}>
```

---

## **6. Performance Optimization**

```typescript
// ✅ GOOD - Memoization for expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ GOOD - Lazy loading for code splitting
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));

// ✅ GOOD - Debounce search inputs
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchProperties(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

# ⚙️ **BACKEND BEST PRACTICES**

## **1. Project Structure**

### **MVC Pattern (Model-View-Controller):**
```
✅ Model: Mongoose schemas (data structure)
✅ Controller: Business logic (what to do)
✅ Route: API endpoints (how to access)
```

### **File Organization:**
```typescript
// ✅ GOOD - Separation of concerns
// models/Property.model.ts - Schema only
// controllers/property.controller.ts - Logic only
// routes/property.routes.ts - Routes only
// services/property.service.ts - Complex business logic

// ❌ BAD - Everything in one file
// property.ts - 500 lines with schema, logic, routes
```

---

## **2. API Design (RESTful)**

### **Naming Convention:**
```typescript
// ✅ GOOD - RESTful routes
GET    /api/v1/properties          # Get all properties
GET    /api/v1/properties/:id      # Get one property
POST   /api/v1/properties          # Create property
PATCH  /api/v1/properties/:id      # Update property
DELETE /api/v1/properties/:id      # Delete property

// ✅ GOOD - Nested resources
GET    /api/v1/properties/:id/inquiries  # Get property inquiries
POST   /api/v1/properties/:id/inquiries  # Create inquiry

// ❌ BAD - Inconsistent naming
POST   /api/v1/createProperty
GET    /api/v1/getPropertyById/123
```

---

## **3. Error Handling**

### **Custom Error Classes:**
```typescript
// ✅ GOOD - Custom error handling
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Usage in controller
if (!user) {
  throw new AppError(404, 'User not found');
}

// middleware/errorHandler.ts
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error(`Error: ${message}`, { 
    statusCode, 
    path: req.path,
    stack: err.stack 
  });
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

---

## **4. Input Validation**

```typescript
// ✅ GOOD - Validate all inputs
import { body, validationResult } from 'express-validator';

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('phone').matches(/^[6-9]\d{9}$/),
  body('profile.name').isLength({ min: 2, max: 100 }).trim(),
];

// In controller
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ 
    success: false, 
    errors: errors.array() 
  });
}

// ❌ BAD - No validation
const email = req.body.email; // Could be anything!
```

---

## **5. Security Best Practices**

```typescript
// ✅ GOOD - Security measures

// 1. Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// 2. Helmet for security headers
import helmet from 'helmet';
app.use(helmet());

// 3. CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// 4. Never expose sensitive data
const user = await User.findById(id).select('-password'); // ✅
const user = await User.findById(id); // ❌ includes password

// 5. Hash passwords
const hashedPassword = await bcrypt.hash(password, 12); // ✅
const password = plainPassword; // ❌ Never store plain text!

// 6. Sanitize inputs
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize());
```

---

## **6. Database Best Practices**

### **Mongoose Models:**
```typescript
// ✅ GOOD - Proper schema with validation
const propertySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster queries
  }
}, {
  timestamps: true // Auto createdAt, updatedAt
});

// Indexes for performance
propertySchema.index({ city: 1, price: 1 });
propertySchema.index({ createdAt: -1 });

// ❌ BAD - No validation
const propertySchema = new Schema({
  title: String,
  price: Number
});
```

---

## **7. Async/Await Pattern**

```typescript
// ✅ GOOD - Consistent async/await with error handling
export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
      return;
    }
    
    res.json({ 
      success: true, 
      data: property 
    });
  } catch (error) {
    logger.error('Get property error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property' 
    });
  }
};

// ❌ BAD - Callback hell
Property.findById(req.params.id, (err, property) => {
  if (err) {
    res.status(500).json({ error: err });
  } else {
    User.findById(property.owner, (err, user) => {
      // More nesting...
    });
  }
});
```

---

## **8. Environment Variables**

```typescript
// ✅ GOOD - Use environment variables
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

// Validate required env vars on startup
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// ❌ BAD - Hardcoded values
const JWT_SECRET = 'mysecret123'; // Never do this!
```

---

# 📦 **DEPENDENCY MANAGEMENT**

## **Keep Dependencies Updated:**
```bash
# Check for updates
npm outdated

# Update to latest (carefully!)
npm update

# Security audit
npm audit
npm audit fix
```

## **Lock File:**
- ✅ Commit `package-lock.json` to git
- ✅ Use exact versions for critical packages
- ✅ Test updates in development first

---

# 🧪 **TESTING (Future - Post MVP)**

## **Frontend:**
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## **Backend:**
- **Jest** - Unit & integration testing
- **Supertest** - API endpoint testing

---

# 📝 **CODE STYLE**

## **Linting:**
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

## **Formatting:**
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

# 🚀 **GIT WORKFLOW**

## **Branch Strategy:**
```
main          # Production-ready code
develop       # Integration branch
feature/*     # New features
bugfix/*      # Bug fixes
hotfix/*      # Urgent production fixes
```

## **Commit Messages:**
```bash
# ✅ GOOD
git commit -m "feat: Add property search endpoint"
git commit -m "fix: Resolve login token expiry issue"
git commit -m "refactor: Optimize database queries"

# ❌ BAD
git commit -m "updates"
git commit -m "fix stuff"
```

---

# 📊 **SUMMARY**

## **Our Complete Stack:**
```
Frontend:  React + TypeScript + Vite + Tailwind CSS
Backend:   Node.js + Express + TypeScript + MongoDB
Auth:      JWT + bcrypt
Storage:   AWS S3
Email:     SendGrid
Payment:   Razorpay
Hosting:   Vercel (FE) + Railway (BE) + MongoDB Atlas
```

---

**This is our blueprint for building a professional, scalable platform! 🏗️**
