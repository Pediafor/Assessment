# Assessment Service - Pediafor Assessment Platform

## Overview

The Assessment Service is a core microservice in the Pediafor Assessment Platform, implementing comprehensive assessment creation and management capabilities. Built as part of a pure microservices architecture, it provides:

- **📝 Assessment Management**: Complete CRUD operations for assessments, question sets, and questions
- **📁 File Upload System**: Multi-format media support with automatic image processing and thumbnails
- **🔒 Role-Based Access Control**: Granular permissions for TEACHER, ADMIN, and STUDENT roles
- **🏛️ Database-per-Service**: Dedicated PostgreSQL database with Prisma ORM
- **🐳 Production Ready**: Containerized with Docker Compose orchestration and optimized Alpine images
- **🧪 Comprehensive Testing**: Mock-based testing infrastructure with integration test coverage
- **⚡ High Performance**: Async file processing with formidable uploads and sharp image optimization

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gateway       │    │   Assessment    │    │   PostgreSQL    │
│   Service       │    │   Service       │    │   Database      │
│                 │    │                 │    │                 │
│ - Route Auth    │◄──►│ - Assessment    │◄──►│ - Assessments   │
│ - Token Verify  │    │   CRUD          │    │ - Questions     │
│ - Load Balance  │    │ - File Uploads  │    │ - Media Files   │
│                 │    │ - Media Proc.   │    │ - Metadata      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                      │
        │                        │                      │
   Port :3000               Port :4001              Port :5433
   (Public API)              (Internal)              (Private)
```

### File Storage Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client        │     │   Assessment    │     │   File System   │
│   Application   │     │   Service       │     │                 │
│                 │     │                 │     │                 │
│ - Upload Media  │────►│ - File Proc.    │────►│ /uploads/files  │
│ - View Images   │◄────│ - Thumbnail Gen │◄────│ /uploads/thumbs │
│ - Download Files│     │ - Format Valid  │     │ - Image Files   │
│                 │     │ - Size Limits   │     │ - Documents     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Microservices Communication

- **Gateway Service**: Public-facing API gateway with authentication middleware
- **Assessment Service**: Internal service handling assessment operations and file uploads
- **Database Isolation**: Dedicated PostgreSQL instance with Prisma schema management
- **User Context**: Authenticated requests enriched with user information from Gateway

## 🚀 Key Features

### Assessment Management
- **Complete CRUD Operations**: Create, read, update, delete assessments with nested question sets
- **Question Management**: Flexible question types with media attachments and options
- **Metadata Handling**: Assessment settings, instructions, time limits, and scoring configurations
- **Version Control**: Track assessment changes and maintain data integrity
- **Soft Delete**: Maintains referential integrity while marking items inactive

### File Upload & Media Processing
- **Multi-Format Support**: Images (PNG, JPG, JPEG, GIF, WebP), documents (PDF), and archives
- **Automatic Thumbnails**: Sharp-based image processing with configurable sizes
- **File Validation**: MIME type checking, size limits, and malicious file detection
- **Organized Storage**: Structured file system with separate directories for originals and thumbnails
- **Static File Serving**: Efficient file delivery with proper headers and caching

### Security & Access Control
- **Role-Based Permissions**: TEACHER/ADMIN can create/modify, STUDENT can view (when allowed)
- **File Access Control**: Media files protected by same authorization as parent assessment
- **Input Validation**: Comprehensive request validation with detailed error messages
- **XSS Protection**: Safe file handling and content type validation
- **Path Traversal Prevention**: Secure file operations with sanitized paths

### Database Design
- **Prisma ORM**: Type-safe database operations with automatic migrations
- **Relational Integrity**: Proper foreign key relationships and constraints
- **Performance Optimized**: Efficient queries with proper indexing
- **Transaction Support**: Atomic operations for complex assessment creation
- **Connection Pooling**: Optimized database connection management

## 🛠️ Technology Stack

### Runtime
- **Node.js 18+**: Modern JavaScript runtime with ES modules
- **Express.js 5.1**: Fast, minimalist web framework with async/await support
- **TypeScript 5.9**: Static typing and advanced language features
- **Prisma 6.1**: Next-generation ORM with type safety and migrations

### File Processing
- **formidable**: High-performance multipart form data parsing
- **sharp**: Fast image processing and thumbnail generation
- **mime-types**: Accurate MIME type detection and validation
- **path**: Secure file path operations and sanitization

### Development & Testing
- **Jest 29**: Testing framework with TypeScript support
- **Supertest**: HTTP assertion testing for API endpoints
- **ts-node-dev**: Hot reload development server
- **Docker Compose**: Container orchestration with service networking

### Production
- **Alpine Linux**: Minimal, secure container base images
- **Multi-stage Builds**: Optimized container size and security
- **OpenSSL**: Cryptographic library support for Prisma engine
- **Health Checks**: Container and application health monitoring

## 📊 Database Schema

Our PostgreSQL database schema is designed for comprehensive assessment management with media support and flexible question types:

```prisma
model Assessment {
  id          String            @id @default(cuid())
  title       String
  description String?
  instructions String?
  createdBy   String            // User ID from gateway headers
  status      AssessmentStatus  @default(DRAFT)
  settings    Json?             // Assessment configuration
  
  // Timestamps
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  isActive    Boolean           @default(true)
  
  // Relations
  questionSets QuestionSet[]
}

model QuestionSet {
  id              String      @id @default(cuid())
  assessmentId    String
  setNumber       Int
  name            String
  description     String?
  instructions    String?
  timeLimit       Int?        // minutes per set
  selectionConfig Json?       // Randomization strategy
  displayOrder    Int         @default(0)
  
  // Relations
  assessment      Assessment  @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  questions       Question[]
}

model Question {
  id              String            @id @default(cuid())
  questionSetId   String
  type            QuestionType
  title           String?
  content         String
  points          Float             @default(1.0)
  negativeMarking Float?            // Points deducted for wrong answer
  difficulty      Difficulty        @default(MEDIUM)
  tags            String[]
  hints           String[]
  explanation     String?
  timeLimit       Int?              // seconds for individual question
  metadata        Json?
  displayOrder    Int               @default(0)
  
  // Relations
  questionSet     QuestionSet       @relation(fields: [questionSetId], references: [id], onDelete: Cascade)
  mediaItems      QuestionMedia[]
  options         QuestionOption[]
}

model QuestionMedia {
  id           String      @id @default(cuid())
  questionId   String
  type         MediaType
  filename     String
  originalName String
  mimeType     String
  size         Int
  url          String
  altText      String?
  caption      String?
  displayOrder Int         @default(0)
  
  // Relations
  question     Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
}

model QuestionOption {
  id           String        @id @default(cuid())
  questionId   String
  optionText   String
  isCorrect    Boolean       @default(false)
  explanation  String?
  displayOrder Int           @default(0)
  
  // Relations
  question     Question      @relation(fields: [questionId], references: [id], onDelete: Cascade)
  mediaItems   OptionMedia[]
}

model OptionMedia {
  id           String         @id @default(cuid())
  optionId     String
  type         MediaType
  filename     String
  originalName String
  mimeType     String
  size         Int
  url          String
  altText      String?
  caption      String?
  displayOrder Int            @default(0)
  
  // Relations
  option       QuestionOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
}

// Enums
enum AssessmentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SCHEDULED
}

enum QuestionType {
  MULTIPLE_CHOICE
  MULTIPLE_SELECT
  TRUE_FALSE
  SHORT_ANSWER
  LONG_ANSWER
  FILL_BLANKS
  MATCHING
  ORDERING
  NUMERIC
  FILE_UPLOAD
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

enum MediaType {
  IMAGE
  AUDIO
  VIDEO
  DOCUMENT
}
```

### Schema Relationships
- **Assessment** → **QuestionSet** (one-to-many): Each assessment contains multiple question sets
- **QuestionSet** → **Question** (one-to-many): Each set contains multiple questions with ordering
- **Question** → **QuestionOption** (one-to-many): Questions can have multiple choice options
- **Question** → **QuestionMedia** (one-to-many): Questions can have multiple media attachments
- **QuestionOption** → **OptionMedia** (one-to-many): Options can have associated media files

### Key Design Features
- **Hierarchical Structure**: Assessments → Question Sets → Questions → Options/Media
- **Flexible Question Types**: Support for 10 different question formats
- **Media Support**: Comprehensive file attachment system with thumbnails
- **Soft Delete**: `isActive` fields maintain referential integrity
- **Performance Indexes**: Optimized queries for common access patterns
- **JSON Metadata**: Flexible configuration storage for assessment settings

## 📋 Current Implementation Status

### ✅ **Completed Features**
- **📝 Assessment Management**: Complete CRUD operations with nested question sets
- **📁 File Upload System**: Multi-format media support with automatic thumbnails
- **🔒 Authentication Integration**: Gateway service user context with role validation
- **🏛️ Database Design**: Comprehensive Prisma schema with proper relationships
- **🐳 Production Deployment**: Multi-stage Docker builds with optimization
- **🧪 Integration Testing**: 9+ tests covering file upload and media serving
- **🏗️ Microservices Architecture**: Database-per-service with isolated containers
- **📊 API Documentation**: Complete endpoint documentation with examples
- **🛡️ Security Layer**: Role-based access control and file validation
- **⚡ Performance Optimization**: Async file processing with sharp thumbnails

### 🔄 **Currently In Progress**
- **Unit Test Coverage**: Resolving TypeScript module resolution for service tests
- **Assessment Endpoints**: Complete integration testing for CRUD operations
- **Error Handling**: Enhanced error messages and comprehensive logging
- **Documentation**: Test suite documentation and developer guides

### 🎯 **Architecture Completed**
- **Gateway Integration**: User context extraction via headers
- **Service Isolation**: Independent PostgreSQL databases
- **Container Orchestration**: Docker Compose with networking
- **Environment Configuration**: Secure secret management
- **Test Infrastructure**: Mock-based testing for fast CI/CD

## 🧪 Testing Suite

Our comprehensive testing approach ensures reliability and maintainability:

### Test Coverage (11+ Tests Passing)
```
✅ Basic Environment Tests (2 tests)
   - Environment setup, TypeScript support, global test utilities

✅ Integration Tests - Media Routes (9 tests)
   - File upload functionality with multiple formats
   - Authentication and authorization testing
   - Error handling for invalid uploads and missing files
   - Static file serving with security controls
   - Directory traversal attack prevention

🔄 Unit Tests - Assessment Service (In Progress)
   - Assessment CRUD operations with business logic
   - Question set and question management
   - Input validation and error scenarios
   - User permission checking and access control

🔄 Unit Tests - Middleware (In Progress)
   - User context extraction from Gateway headers
   - Role-based access control validation
   - File upload middleware functionality
```

### Testing Philosophy
- **Mock-Based Approach**: Fast tests without external dependencies using custom Prisma mocks
- **Integration Coverage**: Real HTTP testing with supertest for API endpoints
- **Security Testing**: Authentication, authorization, and file security validation
- **CI/CD Ready**: No database requirements for unit tests with mock infrastructure

### Test Infrastructure
- **Custom Prisma Mocks**: Comprehensive mock factory for database operations
- **Test Utilities**: Reusable mock data generators and API response builders
- **Setup Automation**: Global test configuration with cleanup utilities
- **Mock User Contexts**: Simulated Gateway authentication for different user roles

### Running Tests
```bash
# Run all tests (unit + integration)
npm test

# Run specific test suites
npm test tests/basic.test.ts                    # Environment validation
npm test tests/integration/media.routes.test.ts # File upload tests
npm test tests/unit/services/assessment.service.test.ts # Service logic

# Run tests with verbose output
npm test -- --verbose

# Run tests in watch mode for development
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage
```

## 📁 Project Structure

```
services/assessment-service/
├── src/
│   ├── server.ts                 # HTTP server initialization ✅
│   ├── prismaClient.ts          # Database connection setup ✅
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions ✅
│   ├── middleware/
│   │   ├── userContext.ts       # Gateway auth integration ✅
│   │   ├── upload.ts            # File upload processing ✅
│   │   └── static.ts            # Static file serving ✅
│   ├── routes/
│   │   ├── assessment.routes.ts # Assessment CRUD endpoints ✅
│   │   └── media.routes.ts      # File upload endpoints ✅
│   ├── services/
│   │   └── assessment.service.ts # Business logic layer ✅
│   └── utils/
│       └── errors.ts            # Error handling utilities ✅
├── tests/
│   ├── setup.ts                 # Global test configuration ✅
│   ├── helpers/
│   │   └── mockPrisma.ts       # Database mocking utilities ✅
│   ├── integration/
│   │   ├── assessment.routes.test.ts # API endpoint tests 🔄
│   │   └── media.routes.test.ts     # File upload tests ✅
│   └── unit/
│       ├── services/
│       │   └── assessment.service.test.ts # Service tests 🔄
│       └── middleware/
│           └── userContext.test.ts        # Middleware tests 🔄
├── prisma/
│   └── schema.prisma            # Database schema definition ✅
├── uploads/                     # File storage directory ✅
│   ├── files/                   # Original uploaded files
│   └── thumbnails/              # Generated thumbnails
├── docker-compose.yml          # Service orchestration ✅
├── Dockerfile                  # Container definition ✅
├── package.json               # Dependencies & scripts ✅
└── .env.example              # Environment template ✅
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**: Modern JavaScript runtime
- **Docker & Docker Compose**: Container orchestration
- **PostgreSQL 15**: Database server (via Docker)
- **Gateway Service**: Authentication and routing (for production)

### Quick Start (Development)

1. **Navigate to the assessment service:**
```bash
cd assessment/services/assessment-service
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the database:**
```bash
docker-compose up -d assessment-db
```

5. **Run database migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

6. **Start development server:**
```bash
npm run dev
```

7. **Verify the service:**
```bash
curl http://localhost:4001/health
```

### Quick Start (Docker Production)

1. **Build and start all services:**
```bash
docker-compose up --build -d
```

2. **Check service health:**
```bash
curl http://localhost:4001/health
```

3. **View logs:**
```bash
docker-compose logs -f assessment-service
```

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5433/assessment_db"

# Server Configuration
PORT=4001
NODE_ENV=development

# File Upload Configuration
UPLOAD_MAX_FILE_SIZE=10485760    # 10MB in bytes
UPLOAD_MAX_FILES=10              # Maximum files per request
UPLOAD_ALLOWED_TYPES="image/*,application/pdf"

# Image Processing
THUMBNAIL_WIDTH=200              # Thumbnail width in pixels
THUMBNAIL_HEIGHT=200             # Thumbnail height in pixels
THUMBNAIL_QUALITY=80             # JPEG quality (1-100)

# Security
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # Max requests per window
```

### Docker Configuration

**Dockerfile Highlights:**
- Multi-stage build for optimized production images
- Alpine Linux base for minimal attack surface
- OpenSSL libraries for Prisma engine compatibility
- Non-root user for enhanced security
- Health checks for container monitoring

**docker-compose.yml Services:**
- **assessment-service**: Main application container
- **assessment-db**: PostgreSQL database with persistent storage
- **Custom network**: Isolated service communication

## 📊 API Endpoints

### Assessment Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/assessments` | List assessments with pagination | ✅ |
| `POST` | `/assessments` | Create new assessment | ✅ TEACHER/ADMIN |
| `GET` | `/assessments/:id` | Get assessment by ID | ✅ |
| `PUT` | `/assessments/:id` | Update assessment | ✅ TEACHER/ADMIN |
| `DELETE` | `/assessments/:id` | Delete assessment | ✅ TEACHER/ADMIN |
| `POST` | `/assessments/:id/duplicate` | Duplicate assessment | ✅ TEACHER/ADMIN |

### File Upload & Media

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/media/question` | Upload question media | ✅ TEACHER/ADMIN |
| `POST` | `/media/option` | Upload option images | ✅ TEACHER/ADMIN |
| `GET` | `/uploads/files/:filename` | Serve uploaded files | ✅ |
| `GET` | `/uploads/thumbnails/:filename` | Serve thumbnails | ✅ |

### System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Health check | ❌ |
| `GET` | `/` | Service information | ❌ |

## 🔒 Security Features

### Authentication Integration
- **Gateway Authentication**: Seamless integration with Gateway Service PASETO tokens
- **User Context Headers**: Automatic user information extraction from authenticated requests
- **Role Validation**: Granular permission checking for each endpoint

### File Security
- **MIME Type Validation**: Strict file type checking with whitelist approach
- **Size Limits**: Configurable maximum file sizes to prevent abuse
- **Path Sanitization**: Prevention of directory traversal attacks
- **Secure Storage**: Files stored outside web root with controlled access

### Input Validation
- **Request Validation**: Comprehensive input validation with detailed error messages
- **SQL Injection Prevention**: Prisma ORM provides built-in protection
- **XSS Protection**: Safe file handling and content type validation

## 📈 Performance Features

### Database Optimization
- **Connection Pooling**: Prisma connection pooling for optimal performance
- **Query Optimization**: Efficient database queries with proper indexing
- **Transaction Management**: Atomic operations for data consistency

### File Processing
- **Async Operations**: Non-blocking file processing with sharp
- **Memory Efficiency**: Stream-based file handling for large uploads
- **Thumbnail Caching**: Generated thumbnails stored for future requests

### Container Optimization
- **Multi-stage Builds**: Minimal production container size
- **Alpine Base**: Reduced attack surface and faster startup
- **Health Checks**: Automatic container restart on failures

## 🚦 Development Workflow

### Local Development
```bash
# Start development environment
npm run dev                      # Hot reload server
npm run db:studio               # Prisma Studio (database GUI)
npm run test:watch              # Watch mode testing

# Database operations
npx prisma migrate dev          # Create and apply migrations
npx prisma db push             # Push schema changes without migration
npx prisma generate            # Regenerate Prisma client
```

### Testing Workflow
```bash
# Run different test suites
npm test                        # All tests
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests
npm run test:coverage          # Coverage report

# Development testing
npm run test:watch             # Watch mode
npm run test:debug             # Debug mode
```

### Docker Development
```bash
# Local container testing
docker-compose up --build      # Build and start services
docker-compose logs -f         # Follow logs
docker-compose down -v         # Stop and remove volumes

# Container debugging
docker-compose exec assessment-service sh  # Shell access
docker-compose exec assessment-db psql -U postgres assessment_db  # Database access
```

## 📋 Database Schema

### Core Entities

**Assessment**
- Metadata (title, description, instructions, settings)
- Ownership and timestamps
- Status management
- Question set relationships

**QuestionSet**
- Assessment grouping
- Ordering and configuration
- Question relationships

**Question**
- Content and media attachments
- Question type definitions
- Option management
- Scoring configuration

**MediaFiles**
- File metadata and relationships
- Thumbnail references
- Access control

### Relationships
- Assessment → QuestionSet (one-to-many)
- QuestionSet → Question (one-to-many)
- Question → Options (one-to-many)
- Questions/Options → MediaFiles (many-to-many)

## 🔄 Status & Roadmap

### ✅ Completed Features

- [x] **Core Infrastructure**: Express server, TypeScript, Prisma ORM
- [x] **Database Design**: Complete schema with proper relationships
- [x] **File Upload System**: Multi-format support with image processing
- [x] **Authentication Integration**: Gateway service user context
- [x] **Docker Environment**: Production-ready containerization
- [x] **Testing Infrastructure**: Mock-based testing with integration coverage
- [x] **Security Layer**: Role-based access control and file validation
- [x] **API Endpoints**: Assessment CRUD operations with proper validation

### 🔄 In Progress

- [ ] **Unit Test Completion**: Resolve TypeScript module resolution issues
- [ ] **Integration Test Coverage**: Complete assessment endpoint testing
- [ ] **Error Handling**: Enhanced error messages and logging
- [ ] **Performance Optimization**: Query optimization and caching

### 🎯 Planned Features

- [ ] **Advanced File Processing**: Video support, document conversion
- [ ] **Bulk Operations**: Batch assessment creation and updates
- [ ] **Export Functionality**: Assessment export in multiple formats
- [ ] **Analytics Integration**: Assessment usage metrics and insights
- [ ] **Version Control**: Assessment versioning and change tracking
- [ ] **Advanced Search**: Full-text search across assessments and questions

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Set up local development environment
4. Write tests for new functionality
5. Ensure all tests pass
6. Submit pull request with detailed description

### Code Standards
- **TypeScript**: Strict typing with proper interfaces
- **Testing**: 100% test coverage for new features
- **Documentation**: Comprehensive JSDoc comments
- **Security**: Security-first approach with input validation
- **Performance**: Efficient algorithms and database queries

### Review Process
- Automated testing via CI/CD
- Security vulnerability scanning
- Performance impact assessment
- Code review by maintainers
- Integration testing with other services

---

**🏗️ Part of the Pediafor Assessment Platform microservices ecosystem**

The Assessment Service works seamlessly with:
- **Gateway Service**: Authentication and routing
- **User Service**: User management and roles
- **Grading Service**: Assessment scoring and analytics
- **Submission Service**: Student response handling

For questions or support, please refer to the main project documentation or open an issue in the repository.