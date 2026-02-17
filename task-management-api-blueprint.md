# Real-Time Collaborative Task Management API
## Complete Blueprint & Software Requirements Specification

**Project:** Collaborative Task Management API (Trello/Notion Clone)  
**Stack:** Node.js, Express, Socket.io, PostgreSQL, Redis, Prisma, Docker, Jest  
**Version:** 1.0.0

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Project Structure](#project-structure)
4. [Software Requirements Specification](#software-requirements-specification)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Real-Time Events](#real-time-events)
8. [Development Phases](#development-phases)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Strategy](#deployment-strategy)

---

## Executive Summary

### Project Overview
A real-time collaborative task management API that enables teams to organize work into boards, lists, and cards with real-time synchronization across all connected clients.

### Core Features
- **Multi-tenancy:** Workspaces for team isolation
- **Hierarchical Organization:** Workspaces → Boards → Lists → Cards
- **Real-time Collaboration:** Live updates across all clients
- **Rich Task Management:** Labels, assignments, due dates, attachments, comments
- **Activity Tracking:** Comprehensive audit logs
- **Role-Based Access:** Workspace and board-level permissions
- **Search & Filters:** Advanced querying capabilities

### Technical Highlights
- **Scalable WebSocket Architecture** with Socket.io
- **Redis Pub/Sub** for horizontal scaling
- **Optimistic UI Updates** support
- **Rate Limiting** and **API Security**
- **Comprehensive Testing** (Unit, Integration, E2E)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│         (Web, Mobile, Desktop - via REST + WebSocket)       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│  Node.js API    │             │  Node.js API    │
│  Server 1       │◄───────────►│  Server 2       │
│  (Express +     │   Redis     │  (Express +     │
│   Socket.io)    │   Pub/Sub   │   Socket.io)    │
└────────┬────────┘             └────────┬────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │    Redis    │  │   AWS S3    │
│  (Primary)  │  │   (Cache +  │  │ (File       │
│             │  │   Pub/Sub)  │  │  Storage)   │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Component Responsibilities

**API Server (Express)**
- RESTful endpoint handling
- Authentication & authorization
- Business logic validation
- Database operations via Prisma

**WebSocket Server (Socket.io)**
- Real-time bi-directional communication
- Room management (workspace/board rooms)
- Event broadcasting
- Presence tracking

**PostgreSQL**
- Primary data store
- ACID compliance
- Relational data integrity
- Full-text search

**Redis**
- Session storage
- Cache layer (hot data)
- Pub/Sub for WebSocket scaling
- Rate limiting data
- Presence tracking

**S3-Compatible Storage**
- File attachments
- Avatar images
- Backup storage

---

## Project Structure

```
task-management-api/
├── src/
│   ├── config/
│   │   ├── database.ts              # Prisma client configuration
│   │   ├── redis.ts                 # Redis connection setup
│   │   ├── socket.ts                # Socket.io configuration
│   │   ├── s3.ts                    # S3 storage configuration
│   │   └── index.ts                 # Centralized config export
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT authentication
│   │   ├── validation.middleware.ts # Request validation
│   │   ├── errorHandler.ts          # Global error handling
│   │   ├── rateLimiter.ts           # Rate limiting
│   │   ├── permissions.middleware.ts # RBAC checks
│   │   └── logger.middleware.ts     # Request logging
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts       # Auth endpoints
│   │   ├── workspace.controller.ts  # Workspace CRUD
│   │   ├── board.controller.ts      # Board CRUD
│   │   ├── list.controller.ts       # List CRUD
│   │   ├── card.controller.ts       # Card CRUD
│   │   ├── comment.controller.ts    # Comment operations
│   │   ├── label.controller.ts      # Label management
│   │   ├── attachment.controller.ts # File uploads
│   │   ├── member.controller.ts     # Team member management
│   │   └── activity.controller.ts   # Activity logs
│   │
│   ├── services/
│   │   ├── auth.service.ts          # Authentication logic
│   │   ├── workspace.service.ts     # Workspace business logic
│   │   ├── board.service.ts         # Board business logic
│   │   ├── list.service.ts          # List business logic
│   │   ├── card.service.ts          # Card business logic
│   │   ├── comment.service.ts       # Comment logic
│   │   ├── label.service.ts         # Label logic
│   │   ├── attachment.service.ts    # File handling
│   │   ├── member.service.ts        # Member management
│   │   ├── activity.service.ts      # Activity tracking
│   │   ├── notification.service.ts  # Notifications
│   │   ├── search.service.ts        # Search functionality
│   │   └── cache.service.ts         # Redis caching
│   │
│   ├── socket/
│   │   ├── handlers/
│   │   │   ├── workspace.handler.ts # Workspace events
│   │   │   ├── board.handler.ts     # Board events
│   │   │   ├── card.handler.ts      # Card events
│   │   │   ├── presence.handler.ts  # User presence
│   │   │   └── typing.handler.ts    # Typing indicators
│   │   ├── middleware/
│   │   │   ├── auth.socket.ts       # Socket authentication
│   │   │   └── roomManager.ts       # Room management
│   │   └── index.ts                 # Socket.io setup
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── workspace.routes.ts
│   │   ├── board.routes.ts
│   │   ├── list.routes.ts
│   │   ├── card.routes.ts
│   │   ├── comment.routes.ts
│   │   ├── label.routes.ts
│   │   ├── attachment.routes.ts
│   │   ├── member.routes.ts
│   │   ├── activity.routes.ts
│   │   └── index.ts                 # Route aggregation
│   │
│   ├── models/
│   │   └── (Prisma generates types)
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── workspace.validator.ts
│   │   ├── board.validator.ts
│   │   ├── list.validator.ts
│   │   ├── card.validator.ts
│   │   ├── comment.validator.ts
│   │   └── common.validator.ts
│   │
│   ├── utils/
│   │   ├── jwt.util.ts              # JWT operations
│   │   ├── bcrypt.util.ts           # Password hashing
│   │   ├── s3.util.ts               # S3 operations
│   │   ├── logger.util.ts           # Winston logger
│   │   ├── email.util.ts            # Email sending
│   │   ├── validation.util.ts       # Custom validators
│   │   └── helpers.ts               # Helper functions
│   │
│   ├── types/
│   │   ├── express.d.ts             # Express type extensions
│   │   ├── socket.d.ts              # Socket.io types
│   │   └── index.ts                 # Common types
│   │
│   ├── constants/
│   │   ├── errors.ts                # Error messages
│   │   ├── events.ts                # Socket event names
│   │   ├── permissions.ts           # Permission definitions
│   │   └── index.ts
│   │
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # Server entry point
│
├── prisma/
│   ├── schema.prisma                # Database schema
│   ├── migrations/                  # Migration history
│   └── seeds/
│       ├── seed.ts                  # Database seeding
│       └── data/                    # Seed data files
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── utils/
│   │   └── middleware/
│   ├── integration/
│   │   ├── api/
│   │   └── socket/
│   ├── e2e/
│   │   └── scenarios/
│   ├── fixtures/
│   │   └── testData.ts
│   ├── helpers/
│   │   └── testHelpers.ts
│   └── setup.ts                     # Test configuration
│
├── docker/
│   ├── Dockerfile                   # App container
│   ├── Dockerfile.dev               # Development container
│   ├── docker-compose.yml           # Production compose
│   └── docker-compose.dev.yml       # Development compose
│
├── scripts/
│   ├── migrate.sh                   # Database migrations
│   ├── seed.sh                      # Database seeding
│   └── backup.sh                    # Backup script
│
├── docs/
│   ├── API.md                       # API documentation
│   ├── SOCKET_EVENTS.md             # WebSocket events
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── ARCHITECTURE.md              # Architecture details
│
├── .env.example                     # Environment template
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── jest.config.js
├── package.json
└── README.md
```

---

## Software Requirements Specification

### 1. Functional Requirements

#### 1.1 User Authentication & Authorization

**FR-1.1: User Registration**
- Users can register with email and password
- Email verification required
- Password must meet complexity requirements (8+ chars, uppercase, lowercase, number)
- Usernames must be unique

**FR-1.2: User Login**
- Users can login with email/password
- JWT token issued on successful login
- Refresh token for token renewal
- Session management with Redis

**FR-1.3: OAuth Integration**
- Support Google OAuth 2.0
- Support GitHub OAuth
- Auto-create user account on first OAuth login

**FR-1.4: Password Management**
- Password reset via email
- Password change for authenticated users
- Secure password hashing (bcrypt)

**FR-1.5: Role-Based Access Control**
- Workspace roles: Owner, Admin, Member, Guest
- Board roles: Admin, Member, Viewer
- Permission inheritance from workspace to boards

#### 1.2 Workspace Management

**FR-2.1: Workspace Creation**
- Users can create unlimited workspaces
- Workspace requires: name, description (optional), visibility (private/team)
- Creator becomes workspace owner

**FR-2.2: Workspace Settings**
- Update workspace name, description, logo
- Delete workspace (owner only)
- Archive workspace (preserves data)

**FR-2.3: Workspace Members**
- Invite members via email
- Assign workspace roles
- Remove members
- Transfer ownership

**FR-2.4: Workspace Discovery**
- List all workspaces user is member of
- Search workspaces by name

#### 1.3 Board Management

**FR-3.1: Board Creation**
- Create boards within workspace
- Board attributes: name, description, background color/image, visibility
- Board templates (Kanban, Scrum, Custom)

**FR-3.2: Board Operations**
- Update board details
- Archive/unarchive boards
- Delete boards (admin only)
- Duplicate boards (with or without cards)
- Star/favorite boards

**FR-3.3: Board Permissions**
- Set board-specific permissions
- Public boards (view-only for non-members)
- Private boards (members only)

**FR-3.4: Board Members**
- Add workspace members to board
- Assign board-specific roles
- Remove members from board

#### 1.4 List Management

**FR-4.1: List Operations**
- Create lists on boards
- Update list name
- Reorder lists (drag & drop)
- Archive lists
- Copy lists
- Move lists between boards

**FR-4.2: List Constraints**
- Lists belong to single board
- Maximum 50 lists per board
- List position (integer order)

#### 1.5 Card Management

**FR-5.1: Card Creation**
- Create cards in lists
- Required: title
- Optional: description, due date, labels, members

**FR-5.2: Card Operations**
- Update card details
- Move cards between lists
- Move cards between boards
- Copy cards
- Archive cards
- Delete cards
- Reorder cards within list

**FR-5.3: Card Attributes**
- Rich text description
- Due date with reminders
- Assign multiple members
- Add multiple labels
- Set priority (low, medium, high, critical)
- Add cover image
- Track completion status

**FR-5.4: Card Relationships**
- Subtasks/checklist items
- Card dependencies (blocked by)
- Related cards

#### 1.6 Comments & Collaboration

**FR-6.1: Comments**
- Add comments to cards
- Edit own comments
- Delete own comments (soft delete)
- Mention users (@username)
- Rich text formatting (markdown)

**FR-6.2: Reactions**
- React to comments with emojis
- View reaction counts
- Remove reactions

**FR-6.3: Typing Indicators**
- Show when users are typing comments
- Real-time presence in card

#### 1.7 Labels & Tags

**FR-7.1: Label Management**
- Create custom labels (board-level)
- Label attributes: name, color, description
- Preset color palette
- Maximum 30 labels per board

**FR-7.2: Label Operations**
- Assign labels to cards
- Remove labels from cards
- Filter cards by labels
- Update/delete labels

#### 1.8 File Attachments

**FR-8.1: Attachment Upload**
- Upload files to cards
- Supported formats: images, PDFs, documents, archives
- Maximum file size: 10MB
- Multiple attachments per card

**FR-8.2: Attachment Management**
- Preview images inline
- Download attachments
- Delete attachments
- Set attachment as card cover

**FR-8.3: Storage**
- Store files in S3-compatible storage
- Generate pre-signed URLs for secure access
- Automatic file type detection

#### 1.9 Activity Tracking

**FR-9.1: Activity Log**
- Track all actions: create, update, move, delete
- Log timestamp and user
- Action types: card_created, card_moved, comment_added, etc.
- Display activity feed per card/board/workspace

**FR-9.2: Audit Trail**
- Immutable activity records
- Filter activities by type, user, date range
- Export activity logs (admin only)

#### 1.10 Search & Filters

**FR-10.1: Search**
- Full-text search across cards (title, description)
- Search within workspace or board
- Search results ranked by relevance

**FR-10.2: Filters**
- Filter cards by: labels, members, due date, status
- Combine multiple filters
- Save filter presets
- Sort by: date created, due date, priority, alphabetical

#### 1.11 Notifications

**FR-11.1: Real-time Notifications**
- In-app notifications via WebSocket
- Notification types: mentions, assignments, due dates, comments
- Unread notification count

**FR-11.2: Email Notifications**
- Configurable email notifications
- Daily/weekly digest emails
- Immediate notifications for urgent items

**FR-11.3: Notification Preferences**
- Per-workspace notification settings
- Mute specific boards/cards
- Notification frequency control

#### 1.12 Real-Time Collaboration

**FR-12.1: Live Updates**
- Broadcast all changes to connected clients
- Update card positions in real-time
- Show live comment additions
- Sync list reordering

**FR-12.2: Presence Awareness**
- Show active users on board
- Display user avatars
- Typing indicators in comments

**FR-12.3: Conflict Resolution**
- Last-write-wins for most updates
- Optimistic UI updates with rollback
- Version conflict notifications

### 2. Non-Functional Requirements

#### 2.1 Performance

**NFR-1.1: Response Time**
- API endpoints: < 200ms (p95)
- Real-time updates: < 50ms latency
- File uploads: < 2s for 5MB files
- Search queries: < 500ms

**NFR-1.2: Throughput**
- Support 1000+ concurrent WebSocket connections per instance
- Handle 100 requests/second per instance
- Process 10,000+ real-time events/second across cluster

**NFR-1.3: Database Performance**
- Query response time: < 100ms
- Index all foreign keys
- Implement connection pooling
- Use prepared statements

#### 2.2 Scalability

**NFR-2.1: Horizontal Scaling**
- Stateless API servers
- Redis Pub/Sub for WebSocket scaling
- Load balancer distribution
- Support 10,000+ concurrent users

**NFR-2.2: Data Growth**
- Handle 1M+ cards
- Support 100,000+ users
- 1TB+ file storage
- Efficient pagination (cursor-based)

#### 2.3 Security

**NFR-3.1: Authentication Security**
- JWT with RS256 signing
- Token expiry: 1 hour (access), 7 days (refresh)
- Secure cookie storage (httpOnly, secure, sameSite)
- Rate limiting on auth endpoints

**NFR-3.2: Data Security**
- TLS 1.3 for all communications
- Password hashing with bcrypt (10+ rounds)
- SQL injection prevention (Prisma ORM)
- XSS prevention (input sanitization)
- CSRF protection

**NFR-3.3: Authorization**
- Resource-level permission checks
- Workspace/board access validation
- No data leakage between workspaces

**NFR-3.4: File Security**
- Signed URLs for file access
- Virus scanning on uploads
- File type validation
- Size limits enforced

#### 2.4 Reliability

**NFR-4.1: Availability**
- 99.9% uptime SLA
- Graceful degradation
- Health check endpoints
- Database replication

**NFR-4.2: Data Integrity**
- ACID transactions
- Foreign key constraints
- Database backups (daily)
- Point-in-time recovery

**NFR-4.3: Error Handling**
- Comprehensive error logging
- User-friendly error messages
- Automatic retry for transient failures
- Circuit breakers for external services

#### 2.5 Maintainability

**NFR-5.1: Code Quality**
- TypeScript strict mode
- ESLint configuration
- 80%+ test coverage
- Comprehensive documentation

**NFR-5.2: Monitoring**
- Application metrics (Prometheus)
- Error tracking (Sentry)
- Log aggregation (ELK Stack)
- Performance monitoring (APM)

**NFR-5.3: Deployment**
- Zero-downtime deployments
- Blue-green deployment strategy
- Automated CI/CD pipeline
- Database migration automation

#### 2.6 Compatibility

**NFR-6.1: API Versioning**
- RESTful API v1
- Backward compatibility guarantees
- Deprecation notices (6 months)

**NFR-6.2: Browser Support**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- WebSocket support required
- Mobile-responsive

### 3. System Constraints

**SC-1: Technology Stack**
- Node.js 18+ LTS
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose

**SC-2: Development Environment**
- TypeScript 5+
- ESLint, Prettier
- Git version control
- Unix-based development

**SC-3: External Dependencies**
- AWS S3 (or compatible) for file storage
- Email service (SendGrid/AWS SES)
- OAuth providers (Google, GitHub)

---

## Database Schema

### Entity Relationship Diagram

```
User
├── id: uuid (PK)
├── email: string (unique)
├── username: string (unique)
├── password: string (hashed)
├── firstName: string
├── lastName: string
├── avatar: string (URL)
├── emailVerified: boolean
├── createdAt: timestamp
└── updatedAt: timestamp

Workspace
├── id: uuid (PK)
├── name: string
├── description: text
├── slug: string (unique)
├── logo: string (URL)
├── visibility: enum (private, team)
├── ownerId: uuid (FK → User)
├── createdAt: timestamp
└── updatedAt: timestamp

WorkspaceMember
├── id: uuid (PK)
├── workspaceId: uuid (FK → Workspace)
├── userId: uuid (FK → User)
├── role: enum (owner, admin, member, guest)
├── joinedAt: timestamp
└── updatedAt: timestamp

Board
├── id: uuid (PK)
├── workspaceId: uuid (FK → Workspace)
├── name: string
├── description: text
├── slug: string
├── background: json (color/imageUrl)
├── visibility: enum (private, workspace, public)
├── isClosed: boolean
├── position: integer
├── createdAt: timestamp
└── updatedAt: timestamp

BoardMember
├── id: uuid (PK)
├── boardId: uuid (FK → Board)
├── userId: uuid (FK → User)
├── role: enum (admin, member, viewer)
├── joinedAt: timestamp
└── updatedAt: timestamp

BoardStar
├── id: uuid (PK)
├── boardId: uuid (FK → Board)
├── userId: uuid (FK → User)
└── createdAt: timestamp

List
├── id: uuid (PK)
├── boardId: uuid (FK → Board)
├── name: string
├── position: integer
├── isArchived: boolean
├── createdAt: timestamp
└── updatedAt: timestamp

Card
├── id: uuid (PK)
├── listId: uuid (FK → List)
├── title: string
├── description: text
├── position: integer
├── dueDate: timestamp
├── priority: enum (low, medium, high, critical)
├── isArchived: boolean
├── coverImage: string (URL)
├── createdById: uuid (FK → User)
├── createdAt: timestamp
└── updatedAt: timestamp

CardMember
├── id: uuid (PK)
├── cardId: uuid (FK → Card)
├── userId: uuid (FK → User)
└── assignedAt: timestamp

Label
├── id: uuid (PK)
├── boardId: uuid (FK → Board)
├── name: string
├── color: string (hex)
├── description: text
├── createdAt: timestamp
└── updatedAt: timestamp

CardLabel
├── id: uuid (PK)
├── cardId: uuid (FK → Card)
├── labelId: uuid (FK → Label)
└── createdAt: timestamp

Comment
├── id: uuid (PK)
├── cardId: uuid (FK → Card)
├── userId: uuid (FK → User)
├── content: text
├── mentions: json (array of userIds)
├── isDeleted: boolean
├── createdAt: timestamp
└── updatedAt: timestamp

CommentReaction
├── id: uuid (PK)
├── commentId: uuid (FK → Comment)
├── userId: uuid (FK → User)
├── emoji: string
└── createdAt: timestamp

Attachment
├── id: uuid (PK)
├── cardId: uuid (FK → Card)
├── userId: uuid (FK → User)
├── fileName: string
├── fileSize: integer
├── fileType: string
├── s3Key: string
├── url: string
├── uploadedAt: timestamp
└── updatedAt: timestamp

Checklist
├── id: uuid (PK)
├── cardId: uuid (FK → Card)
├── name: string
├── position: integer
├── createdAt: timestamp
└── updatedAt: timestamp

ChecklistItem
├── id: uuid (PK)
├── checklistId: uuid (FK → Checklist)
├── title: string
├── isCompleted: boolean
├── position: integer
├── assignedTo: uuid (FK → User)
├── createdAt: timestamp
└── updatedAt: timestamp

Activity
├── id: uuid (PK)
├── workspaceId: uuid (FK → Workspace)
├── boardId: uuid (FK → Board)
├── cardId: uuid (FK → Card)
├── userId: uuid (FK → User)
├── action: enum (create, update, move, delete, comment, etc.)
├── entityType: enum (card, list, board, comment, etc.)
├── metadata: json
├── createdAt: timestamp
└── INDEX on (workspaceId, createdAt)

Notification
├── id: uuid (PK)
├── userId: uuid (FK → User)
├── type: enum (mention, assignment, dueDate, comment)
├── title: string
├── content: text
├── link: string
├── isRead: boolean
├── createdAt: timestamp
└── readAt: timestamp
```

### Prisma Schema (schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

  ownedWorkspaces      Workspace[]
  workspaceMemberships WorkspaceMember[]
  boardMemberships     BoardMember[]
  boardStars           BoardStar[]
  createdCards         Card[]              @relation("CardCreator")
  cardAssignments      CardMember[]
  comments             Comment[]
  commentReactions     CommentReaction[]
  attachments          Attachment[]
  activities           Activity[]
  notifications        Notification[]
  checklistItemAssignments ChecklistItem[]

  @@map("users")
}

model Workspace {
  id          String   @id @default(uuid())
  name        String
  description String?
  slug        String   @unique
  logo        String?
  visibility  WorkspaceVisibility @default(PRIVATE)
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner      User              @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  members    WorkspaceMember[]
  boards     Board[]
  activities Activity[]

  @@index([ownerId])
  @@map("workspaces")
}

enum WorkspaceVisibility {
  PRIVATE
  TEAM
}

model WorkspaceMember {
  id          String   @id @default(uuid())
  workspaceId String
  userId      String
  role        WorkspaceRole
  joinedAt    DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@index([userId])
  @@map("workspace_members")
}

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
  GUEST
}

model Board {
  id          String   @id @default(uuid())
  workspaceId String
  name        String
  description String?
  slug        String
  background  Json?
  visibility  BoardVisibility @default(PRIVATE)
  isClosed    Boolean  @default(false)
  position    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  members   BoardMember[]
  stars     BoardStar[]
  lists     List[]
  labels    Label[]
  activities Activity[]

  @@unique([workspaceId, slug])
  @@index([workspaceId])
  @@map("boards")
}

enum BoardVisibility {
  PRIVATE
  WORKSPACE
  PUBLIC
}

model BoardMember {
  id       String   @id @default(uuid())
  boardId  String
  userId   String
  role     BoardRole
  joinedAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  board Board @relation(fields: [boardId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([boardId, userId])
  @@index([userId])
  @@map("board_members")
}

enum BoardRole {
  ADMIN
  MEMBER
  VIEWER
}

model BoardStar {
  id        String   @id @default(uuid())
  boardId   String
  userId    String
  createdAt DateTime @default(now())

  board Board @relation(fields: [boardId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([boardId, userId])
  @@index([userId])
  @@map("board_stars")
}

model List {
  id         String   @id @default(uuid())
  boardId    String
  name       String
  position   Int
  isArchived Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  board Board  @relation(fields: [boardId], references: [id], onDelete: Cascade)
  cards Card[]

  @@index([boardId, position])
  @@map("lists")
}

model Card {
  id          String   @id @default(uuid())
  listId      String
  title       String
  description String?
  position    Int
  dueDate     DateTime?
  priority    Priority @default(MEDIUM)
  isArchived  Boolean  @default(false)
  coverImage  String?
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  list        List         @relation(fields: [listId], references: [id], onDelete: Cascade)
  createdBy   User         @relation("CardCreator", fields: [createdById], references: [id])
  members     CardMember[]
  labels      CardLabel[]
  comments    Comment[]
  attachments Attachment[]
  checklists  Checklist[]
  activities  Activity[]

  @@index([listId, position])
  @@index([createdById])
  @@map("cards")
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model CardMember {
  id         String   @id @default(uuid())
  cardId     String
  userId     String
  assignedAt DateTime @default(now())

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([cardId, userId])
  @@index([userId])
  @@map("card_members")
}

model Label {
  id          String   @id @default(uuid())
  boardId     String
  name        String
  color       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  board Board       @relation(fields: [boardId], references: [id], onDelete: Cascade)
  cards CardLabel[]

  @@index([boardId])
  @@map("labels")
}

model CardLabel {
  id        String   @id @default(uuid())
  cardId    String
  labelId   String
  createdAt DateTime @default(now())

  card  Card  @relation(fields: [cardId], references: [id], onDelete: Cascade)
  label Label @relation(fields: [labelId], references: [id], onDelete: Cascade)

  @@unique([cardId, labelId])
  @@index([labelId])
  @@map("card_labels")
}

model Comment {
  id        String   @id @default(uuid())
  cardId    String
  userId    String
  content   String
  mentions  Json?
  isDeleted Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  card      Card              @relation(fields: [cardId], references: [id], onDelete: Cascade)
  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  reactions CommentReaction[]

  @@index([cardId])
  @@index([userId])
  @@map("comments")
}

model CommentReaction {
  id        String   @id @default(uuid())
  commentId String
  userId    String
  emoji     String
  createdAt DateTime @default(now())

  comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([commentId, userId, emoji])
  @@index([userId])
  @@map("comment_reactions")
}

model Attachment {
  id         String   @id @default(uuid())
  cardId     String
  userId     String
  fileName   String
  fileSize   Int
  fileType   String
  s3Key      String
  url        String
  uploadedAt DateTime @default(now())
  updatedAt  DateTime @updatedAt

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([cardId])
  @@index([userId])
  @@map("attachments")
}

model Checklist {
  id        String   @id @default(uuid())
  cardId    String
  name      String
  position  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  card  Card            @relation(fields: [cardId], references: [id], onDelete: Cascade)
  items ChecklistItem[]

  @@index([cardId])
  @@map("checklists")
}

model ChecklistItem {
  id          String   @id @default(uuid())
  checklistId String
  title       String
  isCompleted Boolean  @default(false)
  position    Int
  assignedTo  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  checklist Checklist @relation(fields: [checklistId], references: [id], onDelete: Cascade)
  assignee  User?     @relation(fields: [assignedTo], references: [id])

  @@index([checklistId])
  @@map("checklist_items")
}

model Activity {
  id          String   @id @default(uuid())
  workspaceId String?
  boardId     String?
  cardId      String?
  userId      String
  action      ActivityAction
  entityType  EntityType
  metadata    Json?
  createdAt   DateTime @default(now())

  workspace Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  board     Board?     @relation(fields: [boardId], references: [id], onDelete: Cascade)
  card      Card?      @relation(fields: [cardId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([workspaceId, createdAt])
  @@index([boardId, createdAt])
  @@index([cardId, createdAt])
  @@index([userId])
  @@map("activities")
}

enum ActivityAction {
  CREATE
  UPDATE
  MOVE
  DELETE
  ARCHIVE
  COMMENT
  ASSIGN
  LABEL
  ATTACH
}

enum EntityType {
  WORKSPACE
  BOARD
  LIST
  CARD
  COMMENT
  LABEL
  ATTACHMENT
  CHECKLIST
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  content   String?
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  readAt    DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead, createdAt])
  @@map("notifications")
}

enum NotificationType {
  MENTION
  ASSIGNMENT
  DUE_DATE
  COMMENT
  BOARD_INVITE
}
```

---

## API Endpoints

### Base URL
```
https://api.taskmanager.com/v1
```

### Authentication Endpoints

```
POST   /auth/register           # Register new user
POST   /auth/login              # Login user
POST   /auth/logout             # Logout user
POST   /auth/refresh            # Refresh access token
POST   /auth/forgot-password    # Request password reset
POST   /auth/reset-password     # Reset password
GET    /auth/verify-email       # Verify email address
POST   /auth/google             # Google OAuth
POST   /auth/github             # GitHub OAuth
GET    /auth/me                 # Get current user
PUT    /auth/me                 # Update current user
PUT    /auth/password           # Change password
```

### Workspace Endpoints

```
GET    /workspaces              # List user's workspaces
POST   /workspaces              # Create workspace
GET    /workspaces/:id          # Get workspace details
PUT    /workspaces/:id          # Update workspace
DELETE /workspaces/:id          # Delete workspace
POST   /workspaces/:id/archive  # Archive workspace

# Workspace Members
GET    /workspaces/:id/members              # List members
POST   /workspaces/:id/members              # Invite member
PUT    /workspaces/:id/members/:memberId    # Update member role
DELETE /workspaces/:id/members/:memberId    # Remove member
POST   /workspaces/:id/transfer-ownership   # Transfer ownership

# Workspace Activity
GET    /workspaces/:id/activity             # Get activity log
```

### Board Endpoints

```
GET    /boards                  # List user's boards (all workspaces)
POST   /workspaces/:id/boards   # Create board in workspace
GET    /boards/:id              # Get board details
PUT    /boards/:id              # Update board
DELETE /boards/:id              # Delete board
POST   /boards/:id/archive      # Archive board
POST   /boards/:id/duplicate    # Duplicate board
POST   /boards/:id/star         # Star board
DELETE /boards/:id/star         # Unstar board

# Board Members
GET    /boards/:id/members              # List members
POST   /boards/:id/members              # Add member
PUT    /boards/:id/members/:memberId    # Update member role
DELETE /boards/:id/members/:memberId    # Remove member

# Board Activity
GET    /boards/:id/activity             # Get activity log
```

### List Endpoints

```
GET    /boards/:boardId/lists   # Get all lists in board
POST   /boards/:boardId/lists   # Create list
GET    /lists/:id               # Get list details
PUT    /lists/:id               # Update list
DELETE /lists/:id               # Delete list
POST   /lists/:id/archive       # Archive list
POST   /lists/:id/unarchive     # Unarchive list
POST   /lists/:id/move          # Move list to another board
POST   /lists/:id/copy          # Copy list
PUT    /lists/reorder           # Reorder multiple lists
```

### Card Endpoints

```
GET    /lists/:listId/cards     # Get all cards in list
POST   /lists/:listId/cards     # Create card
GET    /cards/:id               # Get card details
PUT    /cards/:id               # Update card
DELETE /cards/:id               # Delete card
POST   /cards/:id/archive       # Archive card
POST   /cards/:id/move          # Move card to list/board
POST   /cards/:id/copy          # Copy card
PUT    /cards/reorder           # Reorder multiple cards

# Card Members
POST   /cards/:id/members       # Assign member
DELETE /cards/:id/members/:userId # Remove member

# Card Labels
POST   /cards/:id/labels        # Add label
DELETE /cards/:id/labels/:labelId # Remove label

# Card Checklists
GET    /cards/:id/checklists            # Get checklists
POST   /cards/:id/checklists            # Create checklist
PUT    /checklists/:id                  # Update checklist
DELETE /checklists/:id                  # Delete checklist
POST   /checklists/:id/items            # Add checklist item
PUT    /checklist-items/:id             # Update item
DELETE /checklist-items/:id             # Delete item
PUT    /checklist-items/:id/toggle      # Toggle completion

# Card Activity
GET    /cards/:id/activity              # Get card activity
```

### Comment Endpoints

```
GET    /cards/:cardId/comments  # Get card comments
POST   /cards/:cardId/comments  # Create comment
PUT    /comments/:id            # Update comment
DELETE /comments/:id            # Delete comment (soft delete)

# Reactions
POST   /comments/:id/reactions         # Add reaction
DELETE /comments/:id/reactions/:emoji  # Remove reaction
```

### Label Endpoints

```
GET    /boards/:boardId/labels  # Get board labels
POST   /boards/:boardId/labels  # Create label
PUT    /labels/:id              # Update label
DELETE /labels/:id              # Delete label
```

### Attachment Endpoints

```
GET    /cards/:cardId/attachments       # Get card attachments
POST   /cards/:cardId/attachments       # Upload attachment
DELETE /attachments/:id                 # Delete attachment
GET    /attachments/:id/download        # Download attachment
POST   /attachments/:id/set-cover       # Set as card cover
```

### Search Endpoints

```
GET    /search/cards            # Search cards
GET    /search/boards           # Search boards
GET    /search/workspaces       # Search workspaces
```

Query parameters:
- `q`: Search query
- `workspaceId`: Filter by workspace
- `boardId`: Filter by board
- `labels`: Filter by labels
- `members`: Filter by assigned members
- `dueDate`: Filter by due date
- `page`: Page number
- `limit`: Results per page

### Notification Endpoints

```
GET    /notifications           # Get user notifications
PUT    /notifications/:id/read  # Mark as read
PUT    /notifications/read-all  # Mark all as read
DELETE /notifications/:id       # Delete notification
```

### Activity Endpoints

```
GET    /activities              # Get user's recent activity
GET    /activities/workspace/:id # Workspace activity
GET    /activities/board/:id    # Board activity
GET    /activities/card/:id     # Card activity
```

---

## Real-Time Events

### Socket.io Event Structure

```javascript
// Client connects
socket.emit('authenticate', { token: 'jwt_token' });

// Server confirms
socket.on('authenticated', { userId, username });

// Join rooms
socket.emit('join:workspace', { workspaceId });
socket.emit('join:board', { boardId });
socket.emit('leave:board', { boardId });
```

### Event Categories

#### Workspace Events

```javascript
// Server → Client
'workspace:created'       { workspace }
'workspace:updated'       { workspaceId, changes }
'workspace:deleted'       { workspaceId }
'workspace:member:added'  { workspaceId, member }
'workspace:member:removed' { workspaceId, userId }
'workspace:member:updated' { workspaceId, memberId, role }
```

#### Board Events

```javascript
// Server → Client
'board:created'        { board }
'board:updated'        { boardId, changes }
'board:deleted'        { boardId }
'board:archived'       { boardId }
'board:member:added'   { boardId, member }
'board:member:removed' { boardId, userId }
```

#### List Events

```javascript
// Server → Client
'list:created'    { list }
'list:updated'    { listId, changes }
'list:deleted'    { listId }
'list:moved'      { listId, toBoardId }
'list:reordered'  { boardId, lists }
```

#### Card Events

```javascript
// Server → Client
'card:created'         { card }
'card:updated'         { cardId, changes }
'card:deleted'         { cardId }
'card:moved'           { cardId, fromListId, toListId, position }
'card:reordered'       { listId, cards }
'card:member:added'    { cardId, member }
'card:member:removed'  { cardId, userId }
'card:label:added'     { cardId, label }
'card:label:removed'   { cardId, labelId }
```

#### Comment Events

```javascript
// Server → Client
'comment:created'   { comment }
'comment:updated'   { commentId, content }
'comment:deleted'   { commentId }
'comment:reaction:added'   { commentId, reaction }
'comment:reaction:removed' { commentId, userId, emoji }
```

#### Presence Events

```javascript
// Client → Server
'presence:join'    { boardId }
'presence:leave'   { boardId }
'typing:start'     { cardId }
'typing:stop'      { cardId }

// Server → Client
'presence:users'   { boardId, users: [{ userId, username, avatar }] }
'user:joined'      { boardId, user }
'user:left'        { boardId, userId }
'typing:started'   { cardId, user }
'typing:stopped'   { cardId, userId }
```

#### Notification Events

```javascript
// Server → Client
'notification:new'   { notification }
```

### Event Payload Examples

```javascript
// Card moved event
{
  event: 'card:moved',
  data: {
    cardId: 'uuid',
    fromListId: 'uuid',
    toListId: 'uuid',
    position: 2,
    movedBy: {
      id: 'uuid',
      username: 'john_doe'
    },
    timestamp: '2024-01-04T10:30:00Z'
  }
}

// Comment created event
{
  event: 'comment:created',
  data: {
    comment: {
      id: 'uuid',
      cardId: 'uuid',
      userId: 'uuid',
      username: 'jane_smith',
      avatar: 'url',
      content: 'This looks great! @john_doe',
      mentions: ['uuid'],
      createdAt: '2024-01-04T10:30:00Z'
    }
  }
}

// Typing indicator
{
  event: 'typing:started',
  data: {
    cardId: 'uuid',
    user: {
      id: 'uuid',
      username: 'john_doe',
      avatar: 'url'
    }
  }
}
```

### Room Management

```javascript
// Room naming convention
'workspace:{workspaceId}'
'board:{boardId}'
'card:{cardId}'
'user:{userId}'

// Example: User joins board
socket.join(`board:${boardId}`);
socket.join(`workspace:${workspaceId}`);

// Broadcasting to room
io.to(`board:${boardId}`).emit('card:created', cardData);

// Broadcasting except sender
socket.to(`board:${boardId}`).emit('card:updated', cardData);
```

---

## Development Phases

### Phase 1: Foundation & Core Setup (Week 1-2)

**Duration:** 2 weeks

**Objectives:**
- Set up development environment
- Configure database and caching
- Implement authentication system
- Basic project structure

**Tasks:**

**Week 1:**
- [ ] Initialize Node.js + TypeScript project
- [ ] Configure ESLint, Prettier, Git hooks
- [ ] Set up Docker & Docker Compose
  - PostgreSQL container
  - Redis container
  - App container (dev mode)
- [ ] Configure Prisma ORM
  - Initial schema for User model
  - Database migrations setup
- [ ] Implement User authentication
  - User registration endpoint
  - Login endpoint with JWT
  - Password hashing (bcrypt)
  - JWT middleware
- [ ] Set up Redis for sessions
- [ ] Configure environment variables
- [ ] Set up Winston logger
- [ ] Create base middleware (error handler, logger)

**Week 2:**
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Implement refresh token mechanism
- [ ] Add OAuth 2.0 (Google)
- [ ] Add OAuth 2.0 (GitHub)
- [ ] Create user profile endpoints
- [ ] Unit tests for auth services
- [ ] Integration tests for auth endpoints
- [ ] API documentation (Swagger/OpenAPI)

**Deliverables:**
- Functional authentication system
- Database with User model
- Docker development environment
- 80%+ test coverage for auth
- API documentation for auth endpoints

---

### Phase 2: Workspace & Board Management (Week 3-4)

**Duration:** 2 weeks

**Objectives:**
- Implement workspace CRUD
- Implement board CRUD
- Role-based access control
- Member management

**Tasks:**

**Week 3:**
- [ ] Extend Prisma schema
  - Workspace model
  - WorkspaceMember model with roles
  - Board model
  - BoardMember model
- [ ] Implement Workspace service layer
  - Create workspace
  - Update workspace
  - Delete workspace
  - List user workspaces
- [ ] Implement Workspace endpoints
- [ ] Implement permission middleware
  - Check workspace membership
  - Validate workspace roles
- [ ] Implement member invitation system
  - Invite via email
  - Accept invitation
  - Role assignment

**Week 4:**
- [ ] Implement Board service layer
  - Create board
  - Update board
  - Delete/archive board
  - Board visibility settings
- [ ] Implement Board endpoints
- [ ] Board member management
  - Add members to board
  - Update board roles
  - Remove members
- [ ] Board starring functionality
- [ ] Activity logging for workspaces/boards
- [ ] Unit tests for workspace/board services
- [ ] Integration tests for endpoints
- [ ] Update API documentation

**Deliverables:**
- Fully functional workspace management
- Fully functional board management
- RBAC system operational
- Activity logging foundation
- Test coverage 80%+

---

### Phase 3: Lists, Cards & Core Features (Week 5-6)

**Duration:** 2 weeks

**Objectives:**
- Implement list and card CRUD
- Card attributes (labels, members, due dates)
- Card reordering and movement
- Checklists

**Tasks:**

**Week 5:**
- [ ] Extend Prisma schema
  - List model
  - Card model
  - CardMember model
  - Label model
  - CardLabel model
- [ ] Implement List service layer
  - Create, update, delete lists
  - List reordering
  - Archive/unarchive lists
- [ ] Implement List endpoints
- [ ] Implement Card service layer (basic)
  - Create, update, delete cards
  - Card positioning
  - Archive cards
- [ ] Implement Card endpoints (basic)

**Week 6:**
- [ ] Implement Label management
  - Create labels (board-level)
  - Assign labels to cards
  - Update/delete labels
- [ ] Implement Card member assignment
  - Assign users to cards
  - Remove assignments
- [ ] Implement Card attributes
  - Due dates
  - Priority levels
  - Cover images
- [ ] Implement Checklist functionality
  - Create checklists
  - Add/update/delete items
  - Toggle completion
- [ ] Card movement between lists
- [ ] Card movement between boards
- [ ] Bulk card operations
- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] Update API documentation

**Deliverables:**
- Complete list and card management
- Label system
- Checklist functionality
- Card assignment system
- Test coverage 80%+

---

### Phase 4: Real-Time WebSocket Integration (Week 7-8)

**Duration:** 2 weeks

**Objectives:**
- Set up Socket.io server
- Implement real-time event broadcasting
- Room management
- Presence tracking

**Tasks:**

**Week 7:**
- [ ] Set up Socket.io server
- [ ] Implement WebSocket authentication
  - JWT validation for socket connections
- [ ] Implement room management
  - Join workspace room
  - Join board room
  - Leave rooms
- [ ] Set up Redis Pub/Sub adapter
  - For horizontal scaling
  - Cross-server event broadcasting
- [ ] Implement board events
  - board:created
  - board:updated
  - board:deleted
- [ ] Implement list events
  - list:created, updated, deleted
  - list:reordered
- [ ] Implement card events
  - card:created, updated, deleted
  - card:moved
  - card:reordered

**Week 8:**
- [ ] Implement card member events
  - card:member:added
  - card:member:removed
- [ ] Implement label events
  - card:label:added
  - card:label:removed
- [ ] Implement presence tracking
  - User joined/left board
  - Active users list
- [ ] Implement typing indicators
  - typing:start, typing:stop events
- [ ] Optimize event payloads
- [ ] Implement event throttling/debouncing
- [ ] WebSocket integration tests
- [ ] Load testing for concurrent connections
- [ ] Update API documentation (socket events)

**Deliverables:**
- Fully functional WebSocket server
- Real-time updates for all core entities
- Presence tracking system
- Redis Pub/Sub integration
- WebSocket documentation
- Load test results

---

### Phase 5: Comments, Attachments & Rich Features (Week 9-10)

**Duration:** 2 weeks

**Objectives:**
- Implement comment system
- File attachment functionality
- Search capabilities
- Activity feeds

**Tasks:**

**Week 9:**
- [ ] Extend Prisma schema
  - Comment model
  - CommentReaction model
  - Attachment model
  - Activity model (enhancement)
- [ ] Implement Comment service
  - Create, update, delete comments
  - Soft delete for comments
  - Mention parsing (@username)
- [ ] Implement Comment endpoints
- [ ] Implement comment reactions
  - Add/remove emoji reactions
- [ ] Implement real-time comment events
  - comment:created, updated, deleted
  - comment:reaction:added, removed
- [ ] Set up S3-compatible storage
  - AWS S3 or MinIO
  - Bucket configuration
- [ ] Implement Attachment service
  - File upload (multipart)
  - File type validation
  - Size limits
  - Virus scanning integration (optional)
  - Generate pre-signed URLs

**Week 10:**
- [ ] Implement Attachment endpoints
  - Upload file
  - Download file
  - Delete file
  - Set card cover
- [ ] Implement full-text search
  - PostgreSQL full-text search
  - Search across cards (title, description)
  - Search filtering (labels, members, dates)
- [ ] Implement Search endpoints
- [ ] Implement advanced Activity feeds
  - Workspace activity
  - Board activity
  - Card activity
  - User activity
- [ ] Activity filtering and pagination
- [ ] Unit tests for comments/attachments
- [ ] Integration tests
- [ ] Update API documentation

**Deliverables:**
- Comment system with reactions
- File attachment functionality
- Search capabilities
- Enhanced activity tracking
- Test coverage 80%+

---

### Phase 6: Notifications & Advanced Features (Week 11-12)

**Duration:** 2 weeks

**Objectives:**
- Notification system
- Email notifications
- Rate limiting
- Caching optimization

**Tasks:**

**Week 11:**
- [ ] Extend Prisma schema
  - Notification model
- [ ] Implement Notification service
  - Create notifications
  - Mark as read
  - Delete notifications
  - Notification preferences
- [ ] Implement Notification endpoints
- [ ] Real-time notification events
  - notification:new
- [ ] Implement notification triggers
  - @mentions
  - Card assignments
  - Due date reminders
  - Comments on assigned cards
- [ ] Set up email service
  - SendGrid or AWS SES
  - Email templates (Handlebars)
- [ ] Implement email notifications
  - Digest emails (daily/weekly)
  - Immediate notifications for urgent items
  - Unsubscribe functionality

**Week 12:**
- [ ] Implement rate limiting
  - Express-rate-limit
  - Redis store for rate limits
  - Per-user and per-IP limits
  - Different limits for auth vs. general endpoints
- [ ] Implement caching layer
  - Cache frequently accessed data
  - Cache invalidation strategies
  - Redis caching service
  - Cache board data
  - Cache user permissions
- [ ] Implement advanced filters
  - Filter cards by multiple criteria
  - Saved filter presets
- [ ] Implement card duplication
- [ ] Implement board templates
- [ ] Performance optimization
  - Database query optimization
  - Index optimization
  - N+1 query prevention (dataloader pattern)
- [ ] Load testing and optimization
- [ ] Update API documentation

**Deliverables:**
- Notification system (in-app + email)
- Rate limiting implementation
- Caching layer
- Performance optimizations
- Load test reports

---

### Phase 7: Testing, Security & Polish (Week 13-14)

**Duration:** 2 weeks

**Objectives:**
- Comprehensive testing
- Security hardening
- Documentation completion
- Bug fixes and polish

**Tasks:**

**Week 13:**
- [ ] Security audit
  - SQL injection testing (Prisma should prevent)
  - XSS prevention review
  - CSRF protection implementation
  - Rate limiting review
  - JWT security review
  - Helmet.js integration
- [ ] Comprehensive integration tests
  - End-to-end user flows
  - Multi-user collaboration scenarios
- [ ] E2E tests with real WebSocket connections
- [ ] Performance testing
  - Load testing (Artillery, k6)
  - Stress testing
  - Concurrent user testing
- [ ] Database optimization
  - Query performance analysis
  - Index optimization
  - Connection pool tuning
- [ ] Fix identified bugs
- [ ] Code review and refactoring

**Week 14:**
- [ ] Complete API documentation
  - OpenAPI/Swagger spec
  - Request/response examples
  - Error code documentation
- [ ] Complete WebSocket documentation
  - Event reference
  - Connection guide
  - Example implementations
- [ ] Write deployment guide
  - Production deployment steps
  - Environment configuration
  - Database migration guide
  - Scaling guide
- [ ] Create developer onboarding docs
  - Setup guide
  - Architecture overview
  - Contribution guide
- [ ] Final testing pass
- [ ] Performance benchmarking
- [ ] Prepare release notes

**Deliverables:**
- 90%+ test coverage
- Security audit report
- Complete documentation
- Performance benchmarks
- Production-ready codebase

---

### Phase 8: Deployment & Monitoring (Week 15-16)

**Duration:** 2 weeks

**Objectives:**
- Production deployment
- Monitoring setup
- CI/CD pipeline
- Documentation finalization

**Tasks:**

**Week 15:**
- [ ] Set up production infrastructure
  - Cloud provider setup (AWS/GCP/Azure)
  - PostgreSQL RDS or managed instance
  - Redis cluster or ElastiCache
  - S3 bucket setup
- [ ] Configure production Docker images
  - Multi-stage builds
  - Security scanning
  - Image optimization
- [ ] Set up CI/CD pipeline
  - GitHub Actions or GitLab CI
  - Automated testing
  - Automated deployments
  - Database migration automation
- [ ] Set up load balancer (Nginx/ALB)
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring
  - Application Performance Monitoring (APM)
  - Prometheus + Grafana
  - Custom dashboards

**Week 16:**
- [ ] Set up logging infrastructure
  - Centralized logging (ELK Stack)
  - Log retention policies
- [ ] Set up error tracking
  - Sentry or similar
  - Error alerting
- [ ] Set up health checks
  - Liveness probes
  - Readiness probes
- [ ] Configure backup strategy
  - Database backups (automated)
  - S3 backup policies
  - Backup testing
- [ ] Implement blue-green deployment
- [ ] Production smoke tests
- [ ] Create runbooks
  - Deployment procedures
  - Incident response
  - Common troubleshooting
- [ ] Final security review
- [ ] Production launch

**Deliverables:**
- Production deployment
- CI/CD pipeline
- Monitoring and alerting
- Backup strategy
- Runbooks and documentation
- Production-ready system

---

## Testing Strategy

### Testing Pyramid

```
       /\
      /  \     E2E Tests (10%)
     /    \    - Full user workflows
    /------\   - Real WebSocket connections
   /        \  Integration Tests (30%)
  /          \ - API endpoint tests
 /            \- WebSocket event tests
/--------------\
  Unit Tests (60%)
  - Service layer
  - Utilities
  - Middleware
```

### Unit Tests

**Tools:** Jest, ts-jest

**Coverage Areas:**
- All service layer functions
- Utility functions
- Middleware functions
- Validators
- Helper functions

**Example Structure:**

```typescript
// tests/unit/services/card.service.test.ts
describe('CardService', () => {
  describe('createCard', () => {
    it('should create a card with valid data', async () => {
      // Arrange
      const mockPrisma = { card: { create: jest.fn() } };
      const cardService = new CardService(mockPrisma);
      
      // Act
      const result = await cardService.createCard({
        listId: 'uuid',
        title: 'Test Card'
      });
      
      // Assert
      expect(mockPrisma.card.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Card'
        })
      });
    });
    
    it('should throw error for invalid listId', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

**Tools:** Jest, Supertest

**Coverage Areas:**
- API endpoints
- Authentication flows
- Permission checks
- Database operations

**Example Structure:**

```typescript
// tests/integration/api/cards.test.ts
describe('Card API', () => {
  let app: Express;
  let authToken: string;
  let testBoard: Board;
  let testList: List;
  
  beforeAll(async () => {
    app = createApp();
    // Set up test database
    authToken = await createTestUser();
    testBoard = await createTestBoard();
    testList = await createTestList(testBoard.id);
  });
  
  afterAll(async () => {
    // Clean up test data
  });
  
  describe('POST /lists/:listId/cards', () => {
    it('should create a card', async () => {
      const response = await request(app)
        .post(`/lists/${testList.id}/cards`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Card',
          description: 'Test Description'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Card');
    });
    
    it('should return 401 without auth', async () => {
      // Test implementation
    });
    
    it('should return 403 without permission', async () => {
      // Test implementation
    });
  });
});
```

### E2E Tests

**Tools:** Jest, Socket.io Client

**Coverage Areas:**
- Complete user workflows
- Real-time collaboration scenarios
- Multi-user interactions

**Example Structure:**

```typescript
// tests/e2e/scenarios/card-collaboration.test.ts
describe('Card Collaboration E2E', () => {
  let user1Socket: Socket;
  let user2Socket: Socket;
  let testCard: Card;
  
  beforeAll(async () => {
    // Set up two authenticated socket connections
    user1Socket = await connectSocket(user1Token);
    user2Socket = await connectSocket(user2Token);
    
    // Create test data
    testCard = await createTestCard();
  });
  
  afterAll(async () => {
    user1Socket.disconnect();
    user2Socket.disconnect();
  });
  
  it('should broadcast card updates in real-time', async () => {
    // User 2 listens for updates
    const updatePromise = new Promise((resolve) => {
      user2Socket.on('card:updated', resolve);
    });
    
    // User 1 updates card via API
    await request(app)
      .put(`/cards/${testCard.id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Updated Title' });
    
    // User 2 should receive the update
    const update = await updatePromise;
    expect(update).toMatchObject({
      cardId: testCard.id,
      changes: { title: 'Updated Title' }
    });
  });
});
```

### Test Data Management

```typescript
// tests/fixtures/testData.ts
export const createTestUser = async (overrides = {}) => {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: await bcrypt.hash('Password123!', 10),
      emailVerified: true,
      ...overrides
    }
  });
};

export const createTestWorkspace = async (userId: string) => {
  return await prisma.workspace.create({
    data: {
      name: `Test Workspace ${Date.now()}`,
      slug: `test-workspace-${Date.now()}`,
      ownerId: userId,
      visibility: 'PRIVATE'
    }
  });
};

// More factory functions...
```

### Performance Tests

**Tools:** Artillery, k6

```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 60
      arrivalRate: 100
      name: "Sustained load"

scenarios:
  - name: "Create and update cards"
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "test@example.com"
            password: "password"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/lists/{{ listId }}/cards"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            title: "Test Card"
      - think: 2
      - put:
          url: "/cards/{{ cardId }}"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            title: "Updated Card"
```

---

## Deployment Strategy

### Docker Configuration

**Dockerfile (Production)**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN npm run build
RUN npx prisma generate

# Production stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

**docker-compose.yml (Production)**

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app-network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - app-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

### Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/taskmanager
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_URL=redis://:password@redis:6379
REDIS_TTL=3600

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=taskmanager-attachments

# Email
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@taskmanager.com

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Misc
FRONTEND_URL=https://app.taskmanager.com
API_RATE_LIMIT=100
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: username/taskmanager-api:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app/taskmanager-api
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T app npm run migrate:deploy
```

### Database Migrations

```bash
# scripts/migrate.sh
#!/bin/bash

echo "Running database migrations..."

# Check if in production
if [ "$NODE_ENV" == "production" ]; then
  echo "Production environment detected"
  echo "Creating backup before migration..."
  
  # Backup database
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  
  echo "Backup created successfully"
fi

# Run migrations
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "Migrations completed successfully"
else
  echo "Migration failed!"
  exit 1
fi
```

### Monitoring Setup

**Prometheus Configuration:**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'taskmanager-api'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/metrics'
```

**Application Metrics:**

```typescript
// src/utils/metrics.ts
import promClient from 'prom-client';

export const register = new promClient.Registry();

// Default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const activeSocketConnections = new promClient.Gauge({
  name: 'active_socket_connections',
  help: 'Number of active WebSocket connections',
  registers: [register]
});

export const cardOperations = new promClient.Counter({
  name: 'card_operations_total',
  help: 'Total number of card operations',
  labelNames: ['operation'],
  registers: [register]
});
```

---

## Additional Considerations

### Performance Optimization Tips

1. **Database Indexes:**
   - Index foreign keys
   - Index frequently queried fields (email, username)
   - Composite indexes for common query patterns
   - Partial indexes for filtered queries

2. **Caching Strategy:**
   - Cache user sessions (Redis)
   - Cache board data (5 min TTL)
   - Cache workspace permissions (10 min TTL)
   - Implement cache invalidation on updates

3. **Query Optimization:**
   - Use select to fetch only needed fields
   - Implement pagination (cursor-based)
   - Use database transactions for multi-step operations
   - Avoid N+1 queries (use include/joins)

4. **WebSocket Optimization:**
   - Implement event throttling for high-frequency updates
   - Compress event payloads
   - Use binary protocols where appropriate
   - Implement backpressure handling

### Security Checklist

- [ ] All passwords hashed with bcrypt (10+ rounds)
- [ ] JWT tokens signed with RS256
- [ ] HTTPS enforced in production
- [ ] CORS configured properly
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF tokens for state-changing operations
- [ ] Helmet.js for security headers
- [ ] File upload validation (type, size)
- [ ] Signed URLs for file access
- [ ] Environment variables for secrets
- [ ] Database credentials rotation
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning

### Scalability Considerations

1. **Horizontal Scaling:**
   - Stateless API servers
   - Redis Pub/Sub for WebSocket scaling
   - Load balancer (round-robin)
   - Session storage in Redis (not memory)

2. **Database Scaling:**
   - Read replicas for heavy read loads
   - Connection pooling
   - Query optimization
   - Partitioning for large tables (future)

3. **File Storage:**
   - Use CDN for static assets
   - S3 transfer acceleration
   - Lazy loading for attachments

4. **Caching:**
   - Multi-tier caching (Redis + CDN)
   - Cache warming strategies
   - Intelligent cache invalidation

---

## Summary

This blueprint provides a comprehensive roadmap for building a production-grade real-time collaborative task management API. The 16-week development plan is structured to build incrementally, with each phase delivering working features while maintaining code quality and test coverage.

**Key Success Factors:**
- Follow the phased approach strictly
- Maintain 80%+ test coverage throughout
- Document as you build
- Regular code reviews
- Performance testing at each phase
- Security-first mindset

**Next Steps:**
1. Review and adjust timeline based on team size
2. Set up project repository
3. Configure development environment
4. Begin Phase 1: Foundation & Core Setup

Good luck with your build! 🚀
