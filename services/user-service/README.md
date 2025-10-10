# User Service - Pediafor Assessment Platform

## Overview

The User Service is a core microservice in the Pediafor Assessment Platform, implementing secure authentication and user management with modern cryptographic standards. Built as part of a pure microservices architecture, it provides:

- **🔐 Secure Authentication**: PASETO V4 tokens with Ed25519 cryptography
- **👥 User Management**: Complete CRUD operations with role-based access control
- **📤 Event-Driven Architecture**: RabbitMQ integration for real-time notifications
- **🏛️ Database-per-Service**: Dedicated PostgreSQL database with Prisma ORM
- **🐳 Production Ready**: Containerized with Docker Compose orchestration
- **🧪 Comprehensive Testing**: 89+ tests covering unit, functional, and integration scenarios
- **🔒 Security-First Design**: httpOnly cookies, token rotation, XSS/CSRF protection

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gateway       │    │   User Service  │    │   PostgreSQL    │
│   Service       │    │                 │    │   Database      │
│                 │    │                 │    │                 │
│ - Route Auth    │◄──►│ - User CRUD     │◄──►│ - User Data     │
│ - Token Verify  │    │ - Auth Logic    │    │ - Sessions      │
│ - Load Balance  │    │ - Token Issue   │    │ - Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        ▼                        │
        │               ┌─────────────────┐               │
        │               │    RabbitMQ     │               │
        │               │   Event Bus     │               │
        │               │                 │               │
        │               │ - User Events   │               │
        │               │ - Notifications │               │
        │               │ - Analytics     │               │
        │               └─────────────────┘               │
        │                        │                        │
   Port :3000               Port :4000               Port :5432
   (Public API)            (Internal)             (Private)
```

### Microservices Communication

- **Gateway Service**: Public-facing API gateway with authentication middleware and request routing
- **User Service**: Internal service handling user operations, authentication, and token issuance
- **Assessment Service**: Consumer of user authentication for assessment management operations
- **Submission Service**: Consumer of user authentication for student submission management
- **Grading Service**: (Planned) Consumer of user authentication for automated grading operations
- **Database Isolation**: Each service has its own PostgreSQL instance for data sovereignty
- **Token Distribution**: PASETO public key shared across services for distributed verification

## 🚀 Key Features

### Authentication & Security
- **PASETO V4 Tokens**: Modern alternative to JWT with Ed25519 signatures
- **Argon2 Password Hashing**: Memory-hard algorithm resistant to attacks
- **Session Management**: httpOnly cookies with automatic token rotation
- **Role-Based Access**: STUDENT, TEACHER, ADMIN with granular permissions
- **XSS/CSRF Protection**: Secure cookie policies and token isolation

### User Management
- **Complete CRUD Operations**: Create, read, update, delete users
- **Profile Management**: Names, metadata, profile pictures, last login tracking
- **Soft Delete**: Maintains data integrity while marking users inactive
- **Pagination Support**: Efficient listing with role-based filtering

### Event-Driven Architecture
- **RabbitMQ Integration**: Real-time event publishing for user lifecycle events
- **Event Types**: user.registered, user.profile_updated, user.deactivated, user.reactivated, user.role_changed
- **Reliable Messaging**: Durable queues with error handling and service continuity
- **Cross-Service Communication**: Enables other services to react to user changes
- **Analytics Ready**: User events feed into analytics and notification systems

### Development Experience
- **TypeScript**: Full type safety with modern JavaScript features
- **Prisma ORM**: Type-safe database operations with auto-generated client
- **Hot Reload**: Development environment with automatic code recompilation
- **Comprehensive Testing**: 89+ tests with event integration testing for robust CI/CD

## 📊 Database Schema

```prisma
model User {
  id                 String    @id @default(uuid())
  email              String    @unique
  passwordHash       String
  firstName          String?
  lastName           String?
  role               UserRole  @default(STUDENT)
  isActive           Boolean   @default(true)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  lastLogin          DateTime?
  profilePicture     String?
  metadata           Json?
  refreshToken       String?   // Stored securely for session management
  
  @@map("users")
}

enum UserRole {
  STUDENT
  TEACHER
  ADMIN
}
```

## 🛠️ Technology Stack

### Runtime
- **Node.js 18+**: JavaScript runtime with modern ES modules
- **Express.js 5.1**: Fast, minimalist web framework
- **Prisma 6.16**: Next-generation ORM with type safety
- **PostgreSQL 15**: Robust relational database
- **PASETO 3.1**: Secure token implementation
- **RabbitMQ**: Message broker for event-driven architecture
- **amqplib**: Node.js RabbitMQ client for reliable messaging

### Development
- **TypeScript 5.9**: Static typing and modern JavaScript
- **Jest 29**: Testing framework with TypeScript support
- **Docker Compose**: Container orchestration for development/production
- **ts-node-dev**: Hot reload development server

## 🧪 Testing Suite

Our comprehensive testing approach ensures reliability and maintainability:

### Test Coverage (89+ Tests)
```
✅ Basic Environment Tests (6 tests)
   - Environment setup, TypeScript support, async operations

✅ Functional Core Tests (12 tests)  
   - Email validation, password strength, user data structures
   - Token management concepts, business logic validation

✅ Hash Utility Tests (7 tests)
   - Password hashing and verification with Argon2 simulation
   - Security edge cases and error handling

✅ PASETO Token Tests (9 tests)
   - Token generation, verification, expiration handling
   - Audience/issuer validation, security scenarios

✅ User Service Tests (14 tests)
   - CRUD operations, pagination, role management
   - Soft delete functionality, error scenarios

✅ Auth Service Tests (12 tests)
   - Token issuance, refresh token handling
   - Session management, security validation

✅ Event Publisher Tests (7 tests)
   - RabbitMQ connection management, event publishing
   - Error handling for messaging failures

✅ User Service Integration Tests (22 tests)
   - Complete user lifecycle with event integration
   - Registration, updates, deactivation with event verification
```

### Testing Philosophy
- **Mock-Based Approach**: Fast tests without external dependencies
- **Concept Testing**: Focus on business logic rather than implementation details
- **CI/CD Ready**: No database requirements for unit/functional tests
- **Integration Tests**: Separate suite requiring Docker environment

### Running Tests
```bash
# Run all unit and functional tests (fast)
npm test -- --testPathIgnorePatterns="tests/integration"

# Run integration tests (requires Docker)
docker-compose up -d user-db
npm test tests/integration

# Run specific test suites
npm test tests/unit/utils/paseto.test.ts
npm test tests/functional.test.ts
```

Using Prisma ORM:

```prisma
model User {
  id                 String    @id @default(uuid())
  email              String    @unique
  passwordHash       String
  firstName          String?
  lastName           String?
  role               UserRole  @default(STUDENT)
  isActive           Boolean   @default(true)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  lastLogin          DateTime?
  profilePicture     String?
  metadata           Json?
  resetPasswordToken String?
  resetTokenExpiry   DateTime?
  refreshToken       String?
}

enum UserRole {
  STUDENT
  TEACHER
  ADMIN
}
```

## 📋 Current Implementation Status

### ✅ **Completed Features**
- **🔐 Complete Authentication System**: Secure login/logout with PASETO V4 tokens
- **👥 User Registration & Management**: Full CRUD operations with validation
- **🔑 Advanced Token Security**: Ed25519 cryptography with 15min access/7day refresh
- **🍪 Session Management**: httpOnly cookies with rotation and XSS protection
- **🛡️ Password Security**: Argon2 hashing with secure verification
- **🗄️ Database Integration**: Prisma ORM with PostgreSQL and error handling
- **🐳 Production Deployment**: Multi-stage Docker builds with optimization
- **🧪 Comprehensive Testing**: 89+ tests covering all core functionality and event integration
- **🏗️ Microservices Architecture**: Database-per-service with isolated containers
- **📊 API Documentation**: Complete endpoint documentation with examples
- **🔄 Event-Driven Architecture**: Complete RabbitMQ integration with 5 event types
- **📡 Real-time Communication**: User lifecycle events published to message broker
- **🎯 Cross-Service Integration**: Events consumed by analytics and notification systems

### 🔄 **Architecture Completed**
- **Gateway Integration**: Token verification shared via public key
- **Service Isolation**: Independent PostgreSQL databases
- **Container Orchestration**: Docker Compose with networking
- **Environment Configuration**: Secure secret management
- **Test Infrastructure**: Mock-based testing for fast CI/CD

## 📁 Project Structure

```
services/user-service/
├── src/
│   ├── app.ts                    # Express application setup
│   ├── server.ts                 # HTTP server with RabbitMQ initialization ✅
│   ├── prismaClient.ts           # Database client configuration
│   ├── config/
│   │   └── rabbitmq.ts          # RabbitMQ connection management ✅
│   ├── events/
│   │   └── publisher.ts         # Event publishing for user lifecycle ✅
│   ├── routes/
│   │   ├── auth.routes.ts        # Authentication endpoints ✅
│   │   └── user.routes.ts        # User CRUD operations ✅
│   ├── services/
│   │   ├── auth.service.ts       # Token & session management ✅
│   │   └── user.service.ts       # User business logic with events ✅
│   ├── utils/
│   │   ├── paseto.ts            # PASETO V4 implementation ✅
│   │   └── hash.ts              # Argon2 password hashing ✅
│   └── middleware/
│       └── auth.middleware.ts    # Token validation middleware ✅
├── tests/                        # Comprehensive test suite
│   ├── basic.test.ts            # Environment & setup tests
│   ├── functional.test.ts       # Core functionality tests
│   ├── unit/
│   │   ├── utils/               # Utility function tests
│   │   ├── services/            # Service layer tests
│   │   └── events/              # Event publisher tests ✅
│   ├── integration/             # Full API integration tests with events ✅
│   └── setup.ts                 # Test configuration & utilities
├── prisma/
│   ├── schema.prisma            # Database schema definition
│   └── migrations/              # Database version control
├── scripts/
│   └── generate-keys.js         # Ed25519 key pair generation
├── docker-compose.yml           # Service orchestration
├── Dockerfile                   # Container definition
└── package.json                 # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**: Modern JavaScript runtime
- **Docker & Docker Compose**: Container orchestration
- **Git**: Version control system

### Quick Start (Development)

1. **Clone and navigate to the service:**
```bash
git clone <repository-url>
cd assessment/services/user-service
```

2. **Generate PASETO V4 key pairs:**
```bash
node scripts/generate-keys.js
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with generated keys and database credentials
```

4. **Start the development environment:**
```bash
docker-compose up
```

This starts:
- **User Service**: http://localhost:4000 (development with hot reload)
- **PostgreSQL Database**: localhost:5432 (isolated to user-service)
- **Automatic migrations**: Database schema applied on startup

### Environment Configuration

Create `.env` file with these variables:

```env
# Database Configuration
POSTGRES_USER=userservice_user
POSTGRES_PASSWORD=userservice_password
POSTGRES_DB=userservice_db
DATABASE_URL=postgresql://userservice_user:userservice_password@user-db:5432/userservice_db

# RabbitMQ Configuration
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672

# PASETO V4 Keys (generated from scripts/generate-keys.js)
PASETO_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
<your_ed25519_private_key>
-----END PRIVATE KEY-----"

PASETO_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<your_ed25519_public_key>
-----END PUBLIC KEY-----"

# Service Configuration
PORT=4000
NODE_ENV=development
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.yml up --build -d

# Run database migrations
docker-compose exec user-service npx prisma migrate deploy

# Generate Prisma client
docker-compose exec user-service npx prisma generate
```

### Development Workflow

```bash
# View logs
docker-compose logs -f user-service

# Access database
docker-compose exec user-db psql -U userservice_user -d userservice_db

# Run migrations
docker-compose exec user-service npx prisma migrate dev --name add_new_feature

# Reset database
docker-compose exec user-service npx prisma migrate reset

# Generate Prisma client after schema changes
docker-compose exec user-service npx prisma generate
```

## 🌐 API Endpoints

### Health & System Routes

| Method | Endpoint | Description | Response | Status |
|--------|----------|-------------|-----------|--------|
| GET    | `/` | Service information and available endpoints | Service metadata | ✅ |
| GET    | `/health` | Health check for monitoring | `{ "status": "ok", "timestamp": "..." }` | ✅ |

### Authentication Routes

| Method | Endpoint | Description | Request Body | Response | Status |
|--------|----------|-------------|--------------|-----------|--------|
| POST   | `/auth/login` | User login with credentials | `{ email, password }` | `{ accessToken, user }` + httpOnly cookie | ✅ |
| POST   | `/auth/refresh` | Refresh access token | None (uses httpOnly cookie) | `{ accessToken }` | ✅ |
| POST   | `/auth/logout` | Logout and invalidate session | None | `{ message: "Logged out" }` | ✅ |

### User Management Routes

| Method | Endpoint | Description | Request Body | Response | Status |
|--------|----------|-------------|--------------|-----------|--------|
| POST   | `/users/register` | Register new user | `{ email, password, firstName?, lastName?, role? }` | `{ user, accessToken }` | ✅ |
| GET    | `/users/:id` | Get user profile by ID | None | `{ user }` | ✅ |
| PUT    | `/users/:id` | Update user profile | `{ firstName?, lastName?, profilePicture?, metadata? }` | `{ user }` | ✅ |
| DELETE | `/users/:id` | Soft delete user account | None | `{ message: "User deleted" }` | ✅ |
| GET    | `/users` | List users (paginated) | Query: `?page=1&limit=10&role=STUDENT` | `{ users: [...], pagination }` | ✅ |

### Example API Usage

#### User Registration
```bash
curl -X POST http://localhost:4000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  }'
```

#### Secure Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "SecurePassword123!"}' \
  -c cookies.txt
```

#### Access User Profile (with token)
```bash
curl -X GET http://localhost:4000/users/12345 \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Refresh Token (using session)
```bash
curl -X POST http://localhost:4000/auth/refresh \
  -b cookies.txt
```

#### List Users with Pagination
```bash
curl -X GET "http://localhost:4000/users?page=1&limit=5&role=STUDENT" \
  -H "Authorization: Bearer <access_token>"
```

## 🔄 Event-Driven Architecture

### **Published Events**

The User Service publishes the following events to RabbitMQ for consumption by other services:

| Event Type | Trigger | Payload | Consumer Services |
|------------|---------|---------|-------------------|
| `user.registered` | New user registration | `{ userId, email, role, firstName, lastName, timestamp }` | Analytics, Notification |
| `user.profile_updated` | Profile information changes | `{ userId, changes: { firstName?, lastName?, profilePicture?, metadata? }, timestamp }` | Analytics, Cache |
| `user.deactivated` | User account deactivation | `{ userId, email, role, deactivatedBy, timestamp }` | Analytics, Cleanup |
| `user.reactivated` | User account reactivation | `{ userId, email, role, reactivatedBy, timestamp }` | Analytics, Notification |
| `user.role_changed` | Role assignment changes | `{ userId, oldRole, newRole, changedBy, timestamp }` | Analytics, Permission |

### **Event Configuration**

- **Exchange**: `user_events` (topic exchange)
- **Routing Keys**: 
  - `user.registered`
  - `user.profile_updated`  
  - `user.deactivated`
  - `user.reactivated`
  - `user.role_changed`
- **Message Durability**: Persistent messages for reliability
- **Error Handling**: Service continues operation even if RabbitMQ is unavailable
- **Development Mode**: Events logged to console when RabbitMQ is not connected

### **Event Integration Testing**

```bash
# Test user registration with event publishing
npm test tests/integration/user.service.integration.test.ts

# Verify event publishing for all user operations
npm test -- --testNamePattern="should publish.*event"
```

## Token Workflow (PASETO V4)

### **Public Key Cryptography Architecture**
```
UserService (Private Key)    Other Services (Public Key)
        │                           │
        ├─► Sign Tokens             ├─► Verify Tokens
        ├─► Generate Access         ├─► Validate Signatures  
        └─► Generate Refresh        └─► Extract User Info
```

### **Token Specifications**
- **Access Token**: 15 minutes, Ed25519 signed, stateless, sent to client
- **Refresh Token**: 7 days, stored in database only, automatic rotation
- **Session Management**: httpOnly cookies with SameSite=Strict protection
- **Algorithm**: PASETO V4 with Ed25519 public key cryptography
- **Claims**: `iss`, `aud`, `iat`, `exp`, `userId`, custom payload

### **Security Benefits**
- **XSS Protection**: Refresh tokens never exposed to client JavaScript
- **CSRF Protection**: SameSite=Strict cookie policy prevents cross-site attacks
- **Token Rotation**: New refresh token generated on each use
- **Distributed Verification**: Other services verify tokens using public key
- **Session Security**: Clean logout with token invalidation
- **No Shared Secrets**: Public key distribution without compromise

## Why PASETO over JWT?

We chose **PASETO (Platform-Agnostic Security Tokens)** over JWT for several critical security and usability reasons:

### **🔒 Security Advantages**

| Issue | JWT Problem | PASETO Solution |
|-------|-------------|-----------------|
| **Algorithm Confusion** | `"alg": "none"` attacks, mixing symmetric/asymmetric | Fixed algorithm per version (V4 = Ed25519) |
| **Weak Algorithms** | HS256, RS256 vulnerable to attacks | Modern Ed25519 elliptic curve cryptography |
| **Implementation Bugs** | Library vulnerabilities, key confusion | Simpler, more secure implementation |
| **Cryptographic Agility** | Dangerous algorithm negotiation | Version-locked cryptography |

### **🚀 Developer Experience**

| Aspect | JWT | PASETO |
|--------|-----|--------|
| **Setup Complexity** | Choose algorithm, configure library, handle edge cases | Generate keys, use version-specific functions |
| **Security by Default** | Easy to misconfigure (insecure defaults) | Secure by design, hard to misuse |
| **Key Management** | Multiple key types, complex rotation | Simple Ed25519 key pairs |
| **Verification** | Multi-step process with pitfalls | Single function call |

### **📚 Real-World Benefits**
- **No "alg=none" vulnerabilities**: PASETO has no insecure fallbacks
- **Immune to key confusion attacks**: Clear separation of public/private operations  
- **Future-proof**: Designed with lessons learned from JWT failures
- **Smaller attack surface**: Fewer configuration options = fewer ways to fail

### **🔧 Implementation Simplicity**
```typescript
// JWT - Multiple steps, easy to mess up
jwt.verify(token, publicKey, { algorithms: ['RS256'] }, callback);

// PASETO - Simple, secure by default
const payload = await V4.verify(token, publicKey);
```

**Bottom Line**: PASETO eliminates entire classes of security vulnerabilities that have plagued JWT implementations for years.

## Security Implementation

### **Authentication Flow**

```bash
# 1. User Registration
curl -X POST http://localhost:4000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  }'

# 2. Secure Login (returns access token + sets httpOnly cookie)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePassword123!"}' \
  -c cookies.txt

# 3. Access Protected Route (with access token)
curl -X GET http://localhost:4000/users/123 \
  -H "Authorization: Bearer <access_token>"

# 4. Refresh Access Token (using session cookie)
curl -X POST http://localhost:4000/auth/refresh \
  -b cookies.txt

# 5. Secure Logout (clears session + invalidates refresh token)
curl -X POST http://localhost:4000/auth/logout \
  -b cookies.txt
```

### **Security Features**

| Feature | Implementation | Benefit |
|---------|----------------|---------|
| **Password Hashing** | Argon2 with salt | Prevents rainbow table attacks |
| **Token Security** | PASETO V4 + Ed25519 | Modern cryptography, no algorithm confusion |
| **Session Management** | httpOnly + SameSite cookies | XSS/CSRF protection |
| **Token Rotation** | New refresh token on each use | Limits compromise window |
| **Input Validation** | Email format + password strength | Prevents malicious input |
| **Database Security** | Parameterized queries via Prisma | SQL injection protection |
| **Environment Isolation** | Docker containers + env vars | Secure deployment practices |

### **Testing the Implementation**

```powershell
# Test secure login flow
$response = Invoke-WebRequest -Uri "http://localhost:4000/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"TestPassword123!"}' -SessionVariable session

# Verify only access token returned (no refresh token)
$response.Content | ConvertFrom-Json | Select-Object accessToken

# Verify httpOnly cookie set
$response.Headers['Set-Cookie']

# Test token refresh using session
Invoke-WebRequest -Uri "http://localhost:4000/auth/refresh" -Method POST -WebSession $session

# Test logout invalidation
Invoke-WebRequest -Uri "http://localhost:4000/auth/logout" -Method POST -WebSession $session
```

## Contributing

1. Fork the repo
2. Use branches for features (`feature/auth`, `feature/crud`)
3. PR with proper descriptions
4. Ensure tests pass before merging

## Testing

Unit tests in `test/` folder using Jest

Run tests:

```bash
npm install
npm test
```

## Dependencies & Technologies

### **Runtime Dependencies**
- **Express 5.1.0**: Modern HTTP server framework
- **Prisma 6.16.2**: Type-safe database ORM with PostgreSQL
- **PASETO 3.1.4**: Secure token implementation with Ed25519
- **Argon2 0.44.0**: Advanced password hashing algorithm
- **amqplib 0.10.4**: RabbitMQ client for event-driven messaging
- **cookie-parser**: Secure httpOnly cookie handling
- **Node.js 18+**: JavaScript runtime with modern features

### **Development Dependencies**  
- **TypeScript 5.9.2**: Type safety and modern JavaScript
- **ts-node-dev**: Development hot reload
- **Docker & Docker Compose**: Containerization

## Environment Variables

| Variable              | Description                           | Example |
|-----------------------|---------------------------------------|---------|
| POSTGRES_USER         | Database user                         | `admin` |
| POSTGRES_PASSWORD     | Database password                     | `secure123` |
| POSTGRES_DB           | Database name                         | `userservice` |
| DATABASE_URL          | Postgres connection string            | `postgresql://...` |
| RABBITMQ_URL          | RabbitMQ connection string            | `amqp://admin:admin123@rabbitmq:5672` |
| PASETO_PRIVATE_KEY    | Ed25519 private key for signing       | `-----BEGIN PRIVATE KEY-----...` |
| PASETO_PUBLIC_KEY     | Ed25519 public key for verification   | `-----BEGIN PUBLIC KEY-----...` |
| PORT                  | Service port                          | `4000` |

## 🛣️ Development Roadmap

### **Phase 1: Core Foundation ✅ COMPLETED**
- [x] **Pure Microservices Architecture**: Database-per-service with isolated containers
- [x] **PASETO V4 Authentication**: Ed25519 cryptography with secure token management
- [x] **Complete User CRUD**: Registration, profile management, soft delete operations
- [x] **Advanced Security**: Argon2 hashing, httpOnly cookies, token rotation
- [x] **Production Deployment**: Docker Compose orchestration with optimized containers
- [x] **Comprehensive Testing**: 60+ tests with mock implementations for fast CI/CD

### **Phase 2: Gateway Integration ✅ COMPLETED**
- [x] **Gateway Service**: API gateway with authentication middleware
- [x] **Token Distribution**: Public key sharing for distributed verification
- [x] **Service Communication**: Clean separation between gateway and user service
- [x] **Container Networking**: Proper Docker networking and service discovery

### **Phase 3: Enhanced Security & Validation**
- [ ] **Input Validation**: Comprehensive request validation with Joi/Zod
- [ ] **Rate Limiting**: Per-endpoint and per-user rate limiting
- [ ] **CORS Configuration**: Proper cross-origin resource sharing setup
- [ ] **Security Headers**: Helmet.js integration for security headers
- [ ] **Account Security**: Lockout mechanisms and suspicious activity detection

### **Phase 4: Advanced Features**
- [ ] **Email Verification**: Account activation workflow
- [ ] **Password Reset**: Secure password reset with email tokens
- [ ] **Role-Based Permissions**: Fine-grained permission system
- [ ] **Audit Logging**: User action tracking and security monitoring
- [ ] **Profile Enhancement**: Additional user metadata and preferences

### **Phase 5: Production Optimization**
- [ ] **Performance Monitoring**: Application metrics and performance tracking
- [ ] **Database Optimization**: Connection pooling and query optimization
- [ ] **Caching Layer**: Redis integration for session and data caching
- [ ] **API Documentation**: OpenAPI/Swagger documentation generation
- [ ] **Load Testing**: Performance testing and bottleneck identification

### **Current Priority**: Phase 3 (Enhanced Security & Validation)
The foundation is solid with comprehensive authentication, user management, and testing infrastructure in place. The next focus is on production-grade security enhancements and input validation.

## Troubleshooting

### **Common Issues**

1. **Authentication Failures**
   - **Invalid email/password**: Check user exists via `GET /users`
   - **Token expired**: Use refresh endpoint or login again
   - **Missing session cookie**: Ensure cookies enabled in client

2. **PASETO Key Errors**
   - Run: `node scripts/generate-keys.js`
   - Copy keys to `.env` with proper PEM formatting
   - Verify private key matches public key

3. **Database Connection Issues**
   - Ensure PostgreSQL container is running: `docker ps`
   - Check `DATABASE_URL` format in `.env`
   - Run migrations: `npx prisma migrate deploy`

4. **Docker Build Failures**
   - Clean rebuild: `docker-compose down && docker-compose up --build`
   - Clear Docker cache: `docker system prune -f`
   - Check logs: `docker logs userservice`

5. **Cookie/Session Issues**
   - **No session cookie**: Check `Set-Cookie` header in login response
   - **Refresh fails**: Ensure httpOnly cookie sent with request
   - **CORS problems**: Configure proper CORS headers for cookies

### **Debugging Commands**

```bash
# Check service status
curl http://localhost:4000/health

# View container logs
docker logs userservice -f

# Check database connection
docker exec -it userservice-db psql -U admin -d userservice -c "\dt"

# Verify PASETO keys
node -e "console.log(process.env.PASETO_PUBLIC_KEY)"
```