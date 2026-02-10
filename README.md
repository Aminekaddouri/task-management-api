# Task Management API - Development Foundation Complete! 🎉

## 📊 Week 1 Infrastructure - DONE!

This project now has a **production-ready foundation** with all essential development tools and infrastructure.

---

## 🛠️ Tech Stack

### Core
- **Node.js** + **TypeScript** - Type-safe backend
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Prisma ORM** - Type-safe database client
- **Redis** - Caching and session store

### Development Tools
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Winston** - Logging system
- **Joi** - Request validation
- **Docker** - Containerization

### Security
- **Rate Limiting** - API protection
- **CORS** - Cross-origin security
- **Input Validation** - Data sanitization

---

## 📁 Project Structure

```
task-management-api/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.ts         # Environment config
│   │   ├── database.ts      # Prisma client
│   │   └── redis.ts         # Redis client
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.ts  # Global error handling
│   │   ├── requestLogger.ts # Request logging
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   └── validation.ts    # Input validation
│   ├── routes/              # API routes
│   │   ├── index.ts         # Main router
│   │   └── test.routes.ts   # Test endpoints
│   ├── utils/               # Utility functions
│   │   └── logger.ts        # Winston logger
│   ├── validators/          # Joi schemas
│   │   ├── common.validator.ts
│   │   └── auth.validator.ts
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── .vscode/                 # VS Code settings
│   ├── settings.json        # Editor config
│   └── extensions.json      # Recommended extensions
├── docker-compose.yml       # PostgreSQL + Redis
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies & scripts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Docker Desktop installed and running
- Git installed

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd task-management-api

# Install dependencies
npm install

# Start PostgreSQL and Redis
docker-compose up -d

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

**Server will start on:** `http://localhost:3000`

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
npm run format           # Format code with Prettier
```

---

## 🔌 API Endpoints

### Health & Info
- `GET /api/v1/` - Welcome message
- `GET /api/v1/health` - Health check (database + redis status)

### Test Endpoints (Development Only)
- `POST /api/v1/test/validate-test` - Test validation middleware
- `GET /api/v1/test/pagination-test` - Test pagination validation

---

## 🗄️ Database

### Connection
PostgreSQL runs in Docker on `localhost:5432`

**Credentials:**
- Database: `taskmanager_dev`
- Username: `postgres`
- Password: `postgres`

### Models
- **User** - Basic user model (ready for authentication)

### Prisma Commands
```bash
# Open database GUI
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

---

## 🔴 Redis

Redis runs in Docker on `localhost:6379`

**Used for:**
- Rate limiting storage
- Session storage (future)
- Caching (future)

**Test connection:**
```bash
docker-compose exec redis redis-cli ping
# Should return: PONG
```

---

## 🛡️ Security Features

### Rate Limiting
Three rate limiters configured:

1. **API Limiter** - 100 requests per 15 minutes (all routes)
2. **Auth Limiter** - 5 requests per 15 minutes (auth endpoints, future)
3. **Upload Limiter** - 20 requests per hour (file uploads, future)

### Input Validation
All request data validated with Joi schemas before processing.

**Example validators available:**
- Email validation
- Password strength (8+ chars, uppercase, lowercase, number, special char)
- Username validation (3-30 alphanumeric characters)
- Pagination parameters
- UUID validation

---

## 📋 Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

**Required variables:**
```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskmanager_dev"

# Redis
REDIS_URL="redis://localhost:6379"
```

---

## 🪵 Logging

Winston logger with multiple transports:

**Log Levels:**
- `error` - Error messages (always logged)
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages (development only)

**Log Files:** (Production only)
- `logs/error-YYYY-MM-DD.log` - Error logs
- `logs/combined-YYYY-MM-DD.log` - All logs

**Logs rotate daily and keep 14 days of history.**

---

## 🧪 Testing Validation

**Test with valid data:**
```bash
curl -X POST http://localhost:3000/api/v1/test/validate-test \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "StrongPass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Test with invalid data:**
```bash
curl -X POST http://localhost:3000/api/v1/test/validate-test \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "username": "ab",
    "password": "weak"
  }'
```

---

## 🎨 Code Quality

### ESLint
Enforces code quality and catches bugs.

**Run checks:**
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

### Prettier
Formats code consistently.

**Format code:**
```bash
npm run format
```

### VS Code Integration
Auto-format and auto-fix on save (configured in `.vscode/settings.json`)

**Recommended extensions:**
- ESLint
- Prettier
- Prisma

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose stop

# View logs
docker-compose logs -f

# Remove all containers (keeps data)
docker-compose down

# Remove all containers AND data (⚠️ destructive)
docker-compose down -v

# Check service status
docker-compose ps
```

---

## 📦 What's Included

### ✅ Infrastructure
- [x] TypeScript configuration
- [x] Express server setup
- [x] PostgreSQL database (Docker)
- [x] Redis cache (Docker)
- [x] Prisma ORM
- [x] Environment configuration

### ✅ Development Tools
- [x] Winston logging system
- [x] ESLint + Prettier
- [x] Git hooks (ready for Husky)
- [x] VS Code settings
- [x] Hot reload (nodemon)

### ✅ Security
- [x] Rate limiting (Redis-backed)
- [x] CORS configuration
- [x] Input validation (Joi)
- [x] Error handling
- [x] Request logging

### ✅ Code Quality
- [x] Organized folder structure
- [x] Middleware separation
- [x] Reusable validators
- [x] TypeScript strict mode
- [x] Consistent formatting

---

## 🎯 Next Steps

### Week 2: User Authentication
- [ ] Password hashing (bcrypt)
- [ ] JWT token generation
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] Protected routes middleware
- [ ] Refresh token logic
- [ ] Email verification
- [ ] Password reset flow

### Future Features
- [ ] Workspaces
- [ ] Boards & Lists
- [ ] Cards & Tasks
- [ ] Real-time updates (Socket.io)
- [ ] File uploads
- [ ] Comments & Activity logs

---

## 🤝 Git Workflow

We use a feature branch workflow:

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Merge to develop
git checkout develop
git merge feature/my-feature

# Delete feature branch
git branch -d feature/my-feature

# Push to GitHub
git push origin develop
```

---

## 📚 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Joi Validation](https://joi.dev/api/)
- [Winston Logging](https://github.com/winstonjs/winston)

---

## ✨ Built With

- Node.js 20
- TypeScript 5
- Express 4
- Prisma 5
- PostgreSQL 14
- Redis 7
- Docker

---

**🎉 Foundation Complete! Ready to build authentication and features!**