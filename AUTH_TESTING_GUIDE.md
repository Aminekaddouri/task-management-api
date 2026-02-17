# Authentication System - Testing Guide

## 🎯 What We Built

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
- ✅ Rate limiting on auth endpoints
- ✅ Input validation
- ✅ Comprehensive error handling

---

## 📦 Files Created

```
src/
├── controllers/
│   └── auth.controller.ts       # HTTP request handlers
├── services/
│   └── auth.service.ts          # Business logic
├── middleware/
│   └── auth.middleware.ts       # JWT verification
├── routes/
│   └── auth.routes.ts           # Auth endpoints
├── utils/
│   ├── jwt.util.ts              # JWT operations
│   └── password.util.ts         # Password hashing
├── types/
│   └── express.d.ts             # TypeScript extensions
└── validators/
    └── auth.validator.ts        # Already existed
```

---

## 🌐 API Endpoints

### Public Endpoints

**1. Register New User**
```
POST /api/v1/auth/register
```

**2. Login**
```
POST /api/v1/auth/login
```

**3. Refresh Access Token**
```
POST /api/v1/auth/refresh
```

### Protected Endpoints (Require JWT Token)

**4. Get Current User**
```
GET /api/v1/auth/me
```

**5. Update Profile**
```
PUT /api/v1/auth/me
```

**6. Change Password**
```
PUT /api/v1/auth/password
```

---

## 🧪 Testing Instructions

### Prerequisites
```bash
# Make sure services are running
docker-compose up -d

# Install dependencies
npm install

# Start server
npm run dev
```

### Test 1: Register New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "StrongPass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "emailVerified": false,
      "createdAt": "2024-02-09T...",
      "updatedAt": "2024-02-09T..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the accessToken for next tests!**

---

### Test 2: Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "StrongPass123!"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

### Test 3: Get Current User (Protected Route)

```bash
# Replace YOUR_ACCESS_TOKEN with the token from register/login
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "john@example.com",
      "username": "johndoe",
      ...
    }
  }
}
```

**Without token:**
```bash
curl http://localhost:3000/api/v1/auth/me
```

**Expected Response (401):**
```json
{
  "status": "error",
  "message": "No token provided"
}
```

---

### Test 4: Update Profile

```bash
curl -X PUT http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jonathan",
    "lastName": "Doe Updated"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "firstName": "Jonathan",
      "lastName": "Doe Updated",
      ...
    }
  }
}
```

---

### Test 5: Change Password

```bash
curl -X PUT http://localhost:3000/api/v1/auth/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "StrongPass123!",
    "newPassword": "NewStrongPass456!"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

---

### Test 6: Refresh Access Token

```bash
# Use the refreshToken from login/register
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-access-token-here"
  }
}
```

---

## 🛡️ Security Features Tested

### Test 7: Duplicate Email

```bash
# Try to register with same email again
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "different",
    "password": "StrongPass123!"
  }'
```

**Expected Response (409):**
```json
{
  "status": "error",
  "message": "Email already in use"
}
```

---

### Test 8: Invalid Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword"
  }'
```

**Expected Response (401):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

### Test 9: Weak Password Validation

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "weak"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "password": [
      "Password must be at least 8 characters long",
      "Password must contain at least one uppercase letter...",
      ...
    ]
  }
}
```

---

### Test 10: Rate Limiting

```bash
# Make 6 rapid login attempts (limit is 5 per 15 min)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

**6th request response (429):**
```json
{
  "status": "error",
  "message": "Too many authentication attempts, please try again after 15 minutes."
}
```

---

## 🔐 Token Information

### Access Token
- **Purpose:** Used for API requests
- **Lifetime:** 15 minutes
- **Storage:** Client should store in memory or sessionStorage (NOT localStorage)
- **Usage:** Send in Authorization header: `Bearer <token>`

### Refresh Token
- **Purpose:** Get new access tokens
- **Lifetime:** 7 days
- **Storage:** Secure httpOnly cookie (recommended) or secure storage
- **Usage:** Send to /refresh endpoint when access token expires

### Token Flow
```
1. User logs in
2. Receive access + refresh tokens
3. Use access token for API requests
4. When access token expires (15 min)
   → Use refresh token to get new access token
5. When refresh token expires (7 days)
   → User must login again
```

---

## 📊 Database Check

After testing, check the database:

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d taskmanager_dev

# View users
SELECT id, email, username, "firstName", "lastName", "createdAt" FROM users;

# Exit
\q
```

You should see the registered users with:
- ✅ Hashed passwords (not plain text!)
- ✅ Correct email and username
- ✅ Timestamps

---

## 🐛 Troubleshooting

### Problem: "No token provided"
**Solution:** Make sure you're sending the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Problem: "Invalid or expired token"
**Solution:** 
1. Check token is not expired (access tokens expire in 15 min)
2. Use refresh token to get new access token
3. Make sure token is copied correctly (no extra spaces)

### Problem: "Email already in use"
**Solution:** Use a different email or delete the existing user from database

### Problem: Rate limit error
**Solution:** Wait 15 minutes or restart Redis:
```bash
docker-compose restart redis
```

---

## ✅ Success Criteria Checklist

- [ ] User can register with email/username/password
- [ ] Passwords are hashed (check database - should see bcrypt hash)
- [ ] User can login and receive JWT tokens
- [ ] Protected routes reject requests without token
- [ ] Protected routes work with valid token
- [ ] Tokens expire correctly
- [ ] User can refresh access token
- [ ] User can view their profile
- [ ] User can update their profile
- [ ] User can change password
- [ ] Rate limiting prevents rapid attempts
- [ ] Input validation catches bad data
- [ ] Duplicate emails rejected
- [ ] Duplicate usernames rejected
- [ ] Wrong passwords rejected with generic message

---

## 🎯 Next Steps

Now that authentication works, you can:

1. **Add email verification** (optional)
   - Send verification email on registration
   - Verify email endpoint

2. **Add password reset** (optional)
   - Forgot password endpoint
   - Reset password with token

3. **Build workspace features**
   - Create workspaces
   - Invite users
   - Workspace permissions

4. **Add boards & lists**
   - Create boards within workspaces
   - Add lists to boards
   - User can be member of multiple workspaces

---

**🎉 Authentication is complete and ready for production!**