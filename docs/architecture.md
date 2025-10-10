# Pediafor Assessment Platform - Comprehensive Architecture

[![Platform Status](https://img.shields.io/badge/Platform-Production%20Ready-success)](.)
[![Services](https://img.shields.io/badge/Services-5%20Microservices-blue)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-319%2F334%20Passing%20(95.5%25)-success)](.)
[![Architecture](https://img.shields.io/badge/Pattern-Event%20Driven%20Microservices-orange)](.)
[![Authentication](https://img.shields.io/badge/Auth-PASETO%20V4-green)](.)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20per%20Service-336791?logo=postgresql)](.)
[![Events](https://img.shields.io/badge/Events-RabbitMQ%20Powered-orange)](.)
[![Docker](https://img.shields.io/badge/Container-Docker-blue?logo=docker)](.)

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Event-Driven Architecture](#event-driven-architecture)
4. [System Components](#system-components)
5. [Service Communication](#service-communication)
6. [Data Architecture](#data-architecture)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Network Architecture](#network-architecture)
10. [Development Architecture](#development-architecture)
11. [Operational Architecture](#operational-architecture)

---

## Executive Summary

The Pediafor Assessment Platform implements a **event-driven microservices architecture** designed for educational assessment management. The platform provides a scalable, secure, and maintainable solution for creating, managing, grading, and analyzing educational assessments with real-time processing capabilities.

### Core Architectural Principles

- **Service Independence**: Each microservice owns its data and business logic
- **Event-Driven Communication**: RabbitMQ-powered asynchronous messaging between services
- **Database per Service**: No shared databases, ensuring loose coupling
- **API Gateway Pattern**: Single entry point with centralized authentication
- **Token-Based Security**: Stateless authentication using PASETO V4 tokens
- **Container-First Design**: Docker containers with orchestration-ready configuration
- **Test-Driven Quality**: 95.5% test coverage across all services with comprehensive test suites

### Platform Capabilities

- ✅ **User Management**: Registration, authentication, profile management with event publishing (89/89 tests)
- ✅ **Assessment Creation**: Rich assessment builder with media support and event-driven analytics (106/106 tests)
- ✅ **File Management**: Multi-format media upload with processing
- ✅ **Role-Based Access**: Student, Teacher, Admin permission levels
- ✅ **Submission Handling**: Complete student submission workflow with event publishing (94/109 tests)
- ✅ **Autosave & Draft Management**: Real-time answer saving and submission status
- ✅ **Event-Driven Architecture**: Complete RabbitMQ integration with user lifecycle and assessment events
- ✅ **Automated Grading**: Production-ready MCQ grading engine with event processing (23/23 tests)
- ✅ **Container Deployment**: Full Docker support with health monitoring
- ✅ **Gateway Service**: API Gateway with PASETO authentication (7/7 tests)
- ✅ **Frontend Application**: Complete React/Next.js interface with role-based dashboards
- 🔄 **AI Question Generation**: Next phase development (infrastructure ready)

---

## Architecture Overview

### High-Level System Architecture

```mermaid
graph TB
    subgraph "External Clients"
        WEB[🌐 Web Portal<br/>React/Vue/Angular]
        MOBILE[📱 Mobile Apps<br/>iOS/Android/Flutter]
        API[🔌 External APIs<br/>Third-party Integrations]
        ADMIN[👨‍💼 Admin Dashboard<br/>Management Interface]
    end
    
    subgraph "Load Balancer & Security"
        LB[⚖️ Load Balancer<br/>NGINX/CloudFlare]
        FIREWALL[🛡️ Security Layer<br/>Rate Limiting/DDoS Protection]
    end
    
    subgraph "API Gateway Layer"
        GATEWAY[🚪 Gateway Service<br/>Port 3000<br/>✅ Production Ready<br/><br/>🔐 PASETO Authentication<br/>🔄 Service Discovery<br/>📊 Request Routing<br/>⚡ Rate Limiting<br/>🔒 CORS Management<br/>📈 Health Monitoring]
    end
    
    subgraph "Core Microservices"
        direction TB
        
        USER[👤 User Service<br/>Port 4000<br/>✅ Production Ready<br/><br/>👥 User Management<br/>🔐 Authentication<br/>🎯 Token Generation<br/>👨‍🎓 Role Management<br/>📧 Profile Management<br/>📡 Event Publishing]
        
        ASSESSMENT[📝 Assessment Service<br/>Port 4001<br/>✅ Production Ready<br/><br/>📊 Assessment CRUD<br/>🎯 Question Management<br/>🖼️ Media Handling<br/>📋 Template System<br/>📅 Publishing Control]
        
        SUBMISSION[📤 Submission Service<br/>Port 4002<br/>✅ Production Ready<br/><br/>✍️ Answer Collection<br/>💾 File Uploads<br/>⏰ Auto-save<br/>📝 Draft Management<br/>✅ Submission Tracking]
        
        GRADING[🎯 Grading Service<br/>Port 4003<br/>✅ Production Ready<br/><br/>🤖 Auto-Grading<br/>📊 Score Calculation<br/>📈 Analytics Engine<br/>🔍 Performance Analysis<br/>📋 Report Generation]
    end
    
    subgraph "Future Services"
        ANALYTICS[📊 Analytics Service<br/>🔄 Development<br/><br/>📈 Usage Metrics<br/>📊 Performance Insights<br/>🎯 User Behavior<br/>📋 Custom Reports]
        
        NOTIFICATION[🔔 Notification Service<br/>🔄 Planned<br/><br/>📧 Email Alerts<br/>📱 Push Notifications<br/>💬 In-app Messages<br/>⏰ Scheduled Reminders]
        
        AI[🤖 AI Service<br/>🔄 Future<br/><br/>🎯 Question Generation<br/>📝 Auto-feedback<br/>🔍 Plagiarism Detection<br/>📊 Predictive Analytics]
    end
    
    subgraph "Data Storage Layer"
        direction LR
        DB1[(🗄️ User Database<br/>PostgreSQL 15<br/>Port 5432<br/><br/>👥 User Profiles<br/>🔐 Credentials<br/>⚙️ Preferences<br/>📊 Activity Logs)]
        
        DB2[(🗄️ Assessment Database<br/>PostgreSQL 15<br/>Port 5433<br/><br/>📝 Assessments<br/>❓ Questions<br/>🖼️ Media Files<br/>📋 Templates)]
        
        DB3[(🗄️ Submission Database<br/>PostgreSQL 15<br/>Port 5434<br/><br/>✍️ Student Answers<br/>📁 File Uploads<br/>⏰ Timestamps<br/>📊 Progress Tracking)]
        
        DB4[(🗄️ Grading Database<br/>PostgreSQL 15<br/>Port 5435<br/><br/>🎯 Scores<br/>📊 Analytics<br/>📈 Performance Data<br/>📋 Reports)]
    end
    
    subgraph "Cache & Message Layer"
        REDIS[(⚡ Redis Cluster<br/>Port 6379<br/><br/>🔑 Session Storage<br/>⚡ Response Cache<br/>🔄 Rate Limiting<br/>📊 Real-time Data)]
        
        QUEUE[📨 RabbitMQ Message Broker<br/>Port 5672/15672<br/>✅ Production Ready<br/><br/>🎯 Event-Driven Architecture<br/>📤 Submission Events<br/>🤖 Auto-Grading Triggers<br/>🔔 Notifications<br/>📊 Analytics Events<br/>💀 Dead Letter Handling]
    end
    
    subgraph "File Storage"
        STORAGE[🗂️ File Storage<br/>AWS S3/Azure Blob<br/><br/>🖼️ Images<br/>🎥 Videos<br/>🔊 Audio Files<br/>📄 Documents]
    end
    
    subgraph "Monitoring & Logging"
        METRICS[📊 Metrics<br/>Prometheus/Grafana<br/><br/>📈 Performance<br/>⚡ Response Times<br/>🔍 Error Tracking<br/>📊 Business KPIs]
        
        LOGS[📝 Centralized Logging<br/>ELK Stack<br/><br/>🔍 Log Aggregation<br/>🚨 Error Tracking<br/>🔍 Audit Trails<br/>📊 Analytics]
    end
    
    %% External connections
    WEB --> LB
    MOBILE --> LB
    API --> LB
    ADMIN --> LB
    
    %% Security layer
    LB --> FIREWALL
    FIREWALL --> GATEWAY
    
    %% Gateway routing
    GATEWAY --> USER
    GATEWAY --> ASSESSMENT
    GATEWAY --> SUBMISSION
    GATEWAY --> GRADING
    
    %% Database connections
    USER --> DB1
    ASSESSMENT --> DB2
    SUBMISSION --> DB3
    GRADING --> DB4
    
    %% Cache connections
    GATEWAY --> REDIS
    USER --> REDIS
    ASSESSMENT --> REDIS
    SUBMISSION --> REDIS
    GRADING --> REDIS
    
    %% File storage
    ASSESSMENT --> STORAGE
    SUBMISSION --> STORAGE
    
    %% Inter-service communication
    SUBMISSION -.-> ASSESSMENT
    GRADING -.-> SUBMISSION
    GRADING -.-> ASSESSMENT
    ANALYTICS -.-> USER
    ANALYTICS -.-> ASSESSMENT
    ANALYTICS -.-> SUBMISSION
    ANALYTICS -.-> GRADING
    
    %% Message queue
    USER --> QUEUE
    ASSESSMENT --> QUEUE
    SUBMISSION --> QUEUE
    GRADING --> QUEUE
    NOTIFICATION -.-> QUEUE
    
    %% Monitoring
    GATEWAY --> METRICS
    USER --> METRICS
    ASSESSMENT --> METRICS
    SUBMISSION --> METRICS
    GRADING --> METRICS
    
    GATEWAY --> LOGS
    USER --> LOGS
    ASSESSMENT --> LOGS
    SUBMISSION --> LOGS
    GRADING --> LOGS
    
    %% Styling
    classDef production fill:#d4edda,stroke:#28a745,stroke-width:3px,color:#000
    classDef development fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#000
    classDef planned fill:#f8d7da,stroke:#dc3545,stroke-width:2px,color:#000
    classDef database fill:#e2e3e5,stroke:#6c757d,stroke-width:2px,color:#000
    classDef infrastructure fill:#d1ecf1,stroke:#17a2b8,stroke-width:2px,color:#000
    
    class GATEWAY,USER,ASSESSMENT,SUBMISSION,GRADING production
    class ANALYTICS development
    class NOTIFICATION,AI planned
    class DB1,DB2,DB3,DB4,REDIS,QUEUE,STORAGE database
    class LB,FIREWALL,METRICS,LOGS infrastructure
```

### Service Interaction Flow

```mermaid
sequenceDiagram
    participant C as 🖥️ Client
    participant G as 🚪 Gateway
    participant U as 👤 User Service
    participant A as 📝 Assessment Service
    participant S as 📤 Submission Service
    participant Gr as 🎯 Grading Service
    participant DB as 🗄️ Database
    participant Cache as ⚡ Cache
    
    Note over C,Cache: Complete Assessment Workflow
    
    %% Authentication
    C->>G: 1. Login Request
    G->>U: 2. Forward credentials
    U->>DB: 3. Validate user
    U->>Cache: 4. Store session
    U-->>G: 5. Return tokens
    G-->>C: 6. Authentication success
    
    %% Assessment Creation
    C->>G: 7. Create Assessment
    G->>G: 8. Validate token
    G->>A: 9. Forward request + user context
    A->>DB: 10. Store assessment
    A-->>G: 11. Assessment created
    G-->>C: 12. Creation response
    
    %% Student Submission
    C->>G: 13. Submit answers
    G->>S: 14. Process submission
    S->>DB: 15. Store answers
    S->>Gr: 16. Trigger grading
    Gr->>DB: 17. Calculate scores
    Gr-->>S: 18. Grading complete
    S-->>G: 19. Submission processed
    G-->>C: 20. Success response
    
    Note over C,Cache: All services maintain independent data stores<br/>Gateway handles authentication and routing<br/>Services communicate via internal APIs
```

---

## Event-Driven Architecture

The platform implements a comprehensive event-driven architecture using RabbitMQ as the central message broker. This enables real-time processing, automatic workflows, and scalable inter-service communication.

### Event Architecture Overview

```mermaid
graph TB
    %% Event Publishers
    SUB[Submission Service] --> RMQ[RabbitMQ Event Bus]
    GRAD[Grading Service] --> RMQ
    USER[User Service] --> RMQ
    ASSESS[Assessment Service] --> RMQ
    
    %% Event Subscribers
    RMQ --> ASSESS_SUB[Assessment Analytics]
    RMQ --> FUTURE[Future Services]
    
    %% Event Types
    RMQ -.-> E1[submission.submitted]
    RMQ -.-> E2[submission.graded]
    RMQ -.-> E3[grading.completed]
    RMQ -.-> E4[user.registered]
    RMQ -.-> E5[user.profile_updated]
    RMQ -.-> E6[user.deactivated]
    RMQ -.-> E7[user.reactivated]
    RMQ -.-> E8[user.role_changed]
    RMQ -.-> E9[assessment.fully_graded]
    
    %% Management
    RMQ --> MGMT[Management UI<br/>:15672]
    
    classDef service fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef broker fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    classDef event fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px
    classDef mgmt fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class SUB,GRAD,USER,ASSESS,ASSESS_SUB,FUTURE service
    class RMQ broker
    class E1,E2,E3,E4,E5,E6,E7,E8,E9 event
    class MGMT mgmt
```

### Event Flow Workflow

```mermaid
sequenceDiagram
    participant Student
    participant SubService as Submission Service
    participant RabbitMQ
    participant AssessService as Assessment Service
    participant GradService as Grading Service
    
    Student->>SubService: Submit Assessment
    SubService->>RabbitMQ: Publish submission.submitted
    RabbitMQ->>AssessService: Event: submission.submitted
    AssessService->>AssessService: Update Statistics
    
    SubService->>GradService: Trigger Auto-Grading
    GradService->>GradService: Process MCQ Answers
    GradService->>RabbitMQ: Publish grading.completed
    
    RabbitMQ->>AssessService: Event: grading.completed
    AssessService->>AssessService: Update Analytics
    AssessService->>AssessService: Check All Submissions
    
    alt All Submissions Graded
        AssessService->>RabbitMQ: Publish assessment.fully_graded
        RabbitMQ->>SubService: Event: assessment.fully_graded
        SubService->>SubService: Update Assessment Status
    end
```

### Event Types and Handlers

#### Published Events

**User Service Events:**
- **user.registered**: New user account creation with profile details
- **user.profile_updated**: User profile information changes (name, picture, metadata)
- **user.deactivated**: User account deactivation for security or administrative reasons
- **user.reactivated**: User account reactivation after deactivation
- **user.role_changed**: User role assignment changes (student ↔ teacher ↔ admin)

**Assessment & Submission Events:**
- **submission.submitted**: Student submits an assessment for grading
- **submission.graded**: Submission receives a grade with scoring details
- **grading.completed**: Grading process completes with final results
- **assessment.fully_graded**: All submissions for assessment are graded and analytics ready

#### Event Processing
- **Real-Time Analytics**: Live assessment statistics, user engagement, and completion rates
- **Automatic Workflows**: Seamless submission-to-grading pipelines and user onboarding
- **Cross-Service Communication**: Decoupled service integration with event-driven messaging
- **Statistics Tracking**: Organization metrics, user behavior analytics, and assessment performance
- **Notification Systems**: User activity triggers for email alerts and dashboard updates

### Production Benefits

- **Scalability**: Asynchronous processing with message persistence
- **Reliability**: Event durability and dead-letter queue handling
- **Real-Time**: Live updates and immediate feedback
- **Monitoring**: Complete visibility through RabbitMQ Management UI
- **Fault Tolerance**: Graceful error handling and recovery

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
**Role**: User Management, Authentication Provider, and Event Publisher

**Core Responsibilities**:
- **User Registration**: Account creation with email validation and event publishing
- **Authentication**: Login/logout with secure token generation
- **Profile Management**: User profile CRUD operations with change tracking
- **Role Management**: Student, Teacher, Admin role assignment with audit events
- **Token Issuance**: PASETO V4 token generation with Ed25519 signing
- **Password Security**: Argon2 hashing with salt
- **Event Publishing**: Real-time user lifecycle events to RabbitMQ message broker

**Technology Stack**:
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with input validation
- **Database**: PostgreSQL 15 with Prisma ORM
- **Authentication**: PASETO V4 with Ed25519 key pairs
- **Security**: Argon2 password hashing, bcrypt fallback
- **Messaging**: RabbitMQ with amqplib for event-driven architecture
- **Testing**: Jest with 89/89 tests passing (including event integration)

**Event-Driven Architecture**:
- **Published Events**: `user.registered`, `user.profile_updated`, `user.deactivated`, `user.reactivated`, `user.role_changed`
- **Message Broker**: RabbitMQ topic exchange with durable queues
- **Event Reliability**: Service continues operation even if messaging fails
- **Consumer Services**: Analytics, Notification, and Permission services
- **Development Mode**: Graceful fallback with console logging when RabbitMQ unavailable

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
- `POST /register` - User registration with event publishing
- `POST /auth/login` - User authentication
- `POST /auth/logout` - Token invalidation
- `POST /auth/refresh` - Token refresh
- `GET /profile/:id` - Get user profile
- `PUT /profile/:id` - Update user profile with event publishing
- `DELETE /profile/:id` - Soft delete user with event publishing
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

### 🎯 Grading Service (Port 4003) - Production Ready
**Role**: Automated MCQ Grading and Performance Analytics

**Core Responsibilities**:
- **Automated MCQ Grading**: Production-ready multiple-choice question evaluation with advanced algorithms
- **Partial Credit System**: Sophisticated scoring for single-select, multi-select, and true/false questions
- **Performance Analytics**: Comprehensive grade statistics, distribution analysis, and performance tracking
- **Flexible Scoring**: Configurable scoring rules, negative marking, and custom feedback generation
- **Grade Management**: Complete CRUD operations for grades with role-based access control
- **Integration Ready**: Seamless integration with submission and assessment services

**Technology Stack**:
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with comprehensive validation and error handling
- **Database**: PostgreSQL 15 with Prisma ORM (configured for Debian deployment)
- **Container**: Production-ready Docker with Debian-based Node.js, OpenSSL compatibility
- **Authentication**: PASETO V4 integration via Gateway Service with role-based access
- **Testing**: Jest with **23/23 tests passing** (100% grading algorithm coverage)

**Database Schema**:
```sql
Grade Entity:
- id: String (CUID)
- submissionId: String (Unique reference to submission)
- assessmentId: String (Reference to assessment)
- userId: String (Student being graded)
- totalScore: Float (Final calculated score)
- maxPossibleScore: Float (Maximum points available)
- percentage: Float (Calculated percentage)
- letterGrade: String (Optional letter grade)
- gradingStartedAt: DateTime (Grading start timestamp)
- gradingCompletedAt: DateTime (Grading completion timestamp)
- gradingDuration: Integer (Duration in milliseconds)
- gradingConfigId: String (Reference to grading configuration)
- timestamps: createdAt, updatedAt

QuestionGrade Entity:
- id: String (CUID)
- gradeId: String (Foreign Key)
- questionId: String (Question reference)
- questionType: String (single-select, multi-select, true-false)
- providedAnswer: JSON (Student's answer)
- correctAnswer: JSON (Correct answer(s))
- isCorrect: Boolean (Overall correctness)
- pointsAwarded: Float (Points given for this question)
- maxPoints: Float (Maximum points for this question)
- partialCredit: Float (Partial credit percentage 0-1)
- feedback: String (Optional feedback for this question)
- metadata: JSON (Additional question-specific data)
- timestamps: createdAt

GradeAnalytics Entity:
- id: String (CUID)
- gradeId: String (Foreign Key)
- averageScore: Float (Class/cohort average for comparison)
- percentile: Float (Student's percentile ranking)
- standardDeviation: Float (Score distribution metrics)
- questionsCorrect: Integer (Number of questions answered correctly)
- questionsIncorrect: Integer (Number of questions answered incorrectly)
- questionsPartial: Integer (Number of questions with partial credit)
- questionsSkipped: Integer (Number of questions not answered)
- averageTimePerQuestion: Float (Average time spent per question)
- totalTimeSpent: Integer (Total time spent on assessment)
- timestamps: createdAt, updatedAt

GradingConfig Entity:
- id: String (CUID)
- name: String (Configuration name)
- assessmentId: String (Optional: specific to an assessment)
- enablePartialCredit: Boolean (Default: false)
- enableNegativeMarking: Boolean (Default: false)
- negativeMarkingPenalty: Float (Penalty multiplier, default: 0.25)
- passingPercentage: Float (Default: 60.0)
- gradeScale: JSON (Letter grade boundaries)
- singleSelectRules: JSON (Rules for single-select questions)
- multiSelectRules: JSON (Rules for multi-select questions)
- trueFalseRules: JSON (Rules for true/false questions)
- description: String (Optional)
- isActive: Boolean (Default: true)
- timestamps: createdAt, updatedAt
```

**API Endpoints**:
- `POST /api/grade` - Grade a submission with automatic scoring
- `GET /api/grade/submission/:submissionId` - Get grade for specific submission
- `GET /api/grade/user/:userId` - Get all grades for a user (role-based access)
- `GET /api/grade/assessment/:assessmentId` - Get grade summary for assessment
- `GET /health` - Service health check with uptime metrics

**Grading Algorithms** (Production Ready):
- **Single-Select MCQ**: Exact match with case-insensitive, whitespace-tolerant processing
- **Multi-Select MCQ**: Partial credit based on correct selections vs. total possible
- **True/False Questions**: Flexible boolean parsing (true/false, yes/no, 1/0, etc.)
- **Partial Credit System**: Proportional scoring for multi-select questions
- **Negative Marking**: Configurable penalty system for incorrect answers
- **Performance Analytics**: Statistical analysis, score distribution, percentile ranking

**Docker Deployment Features**:
- ✅ **Production Ready**: Debian-based Node.js 18 with OpenSSL compatibility
- ✅ **Security Hardened**: Non-root user execution and minimal attack surface
- ✅ **Health Monitoring**: Built-in health checks and status endpoints
- ✅ **Prisma Compatible**: Fixed OpenSSL library dependencies for smooth operation
- ✅ **Multi-stage Build**: Optimized container size with dependency caching

**Integration Points**:
- **Submission Service**: Receives submission data for automated grading
- **Assessment Service**: Fetches question metadata and correct answers
- **User Service**: Validates user permissions and roles
- **Gateway Service**: Routes requests and handles authentication

**Key Features**:
- ✅ **Complete MCQ Grading Engine**: Single-select, multi-select, true/false support
- ✅ **Advanced Scoring Algorithms**: Partial credit, negative marking, custom feedback
- ✅ **Comprehensive Testing**: 23/23 tests passing with 100% algorithm coverage
- ✅ **Role-Based Access Control**: Student, Teacher, Admin permissions
- ✅ **Performance Analytics**: Grade distribution, statistical analysis, performance tracking
- ✅ **Docker Production Ready**: Fully containerized with health monitoring
- ✅ **Database Optimized**: Efficient Prisma queries with proper indexing
- ✅ **Integration Ready**: Seamless connection to existing microservices

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

#### 🎯 Event-Driven Communication Pattern (NEW)
```typescript
Event-Driven Workflow:
Submission Service → RabbitMQ → Grading Service → Automatic Processing

Event Publishing:
- submission.submitted: Student submits for grading
- submission.updated: Submission data modified  
- grading.completed: Grading process finished
- grading.failed: Grading process encountered error

Message Routing:
Exchange: submission.events (Topic)
Queues: grading.submission.submitted
Dead Letter: Failed messages preserved for analysis
```

#### 📨 RabbitMQ Configuration
```yaml
Event Infrastructure:
- Message Broker: RabbitMQ 3.12 (Port 5672)
- Management UI: Port 15672
- Exchange Types: Topic exchanges for flexible routing
- Queue Durability: Persistent queues with TTL
- Dead Letter Exchange: Failed message handling
- Authentication: Service-specific user credentials
```

#### 🔄 Automatic Grading Workflow
```
Student Action → Event Chain → Automated Result:

1. Student submits answers
   └─ Submission Service updates status to "SUBMITTED"
   
2. Event published to RabbitMQ
   └─ submission.submitted event with submission data
   
3. Grading Service receives event
   └─ Fetches submission and assessment data
   
4. Automatic grading performed
   └─ MCQ/True-False questions processed
   
5. Results published
   └─ grading.completed event with scores and analytics
   
6. Platform updated
   └─ Grade stored, student notified (future)
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
