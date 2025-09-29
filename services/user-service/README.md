# UserService - Pediafor

## Overview

UserService is a core microservice in the Pediafor Assessment Platform. It manages:

- **Secure Authentication**: PASETO V4 tokens with Ed25519 cryptography
- **User Registration**: Email validation, password hashing, role assignment
- **Role Management**: STUDENT, TEACHER, ADMIN with permission-based access
- **User Profile CRUD**: Complete user lifecycle management
- **Session Security**: httpOnly cookies, refresh token rotation, XSS protection
- **Multi-service Integration**: Distributed token verification across services

This service implements security-first design patterns and is fully containerized for production deployment.

## Architecture

```
[Client] --> [GatewayService] --> [UserService] --> [PostgreSQL DB]
     |              |                   |                |
     |<-- Access ---|                   |<-- Session --->|
     |    Token     |                   |    Cookie      |
     |              |                   |                |
     [httpOnly Cookie for Refresh]      [Token Rotation] |
```

- **Client**: Receives only access tokens, session managed via httpOnly cookies
- **GatewayService**: Validates requests using PASETO public key verification  
- **UserService**: Issues secure tokens, manages sessions, performs user operations
- **Database**: Stores refresh tokens, user profiles, and authentication state

### Secure Token Workflow:
1. **Login**: Email/password → Access token + httpOnly session cookie
2. **API Requests**: Access token in Authorization header for validation
3. **Token Refresh**: Automatic via session cookie (client never sees refresh token)
4. **Logout**: Clears session cookie + invalidates refresh token in DB

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
- **Authentication System**: Secure login with email/password validation
- **User Registration**: Complete registration with role assignment and validation
- **PASETO V4 Tokens**: Ed25519 cryptography with 15min access/7day refresh tokens
- **Security Implementation**: httpOnly cookies, token rotation, XSS/CSRF protection
- **Password Security**: Argon2 hashing with secure verification
- **User CRUD Operations**: Create, read, update, delete, and list users
- **Database Integration**: Prisma ORM with PostgreSQL, proper error handling
- **Docker Production**: Multi-stage builds, optimized containers
- **Session Management**: Secure logout, token invalidation

### 🔄 **Next Phase**
- PASETO middleware for route protection
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting and security headers

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
| POST   | /auth/login   | Login with email/password, returns access token + session | ✅ |
| POST   | /auth/refresh | Refresh access token using httpOnly session cookie | ✅ |
| POST   | /auth/logout  | Invalidate session and clear refresh token | ✅ |

### User Routes:

| Method | Endpoint        | Description                    | Status |
|--------|-----------------|--------------------------------|--------|
| POST   | /users/register | Register new user with validation | ✅ |
| GET    | /users/:id      | Get user profile by ID         | ✅ |
| PUT    | /users/:id      | Update user profile            | ✅ |
| DELETE | /users/:id      | Delete user account            | ✅ |
| GET    | /users          | List all users (paginated)     | ✅ |

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
| PASETO_PRIVATE_KEY    | Ed25519 private key for signing       | `-----BEGIN PRIVATE KEY-----...` |
| PASETO_PUBLIC_KEY     | Ed25519 public key for verification   | `-----BEGIN PUBLIC KEY-----...` |
| PORT                  | Service port                          | `4000` |

## Development Roadmap

### **Phase 1: Core Authentication ✅ COMPLETED**
- [x] PASETO V4 token system with Ed25519 cryptography
- [x] Argon2 password hashing and verification
- [x] Secure authentication endpoints (login/refresh/logout)
- [x] User registration with email validation and role assignment
- [x] Complete user CRUD operations with database integration
- [x] httpOnly cookie session management
- [x] Refresh token rotation and security
- [x] Docker production containerization

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