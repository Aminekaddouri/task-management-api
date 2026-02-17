# Week 2: User Authentication - Implementation Plan

## 🎯 What We're Building

A complete, production-ready authentication system with:
- ✅ User registration
- ✅ User login with JWT tokens
- ✅ Password hashing (bcrypt)
- ✅ Access & Refresh tokens
- ✅ Protected routes
- ✅ Token refresh mechanism
- ✅ Get current user
- ✅ Update profile
- ✅ Change password

## 📋 Implementation Steps

### Step 1: Dependencies (5 min)
- [ ] Install bcrypt
- [ ] Install jsonwebtoken
- [ ] Install @types packages

### Step 2: Utilities (15 min)
- [ ] Create JWT utility (generate, verify, decode)
- [ ] Create password utility (hash, compare)
- [ ] Add JWT secrets to environment

### Step 3: Service Layer (30 min)
- [ ] Create auth.service.ts
- [ ] Implement register logic
- [ ] Implement login logic
- [ ] Implement token refresh logic
- [ ] Implement password operations

### Step 4: Controller Layer (20 min)
- [ ] Create auth.controller.ts
- [ ] Register endpoint handler
- [ ] Login endpoint handler
- [ ] Refresh token handler
- [ ] Get current user handler
- [ ] Update profile handler
- [ ] Change password handler

### Step 5: Middleware (15 min)
- [ ] Create auth middleware (protect routes)
- [ ] Verify JWT token
- [ ] Attach user to request

### Step 6: Routes (10 min)
- [ ] Create auth.routes.ts
- [ ] Apply validators
- [ ] Apply rate limiters
- [ ] Mount routes

### Step 7: Testing (20 min)
- [ ] Test registration
- [ ] Test login
- [ ] Test token refresh
- [ ] Test protected routes
- [ ] Test password change

### Step 8: Documentation (10 min)
- [ ] Update README with auth endpoints
- [ ] Add example requests
- [ ] Document token format

### Step 9: Commit & Push (5 min)
- [ ] Git commit
- [ ] Merge to develop
- [ ] Push to GitHub

**Total Time: ~2-3 hours**

---

## 🔑 Authentication Flow

### Registration Flow
```
1. Client sends: { email, username, password }
2. Validate input
3. Check if email/username exists
4. Hash password
5. Create user in database
6. Generate access + refresh tokens
7. Return: { user, accessToken, refreshToken }
```

### Login Flow
```
1. Client sends: { email, password }
2. Validate input
3. Find user by email
4. Compare password hash
5. Generate access + refresh tokens
6. Return: { user, accessToken, refreshToken }
```

### Protected Route Flow
```
1. Client sends: Authorization: Bearer <token>
2. Verify JWT token
3. Decode token → get user ID
4. Fetch user from database
5. Attach user to request
6. Continue to route handler
```

### Token Refresh Flow
```
1. Client sends: { refreshToken }
2. Verify refresh token
3. Generate new access token
4. Return: { accessToken }
```

---

## 📦 Packages We'll Use

### Production Dependencies
```json
{
  "bcrypt": "^5.1.1",           // Password hashing
  "jsonwebtoken": "^9.0.2"      // JWT tokens
}
```

### Dev Dependencies
```json
{
  "@types/bcrypt": "^5.0.2",
  "@types/jsonwebtoken": "^9.0.5"
}
```

---

## 🔐 Security Features

1. **Password Hashing**
   - bcrypt with 10 rounds
   - Never store plain text passwords

2. **JWT Tokens**
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry
   - Signed with secret key

3. **Rate Limiting**
   - Login: 5 attempts per 15 minutes
   - Register: 5 attempts per 15 minutes
   - Protected routes: Standard API limit

4. **Input Validation**
   - Email format validation
   - Password strength requirements
   - Username alphanumeric only

5. **Error Handling**
   - No information leakage
   - Generic error messages
   - Detailed logs (server-side only)

---

## 📊 Database Schema

User model (already exists in Prisma):
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  username      String   @unique
  password      String
  firstName     String?
  lastName      String?
  avatar        String?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## 🌐 API Endpoints We'll Create

### Public Endpoints (no auth required)
```
POST   /api/v1/auth/register       - Create new account
POST   /api/v1/auth/login          - Login to account
POST   /api/v1/auth/refresh        - Refresh access token
```

### Protected Endpoints (auth required)
```
GET    /api/v1/auth/me             - Get current user
PUT    /api/v1/auth/me             - Update profile
PUT    /api/v1/auth/password       - Change password
POST   /api/v1/auth/logout         - Logout (optional)
```

---

## 📝 Environment Variables

We'll add to `.env`:
```env
# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

---

## 🧪 Testing Strategy

### Manual Testing with curl
```bash
# 1. Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"johndoe","password":"StrongPass123!"}'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123!"}'

# 3. Get current user (with token)
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🎯 Success Criteria

✅ User can register with email/username/password
✅ Passwords are hashed (never stored plain text)
✅ User can login and receive JWT tokens
✅ Protected routes require valid token
✅ Tokens expire correctly
✅ User can refresh access token
✅ User can view/update their profile
✅ User can change password
✅ Rate limiting prevents brute force
✅ Input validation prevents bad data
✅ Clear error messages for users
✅ Detailed logs for debugging

---

## 🚀 Ready to Start!

We'll build this step-by-step with explanations.
Each piece will be tested before moving to the next.

**Let's begin!** 🔥
