# 🔀 Git Workflow & CI/CD Strategy

## **Professional Git Branching Model**

---

## 🌳 **Branch Structure**

```
main (production-ready)
  ↑
  PR + Code Review
  ↑
develop (integration)
  ↑
  PR + Testing
  ↑
feature/* (active development)
```

### **Branch Types:**

1. **`main`** - Production-ready code
   - Always stable
   - Deployable at any time
   - Protected (no direct commits)
   - Only merges from `develop` or `hotfix/*`

2. **`develop`** - Integration branch (optional for MVP)
   - Latest development changes
   - Merges from `feature/*` branches
   - For MVP, we can skip this and merge features directly to `main`

3. **`feature/*`** - New features
   - `feature/week1-authentication`
   - `feature/week2-property-crud`
   - `feature/search-filters`
   - Branch from: `main` (or `develop`)
   - Merge back to: `main` (or `develop`)

4. **`bugfix/*`** - Bug fixes
   - `bugfix/login-token-expiry`
   - `bugfix/image-upload-error`

5. **`hotfix/*`** - Urgent production fixes
   - `hotfix/security-patch`
   - Branch from: `main`
   - Merge to: `main` + `develop`

---

## 📋 **Workflow for MVP (Simplified)**

### **For Each Feature (Week 1, 2, 3...):**

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/week1-authentication

# 3. Work on feature (make commits)
git add .
git commit -m "feat: Add user registration endpoint"
git commit -m "feat: Add email verification"
git commit -m "feat: Add JWT authentication"

# 4. Push to remote
git push -u origin feature/week1-authentication

# 5. Create Pull Request on GitHub
# - Go to GitHub
# - Click "Compare & Pull Request"
# - Add description
# - Request review (or self-review for solo dev)

# 6. Test in feature branch
# - Test locally
# - Fix any issues
# - Push updates

# 7. Merge PR (on GitHub or locally)
git checkout main
git pull origin main
git merge feature/week1-authentication
git push origin main

# 8. Delete feature branch (cleanup)
git branch -d feature/week1-authentication
git push origin --delete feature/week1-authentication

# 9. Repeat for next feature
git checkout -b feature/week2-property-crud
```

---

## 📝 **Commit Message Convention**

Follow **Conventional Commits** standard:

```
<type>(<scope>): <subject>

<body> (optional)
```

### **Types:**
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style (formatting, no logic change)
- **refactor:** Code refactoring
- **test:** Adding tests
- **chore:** Maintenance (dependencies, config)

### **Examples:**

```bash
# ✅ GOOD
git commit -m "feat(auth): Add user registration endpoint"
git commit -m "feat(auth): Implement JWT token generation"
git commit -m "fix(auth): Resolve token expiry issue"
git commit -m "docs: Update API documentation for auth endpoints"
git commit -m "refactor(auth): Optimize password hashing"
git commit -m "chore: Update dependencies"

# ❌ BAD
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "asdfasdf"
```

---

## 🔄 **Current Sprint Plan**

### **Sprint 1: Week 1-2 (Authentication)**

**Feature Branch:** `feature/week1-authentication`

**Commits:**
```bash
feat(backend): Initialize backend project structure
feat(auth): Add user model with validation
feat(auth): Add registration endpoint
feat(auth): Add email verification with OTP
feat(auth): Add login endpoint with JWT
feat(auth): Add refresh token endpoint
feat(auth): Add password reset flow
feat(auth): Add profile management
docs(auth): Add API documentation
test(auth): Add authentication tests (future)
```

**PR Title:** `[WEEK 1] Authentication System - User Registration & Login`

**PR Description:**
```markdown
## 📋 Summary
Complete authentication system with user registration, email verification, login, and profile management.

## ✨ Features
- User registration (email, password, phone)
- Email OTP verification
- Login with JWT (access + refresh tokens)
- Password hashing (bcrypt)
- Profile management (get/update)
- Rate limiting for security
- Error handling & logging

## 🧪 Testing
- [ ] User can register
- [ ] Email verification works
- [ ] Login returns valid JWT
- [ ] Protected routes require auth
- [ ] Profile can be updated

## 📸 Screenshots (if applicable)
- Postman API tests
- MongoDB data

## 🔗 Related Issues
Implements: #1 Week 1 Authentication
```

---

### **Sprint 2: Week 3-4 (Property Management)**

**Feature Branch:** `feature/week2-property-crud`

**Commits:**
```bash
feat(property): Add property model and schema
feat(property): Add create property endpoint
feat(property): Add AWS S3 image upload
feat(property): Add list properties with pagination
feat(property): Add property detail endpoint
feat(property): Add update property endpoint
feat(property): Add delete property endpoint
feat(property): Add property status management
docs(property): Add property API documentation
```

---

## 🛡️ **Branch Protection Rules (GitHub)**

### **For `main` branch:**

1. **Require pull request before merging**
   - At least 1 approval (can be yourself initially)
   
2. **Require status checks to pass**
   - CI/CD tests (when we add them)
   
3. **Require branches to be up to date**
   - Prevents merge conflicts

4. **Do not allow force pushes**
   - Prevents history rewriting

### **Setup on GitHub:**
```
Settings → Branches → Add rule
Branch name pattern: main
☑ Require pull request reviews before merging
☑ Require status checks to pass before merging
```

---

## 🚀 **CI/CD Pipeline (Future - Post MVP)**

### **GitHub Actions Workflow:**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test
      - name: Run linter
        run: cd backend && npm run lint

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Run tests
        run: npm test

  deploy:
    needs: [backend-test, frontend-test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: echo "Deploy to Vercel/Railway"
```

---

## 📊 **Workflow Visualization**

```
Developer Workflow:
┌─────────────────────────────────────────────────┐
│ 1. Create feature branch from main             │
│    git checkout -b feature/my-feature           │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ 2. Develop & commit                             │
│    - Write code                                 │
│    - Make commits                               │
│    - Push to remote                             │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ 3. Create Pull Request                          │
│    - Add description                            │
│    - Link issues                                │
│    - Request review                             │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ 4. Code Review & Testing                        │
│    - Review changes                             │
│    - Run tests                                  │
│    - Fix issues                                 │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ 5. Merge to main                                │
│    - Squash commits (optional)                  │
│    - Delete feature branch                      │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ 6. Deploy (automatic)                           │
│    - Vercel/Railway auto-deploy                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 **Best Practices**

### **DO:**
✅ Create descriptive branch names  
✅ Write clear commit messages  
✅ Keep commits small and focused  
✅ Pull latest `main` before creating feature branch  
✅ Test before creating PR  
✅ Write detailed PR descriptions  
✅ Delete merged branches  

### **DON'T:**
❌ Commit directly to `main`  
❌ Push incomplete features  
❌ Make huge commits with 50+ files  
❌ Use vague commit messages  
❌ Leave stale branches  
❌ Force push to shared branches  

---

## 📋 **Daily Workflow Checklist**

**Start of Day:**
```bash
# 1. Sync with main
git checkout main
git pull origin main

# 2. Create/continue feature branch
git checkout feature/my-feature
# OR
git checkout -b feature/new-feature

# 3. Rebase with main (if needed)
git rebase main
```

**During Day:**
```bash
# Make changes, commit frequently
git add .
git commit -m "feat: Add specific feature"

# Push to remote (backup)
git push origin feature/my-feature
```

**End of Day:**
```bash
# Final push
git push origin feature/my-feature

# Create PR if feature is complete
# Or continue tomorrow
```

---

## 🚨 **Emergency Hotfix Workflow**

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/critical-security-issue

# 2. Fix the issue
# ... make changes ...

# 3. Commit & push
git commit -m "hotfix: Fix critical security vulnerability"
git push origin hotfix/critical-security-issue

# 4. Create PR to main (fast-track review)
# 5. Merge immediately after testing
# 6. Also merge to develop if you have it
git checkout develop
git merge hotfix/critical-security-issue

# 7. Delete hotfix branch
git branch -d hotfix/critical-security-issue
```

---

## 📈 **Our 10-Week Git Timeline**

| Week | Feature Branch | Description |
|------|----------------|-------------|
| 1-2 | `feature/week1-authentication` | User auth system |
| 3-4 | `feature/week2-property-crud` | Property management |
| 5-6 | `feature/week3-search-detail` | Search & detail pages |
| 7-8 | `feature/week4-ai-leads` | AI valuation & leads |
| 9-10 | `feature/week5-dashboards-payments` | Dashboards & payments |

---

## ✅ **Summary**

**Our Git Workflow:**
1. ✅ Feature branches for all development
2. ✅ Pull Requests for code review
3. ✅ Protected `main` branch
4. ✅ Conventional commit messages
5. ✅ Clean branch management

**This ensures:**
- 🛡️ **Stability** - Main is always deployable
- 🔍 **Traceability** - Clear history of changes
- 🤝 **Collaboration** - Easy to work together (future)
- 🚀 **CI/CD Ready** - Easy to add automation later

---

**Let's implement this NOW! 🚀**
