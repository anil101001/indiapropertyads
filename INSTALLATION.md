# Installation Guide - India Property Ads

## 🚀 Quick Start

### Step 1: Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- React 18.2.0
- React Router DOM 6.20.0
- TypeScript 5.3.3
- Vite 5.0.8
- Tailwind CSS 3.3.6
- Lucide React (icons)
- Axios, Express, and more

### Step 2: Start Development Server

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

### Step 3: Open in Browser

Navigate to `http://localhost:3000` and explore:

- **Home Page** - Hero section with search, features, property types
- **Properties** - Browse listings with filters
- **Agent Portal** - Dashboard for agents (placeholder)
- **About/Contact** - Information pages

---

## 📦 What's Included

### ✅ Frontend Pages (Fully Built)
- **Home** - Complete with hero, search, features, cities
- **Property Listing** - Grid view with filters and AI scores
- **Header/Footer** - Responsive navigation
- **Layout** - Reusable page structure

### 🔨 Backend Stubs (Ready for Implementation)
- Login/Register pages
- Agent Dashboard structure
- Admin Dashboard structure
- Add Property form
- Property Detail page

---

## 🎨 UI Features

- **Responsive Design** - Mobile, tablet, desktop
- **Modern UI** - Tailwind CSS with custom theme
- **Icons** - Lucide React library
- **Animations** - Hover effects, transitions
- **Color Scheme** - Primary blue with yellow accents

---

## 🛠️ Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

Build output will be in `/dist` folder.

---

## 🐛 Troubleshooting

### Issue: Module not found errors
**Solution:** Run `npm install` again

### Issue: Port 3000 already in use
**Solution:** Change port in `vite.config.ts` or kill existing process

### Issue: TypeScript errors
**Solution:** These are expected before `npm install`. Install dependencies first.

---

## 📁 Project Structure

```
windsurf-project/
├── src/
│   ├── components/     # Header, Footer, Layout
│   ├── pages/         # All page components
│   ├── types/         # TypeScript interfaces
│   ├── App.tsx        # Main routing
│   └── main.tsx       # Entry point
├── public/            # Static assets
├── package.json       # Dependencies
└── README.md         # Full documentation
```

---

## ⏭️ Next Steps After Installation

1. **Explore the UI** - Test all pages and interactions
2. **Review Code** - Check component structure
3. **Backend Setup** - Create Express API
4. **Database** - Set up MongoDB
5. **Authentication** - Implement JWT
6. **Deploy** - Push to production

---

## 🔗 Important URLs (After Starting Server)

- **Homepage:** http://localhost:3000
- **Properties:** http://localhost:3000/properties
- **Agent Dashboard:** http://localhost:3000/agent-dashboard
- **Admin Dashboard:** http://localhost:3000/admin-dashboard

---

## 📞 Need Help?

Check the main **README.md** for:
- Full feature list
- MVP roadmap
- Tech stack details
- Revenue model
- Deployment guide

---

**Ready to build India's best real estate platform! 🏠**
