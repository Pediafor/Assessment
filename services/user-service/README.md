# UserService - Pediafor

## Overview

UserService is a core microservice in the Pediafor Assessment Platform. It manages:

- User authentication and authorization
- Role management (STUDENT, TEACHER, ADMIN)
- CRUD operations for user profiles
- Token issuance and management using PASETO tokens
- Multi-service data ownership via user IDs

This service is fully containerized and interacts with the GatewayService and other downstream services in the platform.

## Architecture

```
[Client] --> [GatewayService] --> [UserService] --> [PostgreSQL DB]
                    |                   |
                    |<-- Access Token --|
```

- **Client**: Receives access and refresh tokens upon login.
- **GatewayService**: Validates incoming requests using access tokens.
- **UserService**: Issues PASETO access/refresh tokens, performs user CRUD, and manages roles.

### Token Workflow:
1. Login request → UserService
2. UserService generates access + refresh tokens
3. Access token validated by Gateway for every request
4. Refresh token stored in DB for token renewal

## Key Features

- **CRUD**: Create, read, update, delete users
- **Authentication**: Login with email + password using Argon2 hashing
- **Authorization**: Role-based access control (STUDENT, INSTRUCTOR, ADMIN)
- **Token Management**: PASETO V4 public/private key tokens
- **Profile Management**: Store metadata, profile picture, last login
- **Cross-Service Ownership**: userId as pseudo foreign key for downstream services
- **Secure Cryptography**: Ed25519 key pairs for distributed token verification

## Database Schema

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

## Current Implementation Status

### ✅ **Completed Features**
- PASETO V4 token system with Ed25519 cryptography
- Argon2 password hashing utilities  
- Prisma database client integration
- Basic authentication endpoints (login, refresh)
- Docker containerization with multi-stage builds
- Environment configuration for public/private keys
- API root endpoint with service information

### 🔄 **In Development**
- User registration endpoint
- Complete user CRUD operations
- Input validation and error handling
- Role-based access control

## Folder Structure

```
src/
├── app.ts                 # Express app with root route
├── server.ts              # HTTP server startup
├── prismaClient.ts        # Database client instance
├── routes/
│   ├── auth.routes.ts     # Login, refresh endpoints ✅
│   └── user.routes.ts     # CRUD operations (skeleton)
├── services/
│   └── auth.service.ts    # Token generation, DB operations ✅
├── utils/
│   ├── paseto.ts          # PASETO V4 implementation ✅
│   └── hash.ts            # Argon2 password hashing ✅
└── scripts/
    └── generate-keys.js   # Ed25519 key generation ✅
```

## Getting Started (Docker)

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (containerized)

### Setting up Environment Variables

1. **Copy the example file:**
```bash
cp user-service/.env.example user-service/.env
```

2. **Generate PASETO V4 key pairs:**
```bash
cd user-service
node scripts/generate-keys.js
```

3. **Edit `.env` with your own values:**
```env
# Database credentials
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=userservice
DATABASE_URL=postgresql://your_db_user:your_db_password@user-db:5432/userservice

# PASETO V4 Keys (generated from step 2)
PASETO_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_here
-----END PRIVATE KEY-----"

PASETO_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
your_public_key_here
-----END PUBLIC KEY-----"

# Service port
PORT=4000
```

**Important Security Notes:**
- Use the generated Ed25519 key pairs for production
- Private key is used only by UserService for signing tokens
- Public key can be shared with other services for verification
- Never commit `.env` file to version control

Start the development environment:

```bash
docker-compose up
```

- Automatically mounts source code
- Runs Prisma generate
- Starts TypeScript in watch mode
- Runs Node server

### Build & Run (Production)

```bash
docker-compose -f docker-compose.yml up --build -d
```

- Builds production-ready images with precompiled TypeScript and Prisma client.
- No volume mounts or watch processes; optimized for performance.

### Prisma Setup (Production)

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

## Development Setup

- **Hot reload**: Changes to `/user-service/src` are compiled automatically
- **Prisma migrations**:
  ```bash
  docker-compose exec user-service npx prisma migrate dev --name <migration_name>
  ```
- **Environment separation**:
  - Dev: `.env` in `/user-service`
  - Prod: Secrets managed via CI/CD or Docker secrets

## API Endpoints

### System Routes:

| Method | Endpoint | Description                    | Status |
|--------|----------|--------------------------------|--------|
| GET    | /        | Service info and available endpoints | ✅ |
| GET    | /health  | Health check                   | ✅ |

### Auth Routes:

| Method | Endpoint      | Description                               | Status |
|--------|---------------|-------------------------------------------|--------|
| POST   | /auth/login   | Login user with userId (temp), issue tokens | ✅ |
| POST   | /auth/refresh | Refresh access token using refresh token | ✅ |
| POST   | /auth/logout  | Invalidate refresh token                  | 🔄 |

### User Routes:

| Method | Endpoint    | Description    | Status |
|--------|-------------|----------------|--------|
| POST   | /users      | Create user    | 🔄 |
| GET    | /users/:id  | Get user by ID | 🔄 |
| PUT    | /users/:id  | Update user    | 🔄 |
| DELETE | /users/:id  | Delete user    | 🔄 |
| GET    | /users      | List users     | 🔄 |

**Legend:** ✅ = Implemented, 🔄 = In Development, ❌ = Not Started

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
- **Access Token**: 15 minutes, Ed25519 signed, stateless
- **Refresh Token**: 7 days, stored in database, rotation-based
- **Algorithm**: PASETO V4 with Ed25519 public key cryptography
- **Claims**: `iss`, `aud`, `iat`, `exp`, `userId`, custom payload

### **Security Benefits**
- **Distributed Verification**: Other services can verify tokens without UserService
- **Non-repudiation**: Only UserService can create authentic tokens
- **Key Rotation**: Public/private keys can be rotated independently
- **No Shared Secrets**: Public key can be safely distributed

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
- **Prisma 6.16.2**: Type-safe database ORM  
- **PASETO 3.1.4**: Secure token implementation
- **Argon2 0.44.0**: Advanced password hashing
- **Node.js 18+**: JavaScript runtime

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
| PASETO_PRIVATE_KEY    | Ed25519 private key for signing       | `-----BEGIN PRIVATE KEY-----...` |
| PASETO_PUBLIC_KEY     | Ed25519 public key for verification   | `-----BEGIN PUBLIC KEY-----...` |
| PORT                  | Service port                          | `4000` |

## Development Roadmap

### **Phase 1: Core Authentication (Current)**
- [x] PASETO V4 token system
- [x] Argon2 password hashing
- [x] Basic login/refresh endpoints
- [x] Docker containerization
- [ ] Complete user registration
- [ ] Email/password login validation

### **Phase 2: Security & Validation**
- [ ] PASETO middleware for route protection
- [ ] Input validation (Joi/Zod)
- [ ] Rate limiting and CORS
- [ ] Error handling middleware
- [ ] Account lockout mechanisms

### **Phase 3: User Management**
- [ ] Complete CRUD operations
- [ ] Role-based access control
- [ ] Profile management
- [ ] Password reset workflow
- [ ] Email verification

### **Phase 4: Production Readiness**
- [ ] Comprehensive testing suite
- [ ] Logging and monitoring
- [ ] Database connection pooling
- [ ] Health checks and metrics
- [ ] API documentation (OpenAPI)

## Troubleshooting

### **Common Issues**

1. **"Cannot GET /" Error**
   - Solution: Visit `http://localhost:4000/` for service info
   - Root route now provides API documentation

2. **PASETO Key Errors**
   - Run: `node scripts/generate-keys.js`
   - Copy keys to `.env` file with proper formatting

3. **Database Connection Issues**
   - Ensure PostgreSQL container is running
   - Check `DATABASE_URL` format in `.env`

4. **Docker Build Failures**
   - Run: `docker-compose down && docker-compose up --build`
   - Clear Docker cache if needed