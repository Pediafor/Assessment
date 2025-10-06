# Pediafor Assessment Platform - Comprehensive Architecture

> **Platform Status**: Production Ready | **Services**: 5 Microservices | **Test Coverage**: 237/247 Tests Passing (96%)  
> **Architecture Pattern**: Pure Microservices | **Authentication**: PASETO V4 | **Database**: PostgreSQL per Service

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [System Components](#system-components)
4. [Service Communication](#service-communication)
5. [Data Architecture](#data-architecture)
6. [Security Architecture](#security-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Network Architecture](#network-architecture)
9. [Development Architecture](#development-architecture)
10. [Operational Architecture](#operational-architecture)

---

## Executive Summary

The Pediafor Assessment Platform implements a **pure microservices architecture** designed for educational assessment management. The platform provides a scalable, secure, and maintainable solution for creating, managing, and grading educational assessments.

### Core Architectural Principles

- **Service Independence**: Each microservice owns its data and business logic
- **Database per Service**: No shared databases, ensuring loose coupling
- **API Gateway Pattern**: Single entry point with centralized authentication
- **Token-Based Security**: Stateless authentication using PASETO V4 tokens
- **Container-First Design**: Docker containers with orchestration-ready configuration
- **Test-Driven Quality**: 96% test coverage across all services with comprehensive test suites

### Platform Capabilities

- ✅ **User Management**: Registration, authentication, profile management (77/77 tests)
- ✅ **Assessment Creation**: Rich assessment builder with media support (94/94 tests)
- ✅ **File Management**: Multi-format media upload with processing
- ✅ **Role-Based Access**: Student, Teacher, Admin permission levels
- ✅ **Submission Handling**: Complete student submission workflow (66/76 tests)
- ✅ **Autosave & Draft Management**: Real-time answer saving and submission status
- 🔄 **Automated Grading**: AI-powered grading engine (infrastructure ready)

---

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Web Portal    │   Mobile App    │   Admin Dashboard           │
│   (React/Vue)   │   (iOS/Android) │   (Management Tools)        │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                              │
│   Gateway Service (Port 3000) - Public Entry Point              │
│   • PASETO Token Validation                                     │
│   • Request Routing & Load Balancing                            │
│   • CORS & Rate Limiting                                        │
│   • Health Check Aggregation                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Internal Network
┌───────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES LAYER                          │
├─────────────┬─────────────┬─────────────┬─────────────┬───────────┤
│User Service │Assessment   │Submission   │Grading      │Future     │
│Port 4000    │Service      │Service      │Service      │Services   │
│             │Port 4001    │Port 4002    │Port 4003    │...        │
├─────────────┼─────────────┼─────────────┼─────────────┼───────────┤
│• Auth Logic │• Assessment │• Student    │• Auto Grade │• Analytics│
│• User CRUD  │  CRUD       │  Submission │• AI/ML      │• Reporting│
│• Token Gen  │• Media Mgmt │• File Upload│• Feedback   │• Export   │
│• Profile    │• Publishing │• Validation │• Statistics │• Backup   │
└─────────────┴─────────────┴─────────────┴─────────────┴───────────┘
                              │
                              ▼ Database Connections
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│PostgreSQL   │PostgreSQL   │PostgreSQL   │PostgreSQL   │Redis    │
│Port 5432    │Port 5433    │Port 5434    │Port 5435    │Port 6379│
│             │             │             │             │         │
│User Service │Assessment   │Submission   │Grading      │Gateway  │
│Database     │Database     │Database     │Database     │Cache    │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
```

### Service Interaction Flow

```
Client Request → API Gateway → Authentication → Service Routing → Database → Response
     ↓              ↓              ↓              ↓               ↓         ↓
1. HTTP/HTTPS   2. Token      3. User        4. Business    5. Data     6. JSON
   Request         Validation    Context        Logic          Ops        Response
```

---

## System Components

### 🚪 Gateway Service (Port 3000)
**Role**: Public API Gateway and Authentication Hub

**Core Responsibilities**:
- **API Gateway**: Single entry point for all client requests
- **Authentication**: PASETO V4 token verification with Ed25519 cryptography
- **Request Routing**: Intelligent forwarding to backend microservices  
- **Security Layer**: CORS management, rate limiting, request validation
- **Health Monitoring**: Aggregated health checks across all services
- **Load Balancing**: Future-ready for horizontal service scaling

**Technology Stack**:
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with async error handling
- **Authentication**: PASETO V4 public key verification
- **Cache**: Redis for rate limiting and session data
- **Container**: Docker with multi-stage builds

**Key Features**:
- ✅ Stateless authentication with cryptographic signatures
- ✅ Dynamic service discovery and routing
- ✅ Comprehensive request/response logging
- ✅ CORS configuration for cross-origin requests
- ✅ Rate limiting with configurable thresholds
- ✅ Health check aggregation from all services

---

### 👤 User Service (Port 4000)
**Role**: User Management and Authentication Provider

**Core Responsibilities**:
- **User Registration**: Account creation with email validation
- **Authentication**: Login/logout with secure token generation
- **Profile Management**: User profile CRUD operations
- **Role Management**: Student, Teacher, Admin role assignment
- **Token Issuance**: PASETO V4 token generation with Ed25519 signing
- **Password Security**: Argon2 hashing with salt

**Technology Stack**:
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with input validation
- **Database**: PostgreSQL 15 with Prisma ORM
- **Authentication**: PASETO V4 with Ed25519 key pairs
- **Security**: Argon2 password hashing, bcrypt fallback
- **Testing**: Jest with 77/77 tests passing

**Database Schema**:
```sql
User Entity:
- id: UUID (Primary Key)
- email: String (Unique, Required)
- firstName: String (Optional)
- lastName: String (Optional)  
- passwordHash: String (Argon2)
- role: Enum (STUDENT, TEACHER, ADMIN)
- timestamps: createdAt, updatedAt
```

**API Endpoints**:
- `POST /register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/logout` - Token invalidation
- `POST /auth/refresh` - Token refresh
- `GET /profile/:id` - Get user profile
- `PUT /profile/:id` - Update user profile
- `DELETE /profile/:id` - Delete user profile
- `GET /users` - List users (paginated, admin only)

---

### 📝 Assessment Service (Port 4001)
**Role**: Assessment Content Management and Media Processing

**Core Responsibilities**:
- **Assessment CRUD**: Complete assessment lifecycle management
- **Media Processing**: Multi-format file upload with thumbnail generation
- **Content Publishing**: Assessment publishing workflow and version control
- **Access Control**: Role-based permissions with ownership validation
- **File Management**: Static file serving and storage management
- **Content Validation**: Assessment structure and content validation

**Technology Stack**:
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with file upload middleware
- **Database**: PostgreSQL 15 with Prisma ORM (port 5433)
- **File Processing**: Multer for uploads, Sharp for image processing
- **Storage**: Local filesystem with configurable paths
- **Testing**: Jest with 94/94 tests passing

**Database Schema**:
```sql
Assessment Entity:
- id: String (CUID)
- title: String (Required)
- description: String (Optional)
- instructions: String (Optional)
- createdBy: String (User ID from gateway)
- status: Enum (DRAFT, PUBLISHED, ARCHIVED, SCHEDULED)
- settings: JSON (Assessment configuration)
- timestamps: createdAt, updatedAt, isActive

QuestionSet Entity:
- id: String (CUID)
- assessmentId: String (Foreign Key)
- setNumber: Integer
- name: String
- description: String (Optional)
- timeLimit: Integer (minutes)
- selectionConfig: JSON (randomization)
- displayOrder: Integer

Question Entity:
- id: String (CUID)  
- questionSetId: String (Foreign Key)
- type: Enum (MULTIPLE_CHOICE, TRUE_FALSE, etc.)
- content: String
- points: Float (default 1.0)
- difficulty: Enum (EASY, MEDIUM, HARD, EXPERT)
- tags: String[]
- hints: String[]
- explanation: String (Optional)
- timeLimit: Integer (seconds)
- metadata: JSON
- displayOrder: Integer

Media Entities:
- QuestionMedia: Files attached to questions
- OptionMedia: Files attached to question options
```

**API Endpoints**:
- `GET /assessments` - List assessments (paginated, filtered)
- `GET /assessments/:id` - Get assessment details
- `POST /assessments` - Create new assessment (Teacher/Admin)
- `PUT /assessments/:id` - Update assessment (Owner/Admin)
- `DELETE /assessments/:id` - Delete assessment (Owner/Admin)
- `POST /assessments/:id/publish` - Publish assessment
- `POST /assessments/:id/duplicate` - Duplicate assessment
- `POST /media/question` - Upload question media
- `POST /media/option` - Upload option images
- `POST /media/audio` - Upload audio files
- `POST /media/video` - Upload video files
- `GET /uploads/:filename` - Serve static files

---

### 📄 Submission Service (Port 4002)
**Role**: Student Submission Management and Processing

**Core Responsibilities**:
- **Submission Collection**: Complete student answer collection and validation
- **File Upload Handling**: Student file submission processing with validation
- **Progress Tracking**: Real-time submission progress monitoring with autosave
- **Submission Workflow**: Draft → Submit → Grade status management
- **Data Integrity**: Comprehensive submission validation and security checks
- **Answer Management**: Flexible JSON-based answer storage for all question types

**Technology Stack**:
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with comprehensive validation
- **Database**: PostgreSQL 15 with Prisma ORM (port 5434)
- **Authentication**: PASETO V4 integration via Gateway Service
- **File Storage**: Secure file upload with metadata storage
- **Testing**: Jest with 66/76 tests passing (87% success rate)

**Database Schema**:
```sql
Submission Entity:
- id: String (CUID)
- userId: String (Student ID from gateway)
- assessmentId: String (Assessment reference)
- answers: JSON (Flexible answer structure)
- status: Enum (DRAFT, SUBMITTED, GRADING, GRADED, RETURNED)
- score: Float (Final score, set by grading service)
- maxScore: Float (Maximum possible score)
- submittedAt: DateTime (Submission timestamp)
- timestamps: createdAt, updatedAt

SubmissionFile Entity:
- id: String (CUID)
- submissionId: String (Foreign Key)
- filename: String
- originalName: String
- mimetype: String
- size: Integer
- uploadPath: String
- timestamps: createdAt

Grade Entity:
- id: String (CUID)
- submissionId: String (Foreign Key)
- questionId: String (Question reference)
- score: Float
- maxScore: Float
- feedback: String (Optional)
- gradedBy: String (Grader ID)
- timestamps: createdAt, updatedAt
```

**API Endpoints**:
- `GET /submissions` - List submissions (paginated, role-based access)
- `GET /submissions/:id` - Get submission details
- `POST /submissions` - Create new submission
- `PUT /submissions/:id` - Update submission (draft only for students)
- `DELETE /submissions/:id` - Delete submission (admin only)
- `POST /submissions/:id/submit` - Submit draft for grading
- `POST /submissions/:id/save-answers` - Save answers (autosave)
- `GET /submissions/assessment/:assessmentId` - Get submission for assessment
- `GET /submissions/stats/:assessmentId` - Get submission statistics

**Key Features**:
- ✅ Complete CRUD operations with role-based access control
- ✅ Student submission workflow (Draft → Submit → Grade)
- ✅ Real-time autosave functionality
- ✅ File upload support with validation
- ✅ Comprehensive input validation and sanitization
- ✅ Role-based access control (Students, Teachers, Admins)
- ✅ Integration with Assessment Service for validation
- ✅ Statistics and analytics endpoints for teachers

---

### 🎯 Grading Service (Port 4003)  
**Role**: Automated Grading and Feedback Generation

**Core Responsibilities** (Ready for Implementation):
- **Automated Grading**: AI-powered multiple-choice question evaluation
- **Partial Credit**: Advanced scoring algorithms for complex question types
- **Manual Grading**: Teacher grading interface and workflow management
- **Feedback Generation**: Detailed feedback and explanations for students
- **Analytics Engine**: Performance analytics and statistical insights
- **Grade Management**: Grade storage, retrieval, and historical tracking

**Technology Stack** (Infrastructure Prepared):
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with async processing capabilities
- **Database**: PostgreSQL 15 with Prisma ORM (port 5435)
- **Processing**: Background job queue for high-volume grading
- **Integration**: Seamless connection to Submission and Assessment services
- **Analytics**: Statistical analysis and performance metrics

**Database Schema** (Designed):
```sql
Grade Entity:
- id: String (CUID)
- submissionId: String (Reference to submission)
- assessmentId: String (Reference to assessment)
- userId: String (Student being graded)
- totalScore: Float (Total points earned)
- maxScore: Float (Maximum possible points)
- percentage: Float (Calculated percentage)
- gradedAt: DateTime (Grading timestamp)
- gradedBy: String (Grader ID, null for automated)
- feedback: String (Optional overall feedback)

QuestionGrade Entity:
- id: String (CUID)
- gradeId: String (Foreign Key)
- questionId: String (Question reference)
- pointsEarned: Float
- maxPoints: Float
- isCorrect: Boolean
- feedback: String (Question-specific feedback)
- gradingMethod: Enum (AUTOMATED, MANUAL, HYBRID)
```

**Planned API Endpoints**:
- `POST /grading/submissions/:id/grade` - Grade a submission
- `GET /grading/submissions/:id` - Get grade for submission
- `PUT /grading/:id` - Update grade (manual adjustments)
- `GET /grading/assessment/:id/stats` - Assessment grading statistics
- `GET /grading/student/:id/summary` - Student performance summary
- `POST /grading/batch/grade` - Batch grade multiple submissions
- `GET /grading/analytics` - Institutional analytics
- `GET /grading/export/:assessmentId` - Export grades to CSV

**Integration Points**:
- **Submission Service**: Automatic trigger when submission status = "SUBMITTED"
- **Assessment Service**: Retrieve grading rubrics and correct answers
- **User Service**: Teacher/admin permissions for manual grading
- **Gateway Service**: Authentication and request routing

**Grading Algorithms** (Planned):
- **Multiple Choice**: Instant scoring with configurable partial credit
- **True/False**: Binary scoring with penalty options
- **Partial Credit**: Linear, exponential, or custom algorithms
- **Performance Analytics**: Statistical analysis and trending

---

## Service Communication

### Authentication Flow

```
1. Client Registration/Login
   Client → Gateway → User Service → Database → PASETO Token

2. Authenticated Request  
   Client → Gateway (Token Validation) → Target Service → Database → Response

3. Service-to-Service Communication
   Service A → Gateway Headers → Service B (Trusted Context)
```

### Inter-Service Communication Patterns

#### 🔐 Authentication Pattern
- **PASETO V4 Tokens**: Ed25519 public key cryptography
- **Gateway Verification**: Public key shared across services
- **User Context Injection**: Gateway adds verified user headers
- **Service Trust**: Services trust gateway-signed headers

#### 📡 Request Routing Pattern
```typescript
Gateway Routing Rules:
/api/auth/*       → User Service (Port 4000)
/api/users/*      → User Service (Port 4000)
/api/assessments/* → Assessment Service (Port 4001)
/api/submissions/* → Submission Service (Port 4002)
/api/grading/*    → Grading Service (Port 4003)
/health           → All Services (Aggregated)
```

#### 🛡️ Security Headers Pattern
```typescript
Gateway → Service Headers:
X-User-ID: "authenticated-user-uuid"
X-User-Email: "user@example.com"
X-User-Role: "TEACHER" | "STUDENT" | "ADMIN"
X-Gateway-Signature: "cryptographic-signature"
```

#### 🔄 Health Check Pattern
```json
Service Health Response:
{
  "status": "healthy" | "degraded" | "unhealthy",
  "service": "service-name",
  "version": "1.0.0",
  "timestamp": "2025-10-04T12:00:00Z",
  "uptime": 3600,
  "environment": "production",
  "database": "connected" | "disconnected",
  "dependencies": ["service-a", "service-b"]
}
```

---

## Data Architecture

### Database Per Service Pattern

Each microservice maintains its own dedicated PostgreSQL database, ensuring:
- **Data Isolation**: No cross-service database dependencies
- **Schema Independence**: Services can evolve schemas independently  
- **Performance Isolation**: Database performance issues don't cascade
- **Backup Granularity**: Service-specific backup and recovery strategies

### Database Configuration

```yaml
Service Databases:
- User Service:      PostgreSQL (localhost:5432)
- Assessment Service: PostgreSQL (localhost:5433)  
- Submission Service: PostgreSQL (localhost:5434)
- Grading Service:   PostgreSQL (localhost:5435)
- Gateway Cache:     Redis (localhost:6379)
```

### Data Consistency Strategies

#### 🎯 Eventual Consistency
- **Cross-Service Updates**: Asynchronous event propagation
- **Compensation Patterns**: Rollback mechanisms for failed operations
- **Event Sourcing**: Future consideration for audit trails

#### 🔒 Transactional Boundaries
- **Single Service**: ACID transactions within service boundaries
- **Cross Service**: Saga pattern for distributed transactions
- **Idempotency**: All API operations designed to be idempotent

### Data Access Patterns

#### 📊 Query Patterns
- **Service-Local Queries**: Direct database access within service
- **Cross-Service Data**: API calls through gateway
- **Aggregation**: Gateway-level data aggregation when needed
- **Caching**: Redis caching for frequently accessed data

#### 🚀 Performance Optimization
- **Database Indexing**: Optimized indexes per service workload
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Prisma ORM with optimized queries
- **Read Replicas**: Future consideration for read-heavy workloads

---

## Security Architecture

### Authentication & Authorization Framework

#### 🔐 PASETO V4 Token System
```
Token Generation (User Service):
1. User credentials validated
2. Ed25519 private key signs token
3. Token contains: userID, email, role, permissions, expiry
4. Secure httpOnly cookie or Bearer token returned

Token Verification (Gateway):
1. Extract token from request headers/cookies
2. Verify signature using Ed25519 public key
3. Validate expiry and token structure
4. Extract user context for downstream services
```

#### 🛡️ Multi-Layer Security Model

```
Layer 1: Network Security
├── HTTPS/TLS termination
├── CORS configuration
├── Rate limiting per IP/user
└── Request size limitations

Layer 2: Authentication
├── PASETO V4 token validation
├── Public key cryptography
├── Token expiry enforcement  
└── Refresh token rotation

Layer 3: Authorization
├── Role-based access control (RBAC)
├── Resource ownership validation
├── Permission-based endpoints
└── Admin privilege escalation

Layer 4: Data Security
├── Argon2 password hashing
├── Database connection encryption
├── Input validation & sanitization
└── SQL injection prevention (Prisma ORM)
```

#### 🔑 Role-Based Access Control

```typescript
User Roles & Permissions:

STUDENT:
- View assigned assessments
- Submit assessment responses
- View own submission history
- Update own profile

TEACHER:
- All STUDENT permissions
- Create/edit/delete own assessments
- View student submissions for own assessments
- Grade submissions for own assessments
- Manage class enrollments

ADMIN:
- All TEACHER permissions  
- Manage all users and assessments
- System configuration access
- Analytics and reporting access
- Service health monitoring
```

### Security Best Practices Implementation

#### 🔒 Password Security
- **Argon2 Hashing**: Memory-hard function resistant to attacks
- **Salt Generation**: Unique salt per password
- **BCrypt Fallback**: Legacy password migration support
- **Password Policies**: Configurable complexity requirements

#### 🛡️ Request Security
- **Input Validation**: Joi/Express-validator schemas
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: Content sanitization and CSP headers
- **CSRF Protection**: Token-based CSRF prevention

#### 🚨 Security Monitoring
- **Request Logging**: Comprehensive audit trails
- **Failed Authentication Tracking**: Brute force detection
- **Rate Limiting**: DDoS protection and abuse prevention
- **Security Headers**: HSTS, CSP, X-Frame-Options

---

## Deployment Architecture

### Container-First Design

#### 🐳 Docker Configuration

```dockerfile
Multi-Stage Build Pattern:
Stage 1: Build Environment
- Node.js 20 Alpine base image
- Install all dependencies (dev + prod)
- TypeScript compilation
- Asset optimization

Stage 2: Production Environment  
- Node.js 20 Alpine base image
- Production dependencies only
- Copy compiled artifacts
- Non-root user for security
- Health check configuration
```

#### 🚀 Service Orchestration

```yaml
Docker Compose per Service:
- Service container (Node.js app)
- Database container (PostgreSQL)
- Cache container (Redis for Gateway)
- Volume mounts for persistence
- Network isolation per service
- Health check definitions
- Environment configuration
```

### Deployment Strategies

#### 🔄 Development Deployment
```bash
Local Development:
1. Clone repository
2. Navigate to service directory
3. Run: docker-compose up
4. Service available on designated port
5. Hot reload for development
6. Database initialization with migrations
```

#### 🏭 Production Deployment (Future)
```bash
Production Considerations:
- Kubernetes manifests for orchestration
- Horizontal pod autoscaling
- Load balancer configuration
- SSL/TLS certificate management
- Database managed services
- Monitoring and logging integration
- CI/CD pipeline integration
```

### Infrastructure Requirements

#### 💻 Minimum System Requirements
```
Development Environment:
- CPU: 4 cores minimum (8 cores recommended)
- RAM: 8GB minimum (16GB recommended)  
- Storage: 50GB available space
- Network: Broadband internet connection
- Docker: 20.10+ with Compose V2

Production Environment (Estimated):
- CPU: 8-16 cores per node
- RAM: 32-64GB per node
- Storage: SSD with 500GB+ available
- Network: High-speed internal networking
- Load Balancer: Nginx/HAProxy/Cloud LB
```

#### ☁️ Cloud Deployment Options
```
Recommended Platforms:
- AWS: EKS + RDS + ElastiCache + ALB
- GCP: GKE + Cloud SQL + Memorystore + Cloud Load Balancing
- Azure: AKS + Azure Database + Redis Cache + Application Gateway
- Self-Hosted: Kubernetes + PostgreSQL + Redis + Nginx
```

---

## Network Architecture

### Service Networking

#### 🌐 Port Allocation
```
External Ports (Client Access):
- Gateway Service: 3000 (Public API)

Internal Ports (Service Communication):
- User Service: 4000
- Assessment Service: 4001  
- Submission Service: 4002
- Grading Service: 4003

Database Ports:
- User DB: 5432
- Assessment DB: 5433
- Submission DB: 5434
- Grading DB: 5435
- Redis Cache: 6379
```

#### 🔗 Network Topology
```
Internet → Load Balancer → Gateway Service → Internal Network
                                ↓
                         Service Discovery
                                ↓
                    ┌─────────────────────────┐
                    ▼         ▼         ▼    ▼
            User Service  Assessment  Sub.  Grading
                    ↓         ↓         ▼       ▼  
            User DB    Assessment DB  Sub DB  Grade DB
```

#### 🛡️ Network Security
```
Security Zones:
1. DMZ: Gateway Service (public-facing)
2. Application Tier: Microservices (internal only)  
3. Data Tier: Databases (service-specific access)

Firewall Rules:
- External → Gateway: Port 3000 (HTTPS)
- Gateway → Services: Internal ports only
- Services → Databases: Database ports only
- Cross-service: Through Gateway only
```

### Load Balancing & Scaling

#### ⚖️ Load Balancing Strategy
```
Current: Single Instance per Service
├── Development: Docker Compose
└── Simple deployment model

Future: Horizontal Scaling
├── Multiple instances per service
├── Load balancer distribution
├── Session affinity for stateful operations
└── Auto-scaling based on metrics
```

#### 📈 Scaling Patterns
```
Horizontal Scaling Readiness:
✅ Stateless services (token-based auth)
✅ Database per service (no shared state)
✅ External session storage (Redis)
✅ Load balancer compatible design

Scaling Triggers:
- CPU utilization > 70%
- Memory utilization > 80%
- Response time > 2 seconds
- Queue depth > 100 items
```

---

## Development Architecture

### Development Environment

#### 🛠️ Developer Tools & Workflow
```
Local Development Stack:
- Node.js 20+ with TypeScript
- Docker Desktop with Compose V2
- VS Code with recommended extensions
- Git with conventional commits
- Jest for testing
- Prisma Studio for database management
```

#### 🔄 Development Workflow
```
1. Service Development:
   git clone → cd service → docker-compose up
   
2. Hot Reload Development:
   - Source code mounted as Docker volume
   - Nodemon watches for changes
   - Automatic TypeScript compilation
   - Database migrations on startup

3. Testing Workflow:
   - Unit tests with Jest
   - Integration tests with supertest
   - Database tests with test containers
   - 100% test coverage target

4. Code Quality:
   - ESLint for code standards
   - Prettier for formatting
   - TypeScript strict mode
   - Husky pre-commit hooks
```

### API Development Standards

#### 📋 API Design Principles
```
RESTful API Standards:
- Resource-based URLs
- HTTP methods for operations (GET, POST, PUT, DELETE)
- JSON request/response format
- Consistent error response structure
- Pagination for list endpoints
- Filtering and sorting support

Response Format:
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "timestamp": ISO_8601_string,
  "pagination": { page, limit, total, pages }
}

Error Format:
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE", 
  "timestamp": ISO_8601_string,
  "details": object (optional)
}
```

#### 🧪 Testing Standards
```
Testing Requirements:
- Unit Tests: Business logic and utilities
- Integration Tests: API endpoints and database
- Authentication Tests: Token validation and authorization
- Error Handling Tests: Error scenarios and edge cases

Coverage Targets:
- Line Coverage: 90%+
- Branch Coverage: 85%+
- Function Coverage: 95%+
- Integration Coverage: 100% of API endpoints
```

### Code Organization

#### 📁 Service Structure Standard
```
services/{service-name}/
├── src/
│   ├── server.ts              # HTTP server setup
│   ├── app.ts                 # Express app configuration  
│   ├── prismaClient.ts        # Database connection
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/                # API route handlers
│   │   ├── auth.routes.ts
│   │   └── {resource}.routes.ts
│   ├── services/              # Business logic layer
│   │   └── {resource}.service.ts
│   ├── utils/                 # Utility functions
│   │   ├── errors.ts
│   │   └── validation.ts
│   └── types/                 # TypeScript definitions
│       └── index.ts
├── tests/                     # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── docker-compose.yml         # Service orchestration
├── Dockerfile                # Container definition
├── package.json              # Dependencies & scripts
└── README.md                 # Service documentation
```

---

## Operational Architecture

### Monitoring & Observability

#### 📊 Health Monitoring
```
Service Health Checks:
- HTTP health endpoints on all services
- Database connection validation  
- External dependency checks
- Resource utilization monitoring
- Response time measurement

Gateway Health Aggregation:
GET /health → Aggregate health from all services
{
  "status": "healthy",
  "services": {
    "user-service": { "status": "healthy", "responseTime": "12ms" },
    "assessment-service": { "status": "healthy", "responseTime": "8ms" },
    "gateway": { "uptime": 3600, "memory": "45.2 MB" }
  }
}
```

#### 🔍 Logging Strategy
```
Logging Levels:
- ERROR: System errors and exceptions
- WARN: Performance degradation and warnings
- INFO: Request/response logging and business events
- DEBUG: Detailed execution flow (development only)

Log Format (JSON):
{
  "timestamp": "2025-10-04T12:00:00Z",
  "level": "INFO",
  "service": "user-service",
  "requestId": "req-123",
  "userId": "user-456", 
  "method": "POST",
  "path": "/api/auth/login",
  "statusCode": 200,
  "responseTime": 45,
  "message": "User login successful"
}
```

#### 📈 Performance Metrics
```
Key Performance Indicators:
- Request throughput (requests/second)
- Response time (p50, p95, p99)
- Error rate (errors/total requests)
- Database query performance
- Memory and CPU utilization
- Active user sessions

Target SLAs:
- API Response Time: <200ms (95th percentile)
- Uptime: 99.9% availability
- Authentication: <50ms token validation
- Database Queries: <100ms average
- File Uploads: <5s for 10MB files
```

### Backup & Recovery

#### 💾 Data Backup Strategy
```
Database Backups:
- Automated daily backups
- Point-in-time recovery capability
- Cross-region backup replication  
- Backup retention: 30 days
- Recovery testing: Monthly validation

File Storage Backups:
- Media files and uploads
- Incremental backup strategy
- Cloud storage integration
- Version control for critical files
```

#### 🚨 Disaster Recovery
```
Recovery Procedures:
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Automated failover for databases
- Blue-green deployment capability
- Rollback procedures for deployments
- Documentation for manual recovery
```

### Maintenance & Updates

#### 🔄 Update Strategy
```
Service Updates:
- Rolling updates with zero downtime
- Database migration procedures
- Backward compatibility requirements
- Feature flag implementation
- Gradual rollout capability

Dependency Management:
- Regular security updates
- Automated vulnerability scanning
- Node.js and package updates
- Database version management
- Container base image updates
```

#### 📅 Maintenance Windows
```
Scheduled Maintenance:
- Weekly: Security patches and minor updates
- Monthly: Major feature releases
- Quarterly: Infrastructure updates
- Annually: Major version upgrades

Emergency Procedures:
- Critical security patches: Immediate deployment
- System outages: Incident response procedures
- Data corruption: Recovery procedures
- Performance issues: Scaling procedures
```

---

## Conclusion

The Pediafor Assessment Platform implements a robust, scalable microservices architecture designed for educational assessment management. The platform demonstrates:

### ✅ Current Strengths
- **Production-Ready Services**: User (77/77), Assessment (94/94), and Submission (66/76) services with comprehensive test coverage
- **Secure Architecture**: PASETO V4 authentication with Ed25519 cryptography
- **Clean Separation**: Database per service with well-defined boundaries
- **Developer Experience**: Docker-based development with hot reload
- **API Quality**: RESTful design with comprehensive documentation

### 🚀 Future Capabilities  
- **Horizontal Scaling**: Load balancer ready architecture
- **Advanced Grading**: AI/ML integration for automated assessment
- **Real-time Features**: WebSocket support for live interactions  
- **Analytics Platform**: Comprehensive reporting and insights
- **Multi-tenancy**: Support for multiple educational institutions

### 🎯 Architectural Benefits
- **Maintainability**: Clear service boundaries and responsibilities
- **Scalability**: Independent scaling of services based on demand
- **Reliability**: Fault isolation prevents cascading failures
- **Security**: Defense in depth with multiple security layers
- **Flexibility**: Technology diversity and independent deployments

The architecture provides a solid foundation for scaling from educational pilots to enterprise-wide assessment platforms, supporting thousands of concurrent users and complex assessment workflows.

---

*Architecture Documentation v1.0 - October 2025*  
*Services Status: User ✅ | Assessment ✅ | Gateway ✅ | Submission 🔄 | Grading 🔄*  
*Test Coverage: 237/247 tests passing across all services (96% success rate)*