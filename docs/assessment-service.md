# Assessment Service - Comprehensive Documentation

[![Status](https://img.shields.io/badge/Status-Production%20Ready%20%26%20Operational-success)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-106%2F106%20(100%25)-success)](.)
[![Service Health](https://img.shields.io/badge/Health-Service%20Healthy-brightgreen)](.)
[![Events](https://img.shields.io/badge/Events-RabbitMQ%20Integrated-orange)](.)
[![Port](https://img.shields.io/badge/Port-4001-blue)](.)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](.)
[![Express](https://img.shields.io/badge/Express.js-4.x-green?logo=express)](.)
[![Last Updated](https://img.shields.io/badge/Updated-October%202025-blue)](.)

## Table of Contents

1. [Service Overview](#service-overview)
2. [Architecture & Design](#architecture--design)
3. [Event-Driven Features](#event-driven-features)
4. [Feature Implementation](#feature-implementation)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Media Management](#media-management)
8. [Security & Authorization](#security--authorization)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)
11. [Performance & Optimization](#performance--optimization)
12. [Development Guidelines](#development-guidelines)

---

## Service Overview

The Assessment Service is the core content management microservice for the Pediafor Assessment Platform. It handles the complete lifecycle of educational assessments, from creation and editing to publishing and media management, with comprehensive event-driven analytics capabilities.

### 🎯 Primary Responsibilities
- **Assessment Management**: CRUD operations for assessments with status management
- **Event-Driven Analytics**: Real-time assessment statistics and cross-service communication
- **Media Processing**: File upload with support for images, audio, video, and documents
- **Content Publishing**: Assessment publishing workflow and duplication
- **Access Control**: Role-based permissions (Teacher, Admin) with ownership validation
- **Real-Time Statistics**: Live assessment performance metrics and completion tracking
- **Data Integrity**: Comprehensive validation and error handling

### 🏆 Key Achievements
- **Complete Test Coverage**: 106/106 tests passing across all scenarios including event processing
- **Event-Driven Architecture**: Full RabbitMQ integration with real-time analytics
- **Production Architecture**: Microservice with PostgreSQL and Prisma ORM
- **Media Excellence**: Multi-format support with automatic thumbnail generation
- **Security Hardened**: Role-based access with gateway-provided authentication
- **Cross-Service Integration**: Seamless communication with submission, grading, and user services
- **Developer Experience**: TypeScript, Express.js with comprehensive error handling

---

## Architecture & Design

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Application]
        Mobile[Mobile App] 
        API[External API]
    end
    
    subgraph "Gateway Layer"
        Gateway[Gateway Service<br/>Port 3000]
    end
    
    subgraph "Service Layer"
        AssessmentSvc[Assessment Service<br/>Port 4001]
    end
    
    subgraph "Storage Layer"
        AssessmentDB[(PostgreSQL<br/>Port 5433)]
        FileSystem[File System<br/>/uploads]
    end
    
    Web --> Gateway
    Mobile --> Gateway
    API --> Gateway
    
    Gateway --> AssessmentSvc
    AssessmentSvc --> AssessmentDB
    AssessmentSvc --> FileSystem
```

### Data Flow Architecture

```mermaid
flowchart TD
    A[Client Request] --> B{Authentication}
    B -->|Valid| C[Assessment Service]
    B -->|Invalid| D[401 Unauthorized]
    
    C --> E{Authorization Check}
    E -->|Authorized| F[Business Logic]
    E -->|Forbidden| G[403 Forbidden]
    
    F --> H{Request Type}
    H -->|CRUD Operations| I[Database Layer]
    H -->|File Upload| J[Media Processing]
    H -->|Publishing| K[Validation & State]
    
    I --> L[PostgreSQL]
    J --> M[File System]
    K --> N[Assessment Publishing]
    
    L --> O[Response Data]
    M --> O
    N --> O
    
    O --> P[Client Response]
```

### Service Boundaries

| Component | Responsibility | Technology Stack |
|-----------|---------------|------------------|
| **Assessment Service** | Assessment CRUD, media processing, validation | Node.js, TypeScript, Express |
| **Database** | Assessment data persistence, relationships | PostgreSQL 15, Prisma ORM |
| **File Storage** | Media files, thumbnails, documents | Local filesystem with future cloud support |
| **Gateway** | Authentication, routing, load balancing | Node.js, Express |

---

## Event-Driven Features

The Assessment Service implements comprehensive event-driven architecture for real-time analytics and cross-service communication.

### Event Processing Architecture

```mermaid
graph TB
    subgraph "Event Publishers"
        SUB[Submission Service]
        GRAD[Grading Service] 
        USER[User Service]
    end
    
    subgraph "Message Broker"
        RMQ[RabbitMQ<br/>Port 5672]
        MGMT[Management UI<br/>Port 15672]
    end
    
    subgraph "Assessment Service"
        SUBSCRIBER[Event Subscriber]
        ANALYTICS[Analytics Engine]
        STATS[Statistics Manager]
        PUBLISHER[Event Publisher]
    end
    
    SUB --> RMQ
    GRAD --> RMQ
    USER --> RMQ
    
    RMQ --> SUBSCRIBER
    SUBSCRIBER --> ANALYTICS
    SUBSCRIBER --> STATS
    
    ANALYTICS --> PUBLISHER
    PUBLISHER --> RMQ
    
    classDef service fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef broker fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    classDef internal fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class SUB,GRAD,USER service
    class RMQ,MGMT broker
    class SUBSCRIBER,ANALYTICS,STATS,PUBLISHER internal
```

### Event Types Handled

#### Incoming Events (Subscribed)
- **submission.submitted**: Updates assessment submission statistics
- **submission.graded**: Updates completion rates and average scores
- **grading.completed**: Marks individual submissions as graded
- **user.registered**: Updates organization enrollment statistics

#### Outgoing Events (Published)
- **assessment.fully_graded**: Published when all submissions are graded

### Real-Time Analytics Features

#### Submission Statistics
- **Live Submission Counts**: Real-time tracking of assessment submissions
- **Completion Rates**: Automatic calculation of submission completion percentages
- **Average Scores**: Dynamic score averaging as submissions are graded
- **Time-Based Metrics**: Submission timing and duration analytics

#### Organization Analytics
- **Enrollment Tracking**: Student registration and organization membership
- **Activity Monitoring**: User engagement and platform usage
- **Performance Metrics**: Assessment performance across organizations

#### Assessment Completion Detection
- **Auto-Detection**: Automatic identification when all submissions are graded
- **Event Broadcasting**: Publishing of completion events for downstream services
- **Status Updates**: Real-time assessment status management

### Event Processing Implementation

#### Event Subscriber Components
```typescript
// Key event handlers implemented
- handleSubmissionSubmitted(): Updates stats, checks auto-grading
- handleSubmissionGraded(): Updates analytics, calculates completion
- handleGradingCompleted(): Tracks individual completion, publishes events
- handleUserRegistered(): Updates organization statistics
```

#### Analytics Engine
- **Real-Time Calculations**: Live computation of assessment metrics
- **Statistical Aggregation**: Automatic rollup of submission data
- **Performance Tracking**: Response time and throughput monitoring
- **Error Handling**: Graceful failure recovery and retry logic

### Production Benefits

#### Scalability
- **Asynchronous Processing**: Non-blocking event handling
- **Message Persistence**: Durable event storage with replay capability
- **Horizontal Scaling**: Multiple consumer instances supported

#### Reliability
- **Event Durability**: Messages persist across service restarts
- **Dead Letter Queues**: Failed event handling with retry mechanisms
- **Health Monitoring**: Complete visibility through RabbitMQ management UI

#### Real-Time Capabilities
- **Live Dashboards**: Instant updates to assessment analytics
- **Immediate Feedback**: Real-time submission and grading status
- **Cross-Service Coordination**: Seamless workflow automation

---

## Feature Implementation

### 📝 Assessment Management

#### Complete CRUD Operations
- **Create**: Assessment creation with metadata validation
- **Read**: Filtered retrieval based on user permissions
- **Update**: Partial updates with ownership verification
- **Delete**: Soft delete with cascade handling
- **Duplicate**: Assessment cloning with unique identifiers
- **Publish**: State management with validation rules

#### Assessment Structure
```typescript
interface Assessment {
  id: string;                    // UUID primary key
  title: string;                 // Assessment title
  description?: string;          // Optional description
  instructions?: string;         // Student instructions
  timeLimit?: number;           // Time limit in minutes
  maxAttempts?: number;         // Maximum attempts allowed
  isPublished: boolean;         // Publication status
  publishedAt?: Date;           // Publication timestamp
  settings: AssessmentSettings; // Configuration object
  createdBy: string;           // Creator user ID
  questions: Question[];       // Associated questions
  createdAt: Date;            // Creation timestamp
  updatedAt: Date;            // Last update timestamp
}
```

### 📋 Question Management

#### Question Types Support
- **Multiple Choice**: Single and multiple correct answers
- **True/False**: Boolean questions with explanations
- **Short Answer**: Text-based responses
- **Essay**: Long-form written responses
- **Media Questions**: Questions with embedded images/audio

#### Question Structure
```typescript
interface Question {
  id: string;                  // UUID primary key
  assessmentId: string;        // Parent assessment
  type: QuestionType;          // Question type enum
  title: string;               // Question text
  description?: string;        // Additional context
  points: number;             // Point value
  order: number;              // Display order
  required: boolean;          // Required flag
  settings: QuestionSettings; // Type-specific settings
  mediaFiles: MediaFile[];    // Associated media
  createdAt: Date;           // Creation timestamp
  updatedAt: Date;           // Last update timestamp
}
```

### 📁 Media Management

#### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP (with thumbnail generation)
- **Documents**: PDF, DOC, DOCX, TXT
- **Audio**: MP3, WAV, M4A
- **Video**: MP4, WebM (future support)

#### File Processing Pipeline
```mermaid
sequenceDiagram
    participant Client
    participant Service
    participant Storage
    participant Processor
    
    Client->>Service: Upload file
    Service->>Service: Validate file type & size
    Service->>Storage: Save original file
    Storage-->>Service: File path
    
    alt Image File
        Service->>Processor: Generate thumbnail
        Processor->>Storage: Save thumbnail
        Storage-->>Processor: Thumbnail path
        Processor-->>Service: Processing complete
    end
    
    Service->>Service: Create database record
    Service-->>Client: File metadata response
```

---

## API Documentation

### Assessment Endpoints

#### GET `/assessments`
Retrieve assessments with filtering and pagination.

**Query Parameters:**
```typescript
interface AssessmentListQuery {
  page?: number;                // Default: 1
  limit?: number;               // Default: 20, Max: 100
  search?: string;              // Search in title/description
  isPublished?: boolean;        // Filter by publication status
  createdBy?: string;           // Filter by creator (admin only)
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';   // Default: 'desc'
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessments": [
      {
        "id": "uuid",
        "title": "Introduction to Computer Science",
        "description": "Basic CS concepts assessment",
        "timeLimit": 60,
        "maxAttempts": 3,
        "isPublished": true,
        "publishedAt": "2025-10-01T10:00:00Z",
        "questionCount": 25,
        "totalPoints": 100,
        "createdBy": {
          "id": "creator-uuid",
          "name": "Dr. Smith",
          "email": "smith@university.edu"
        },
        "createdAt": "2025-09-15T08:00:00Z",
        "updatedAt": "2025-10-01T09:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalAssessments": 47,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET `/assessments/:id`
Retrieve specific assessment with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "uuid",
      "title": "Introduction to Computer Science",
      "description": "Comprehensive assessment covering basic computer science concepts",
      "instructions": "Answer all questions to the best of your ability. You have 60 minutes to complete this assessment.",
      "timeLimit": 60,
      "maxAttempts": 3,
      "isPublished": true,
      "publishedAt": "2025-10-01T10:00:00Z",
      "settings": {
        "shuffleQuestions": true,
        "showResults": "after_submission",
        "allowBacktrack": false,
        "showCorrectAnswers": true
      },
      "questions": [
        {
          "id": "question-uuid",
          "type": "multiple_choice",
          "title": "What is the time complexity of binary search?",
          "points": 4,
          "order": 1,
          "required": true,
          "settings": {
            "options": [
              { "id": "opt1", "text": "O(n)", "isCorrect": false },
              { "id": "opt2", "text": "O(log n)", "isCorrect": true },
              { "id": "opt3", "text": "O(n²)", "isCorrect": false },
              { "id": "opt4", "text": "O(1)", "isCorrect": false }
            ],
            "multipleCorrect": false
          },
          "mediaFiles": []
        }
      ],
      "createdBy": {
        "id": "creator-uuid",
        "name": "Dr. Smith",
        "email": "smith@university.edu"
      },
      "stats": {
        "totalQuestions": 25,
        "totalPoints": 100,
        "estimatedDuration": 45
      },
      "createdAt": "2025-09-15T08:00:00Z",
      "updatedAt": "2025-10-01T09:30:00Z"
    }
  }
}
```

#### POST `/assessments`
Create new assessment.

**Request:**
```json
{
  "title": "Database Design Fundamentals",
  "description": "Assessment covering normalization, ER diagrams, and SQL",
  "instructions": "Read each question carefully and provide detailed answers where required.",
  "timeLimit": 90,
  "maxAttempts": 2,
  "settings": {
    "shuffleQuestions": false,
    "showResults": "after_due_date",
    "allowBacktrack": true,
    "showCorrectAnswers": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "new-uuid",
      "title": "Database Design Fundamentals",
      "description": "Assessment covering normalization, ER diagrams, and SQL",
      "isPublished": false,
      "createdBy": "teacher-uuid",
      "createdAt": "2025-10-04T11:00:00Z",
      "updatedAt": "2025-10-04T11:00:00Z"
    }
  }
}
```

#### PUT `/assessments/:id`
Update existing assessment.

**Request:**
```json
{
  "title": "Updated Assessment Title",
  "timeLimit": 75,
  "settings": {
    "shuffleQuestions": true,
    "showResults": "immediately"
  }
}
```

#### POST `/assessments/:id/publish`
Publish assessment for student access.

**Request:**
```json
{
  "publishAt": "2025-10-05T09:00:00Z"  // Optional scheduled publishing
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "uuid",
      "isPublished": true,
      "publishedAt": "2025-10-04T11:15:00Z"
    }
  }
}
```

#### POST `/assessments/:id/duplicate`
Create a copy of existing assessment.

**Response:**
```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "new-uuid",
      "title": "Copy of Original Assessment",
      "isPublished": false,
      "createdBy": "teacher-uuid",
      "originalAssessmentId": "original-uuid"
    }
  }
}
```

#### DELETE `/assessments/:id`
Soft delete assessment.

**Response:**
```json
{
  "success": true,
  "message": "Assessment deleted successfully"
}
```

### Media Upload Endpoints

#### POST `/media/question`
Upload media files for questions (images, audio, video, documents).

**Authorization:** Teacher or Admin role required

**Request:** Form-data with files and optional fields

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "media-uuid",
        "originalName": "question-image.png",
        "filename": "uploads/question-image-1234.png",
        "mimetype": "image/png",
        "size": 524288,
        "url": "/uploads/question-image-1234.png",
        "thumbnailUrl": "/uploads/thumbs/question-image-1234-thumb.png",
        "dimensions": { "width": 800, "height": 600 }
      }
    ],
    "fields": {}
  },
  "message": "Files uploaded successfully",
  "timestamp": "2025-01-26T12:00:00Z"
}
```

#### POST `/media/option`
Upload images for multiple choice options.

**Authorization:** Teacher or Admin role required

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "option-uuid",
        "originalName": "option-a.png",
        "filename": "uploads/option-a-5678.png",
        "mimetype": "image/png",
        "size": 256000,
        "url": "/uploads/option-a-5678.png",
        "thumbnailUrl": "/uploads/thumbs/option-a-5678-thumb.png",
        "dimensions": { "width": 400, "height": 300 }
      }
    ],
    "fields": {}
  },
  "message": "Images uploaded successfully",
  "timestamp": "2025-01-26T12:00:00Z"
}
```

#### POST `/media/audio`
Upload audio files for assessments.

**Authorization:** Teacher or Admin role required

**Response:**
```json
{
  "success": true,
  "data": {
    "audioFiles": [
      {
        "id": "audio-uuid",
        "originalName": "listening-exercise.mp3",
        "filename": "uploads/listening-exercise-9012.mp3",
        "mimetype": "audio/mpeg",
        "size": 2048000,
        "url": "/uploads/listening-exercise-9012.mp3",
        "duration": 120.5
      }
    ]
  },
  "message": "Audio files uploaded successfully",
  "timestamp": "2025-01-26T12:00:00Z"
}
```

#### POST `/media/video`
Upload video files for assessments.

**Authorization:** Teacher or Admin role required

**Response:**
```json
{
  "success": true,
  "data": {
    "videoFiles": [
      {
        "id": "video-uuid",
        "originalName": "demo-video.mp4",
        "filename": "uploads/demo-video-3456.mp4",
        "mimetype": "video/mp4",
        "size": 10485760,
        "url": "/uploads/demo-video-3456.mp4",
        "duration": 180.0,
        "dimensions": { "width": 1920, "height": 1080 }
      }
    ]
  },
  "message": "Video files uploaded successfully",
  "timestamp": "2025-01-26T12:00:00Z"
}
```

### Static File Serving

#### GET `/uploads/:filename`
Serve uploaded files (images, audio, video, documents).

**Example:** `GET /uploads/question-image-1234.png`

---

## Database Schema

### Assessment Tables

```sql
-- Core assessments table
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    time_limit INTEGER,           -- Minutes
    max_attempts INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL,
    required BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question types enum
CREATE TYPE question_type AS ENUM (
    'multiple_choice',
    'true_false', 
    'short_answer',
    'essay',
    'fill_blank',
    'matching',
    'ordering'
);

-- Media files table
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance

```sql
-- Assessment indexes
CREATE INDEX idx_assessments_created_by ON assessments(created_by);
CREATE INDEX idx_assessments_published ON assessments(is_published) WHERE is_published = true;
CREATE INDEX idx_assessments_created_at ON assessments(created_at);
CREATE INDEX idx_assessments_title_search ON assessments USING gin(to_tsvector('english', title));

-- Question indexes
CREATE INDEX idx_questions_assessment_id ON questions(assessment_id);
CREATE INDEX idx_questions_order ON questions(assessment_id, order_index);
CREATE INDEX idx_questions_type ON questions(type);

-- Media file indexes
CREATE INDEX idx_media_assessment_id ON media_files(assessment_id);
CREATE INDEX idx_media_question_id ON media_files(question_id);
CREATE INDEX idx_media_uploaded_by ON media_files(uploaded_by);
```

### Data Relationships

```mermaid
erDiagram
    ASSESSMENTS ||--o{ QUESTIONS : contains
    ASSESSMENTS ||--o{ MEDIA_FILES : "has attachments"
    QUESTIONS ||--o{ MEDIA_FILES : "has media"
    USERS ||--o{ ASSESSMENTS : creates
    USERS ||--o{ MEDIA_FILES : uploads
    
    ASSESSMENTS {
        uuid id PK
        string title
        text description
        text instructions
        integer time_limit
        integer max_attempts
        boolean is_published
        timestamp published_at
        jsonb settings
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    QUESTIONS {
        uuid id PK
        uuid assessment_id FK
        question_type type
        text title
        text description
        integer points
        integer order_index
        boolean required
        jsonb settings
        timestamp created_at
        timestamp updated_at
    }
    
    MEDIA_FILES {
        uuid id PK
        uuid assessment_id FK
        uuid question_id FK
        string filename
        string original_name
        string mime_type
        bigint file_size
        string file_path
        string thumbnail_path
        text description
        jsonb metadata
        uuid uploaded_by FK
        timestamp created_at
    }
```

---

## Media Management

### File Upload Architecture

#### Upload Processing Flow
```mermaid
flowchart TD
    A[File Upload Request] --> B{File Validation}
    B -->|Valid| C[Save Original File]
    B -->|Invalid| D[Return Error]
    
    C --> E{File Type Check}
    E -->|Image| F[Generate Thumbnail]
    E -->|Document| G[Extract Metadata]
    E -->|Audio/Video| H[Validate Format]
    
    F --> I[Save Thumbnail]
    G --> J[Store Metadata]
    H --> J
    I --> J
    
    J --> K[Create Database Record]
    K --> L[Return File Information]
```

#### File Validation Rules
```typescript
const fileValidation = {
  images: {
    maxSize: 10 * 1024 * 1024,      // 10 MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    dimensions: { maxWidth: 4096, maxHeight: 4096 }
  },
  documents: {
    maxSize: 25 * 1024 * 1024,      // 25 MB
    allowedTypes: ['application/pdf', 'application/msword', 'text/plain']
  },
  audio: {
    maxSize: 50 * 1024 * 1024,      // 50 MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4']
  }
};
```

#### Image Processing
```typescript
// Thumbnail generation using Sharp
import sharp from 'sharp';

const generateThumbnail = async (inputPath: string, outputPath: string) => {
  await sharp(inputPath)
    .resize(300, 300, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
};
```

### File Storage Structure

```
uploads/
├── files/                    # Original files
│   ├── 2025/10/              # Date-based organization
│   │   ├── assessment-uuid/   # Assessment-specific folders
│   │   │   ├── image1.jpg
│   │   │   ├── document1.pdf
│   │   │   └── audio1.mp3
├── thumbnails/               # Generated thumbnails
│   ├── 2025/10/
│   │   ├── assessment-uuid/
│   │   │   ├── image1-thumb.jpg
│   │   │   └── image2-thumb.jpg
└── temp/                     # Temporary upload processing
    ├── upload-session-uuid/
```

### Media API Integration

#### File Upload Endpoint
```typescript
// File upload with validation
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { assessmentId, questionId, description } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }
    
    // Validate file type and size
    const validation = validateFile(file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    // Process file based on type
    let thumbnailPath: string | undefined;
    if (file.mimetype.startsWith('image/')) {
      thumbnailPath = await generateThumbnail(file.path);
    }
    
    // Save to database
    const mediaFile = await mediaService.createMediaFile({
      assessmentId,
      questionId,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      thumbnailPath,
      description,
      uploadedBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: { file: mediaFile }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'File upload failed'
    });
  }
};
```

---

## Security & Authorization

### Role-Based Access Control

#### Permission Matrix

| Action | STUDENT | TEACHER | ADMIN |
|--------|---------|---------|-------|
| **Assessments** |
| View published assessments | ✅ | ✅ | ✅ |
| View draft assessments | ❌ | ✅ (own) | ✅ |
| Create assessments | ❌ | ✅ | ✅ |
| Edit assessments | ❌ | ✅ (own) | ✅ |
| Delete assessments | ❌ | ✅ (own) | ✅ |
| Publish assessments | ❌ | ✅ (own) | ✅ |
| **Questions** |
| View questions | ✅ (published) | ✅ | ✅ |
| Create questions | ❌ | ✅ | ✅ |
| Edit questions | ❌ | ✅ (own) | ✅ |
| Delete questions | ❌ | ✅ (own) | ✅ |
| **Media Files** |
| View media | ✅ (published) | ✅ | ✅ |
| Upload media | ❌ | ✅ | ✅ |
| Delete media | ❌ | ✅ (own) | ✅ |

#### Authorization Middleware
```typescript
// Ownership verification
export const verifyOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: assessmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Admin has access to everything
    if (userRole === 'ADMIN') {
      return next();
    }
    
    // Check ownership for teachers
    if (userRole === 'TEACHER') {
      const assessment = await assessmentService.findById(assessmentId);
      
      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'Assessment not found'
        });
      }
      
      if (assessment.createdBy !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only modify your own assessments'
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authorization check failed'
    });
  }
};
```

### Input Validation

#### Request Validation Schemas
```typescript
import Joi from 'joi';

// Assessment creation validation
export const createAssessmentSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(2000).optional(),
  instructions: Joi.string().max(5000).optional(),
  timeLimit: Joi.number().integer().min(1).max(480).optional(), // 8 hours max
  maxAttempts: Joi.number().integer().min(1).max(10).optional(),
  settings: Joi.object({
    shuffleQuestions: Joi.boolean().default(false),
    showResults: Joi.string().valid('immediately', 'after_submission', 'after_due_date').default('after_submission'),
    allowBacktrack: Joi.boolean().default(true),
    showCorrectAnswers: Joi.boolean().default(false)
  }).default({})
});

// Question creation validation
export const createQuestionSchema = Joi.object({
  type: Joi.string().valid('multiple_choice', 'true_false', 'short_answer', 'essay').required(),
  title: Joi.string().min(10).max(2000).required(),
  description: Joi.string().max(5000).optional(),
  points: Joi.number().integer().min(1).max(100).required(),
  required: Joi.boolean().default(true),
  settings: Joi.object().required()
});
```

### Data Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

// HTML content sanitization
export const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  });
};

// Text input sanitization
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML brackets
    .substring(0, 10000); // Limit length
};
```

---

## Testing Strategy

### Test Coverage Breakdown

| Test Category | Count | Focus Area | Coverage |
|---------------|-------|------------|----------|
| **Unit Tests** | 33 tests | Service logic, utilities, middleware | Core business logic |
| **Integration Tests** | 61 tests | API endpoints, database operations | Service integration |
| **Total** | **94 tests** | Complete service functionality | **100% pass rate** |

### Unit Testing Examples

#### Service Layer Tests
```typescript
describe('AssessmentService', () => {
  describe('createAssessment', () => {
    it('should create assessment with valid data', async () => {
      const assessmentData = {
        title: 'Test Assessment',
        description: 'Test description',
        timeLimit: 60,
        createdBy: 'user-uuid'
      };
      
      const mockAssessment = { id: 'uuid', ...assessmentData };
      prismaMock.assessment.create.mockResolvedValue(mockAssessment);
      
      const result = await assessmentService.createAssessment(assessmentData);
      
      expect(result).toEqual(mockAssessment);
      expect(prismaMock.assessment.create).toHaveBeenCalledWith({
        data: expect.objectContaining(assessmentData)
      });
    });
    
    it('should throw error for invalid data', async () => {
      const invalidData = { title: '' }; // Invalid title
      
      await expect(
        assessmentService.createAssessment(invalidData)
      ).rejects.toThrow('Title is required');
    });
  });
  
  describe('publishAssessment', () => {
    it('should publish assessment with valid questions', async () => {
      const assessmentId = 'uuid';
      const mockAssessment = {
        id: assessmentId,
        title: 'Test Assessment',
        questions: [{ id: 'q1', title: 'Question 1' }]
      };
      
      prismaMock.assessment.findUnique.mockResolvedValue(mockAssessment);
      prismaMock.assessment.update.mockResolvedValue({
        ...mockAssessment,
        isPublished: true,
        publishedAt: new Date()
      });
      
      const result = await assessmentService.publishAssessment(assessmentId);
      
      expect(result.isPublished).toBe(true);
      expect(result.publishedAt).toBeDefined();
    });
    
    it('should reject publishing assessment without questions', async () => {
      const assessmentId = 'uuid';
      const mockAssessment = {
        id: assessmentId,
        title: 'Test Assessment',
        questions: [] // No questions
      };
      
      prismaMock.assessment.findUnique.mockResolvedValue(mockAssessment);
      
      await expect(
        assessmentService.publishAssessment(assessmentId)
      ).rejects.toThrow('Cannot publish assessment without questions');
    });
  });
});
```

#### Media Service Tests
```typescript
describe('MediaService', () => {
  describe('uploadFile', () => {
    it('should upload image and generate thumbnail', async () => {
      const fileData = {
        filename: 'test.jpg',
        originalname: 'original.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        path: '/uploads/test.jpg'
      };
      
      const mockMediaFile = {
        id: 'uuid',
        ...fileData,
        thumbnailPath: '/uploads/thumbnails/test-thumb.jpg'
      };
      
      prismaMock.mediaFile.create.mockResolvedValue(mockMediaFile);
      
      const result = await mediaService.uploadFile(fileData, 'user-uuid');
      
      expect(result).toEqual(mockMediaFile);
      expect(result.thumbnailPath).toBeDefined();
    });
  });
});
```

### Integration Testing

#### API Endpoint Tests
```typescript
describe('POST /assessments', () => {
  it('should create assessment with valid data', async () => {
    const assessmentData = {
      title: 'Integration Test Assessment',
      description: 'Test description',
      timeLimit: 45,
      settings: {
        shuffleQuestions: true
      }
    };
    
    const response = await request(app)
      .post('/assessments')
      .set('x-user-id', 'teacher-uuid')
      .set('x-user-role', 'TEACHER')
      .set('x-user-email', 'teacher@test.com')
      .send(assessmentData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.assessment).toHaveProperty('id');
    expect(response.body.data.assessment.title).toBe(assessmentData.title);
    expect(response.body.data.assessment.isPublished).toBe(false);
  });
  
  it('should reject creation without proper role', async () => {
    const assessmentData = {
      title: 'Test Assessment'
    };
    
    const response = await request(app)
      .post('/assessments')
      .set('x-user-id', 'student-uuid')
      .set('x-user-role', 'STUDENT')
      .send(assessmentData)
      .expect(403);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('permission');
  });
});

describe('POST /media/upload', () => {
  it('should upload image file successfully', async () => {
    const response = await request(app)
      .post('/media/upload')
      .set('x-user-id', 'teacher-uuid')
      .set('x-user-role', 'TEACHER')
      .attach('file', Buffer.from('fake image data'), 'test.jpg')
      .field('assessmentId', 'assessment-uuid')
      .field('description', 'Test image')
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.file).toHaveProperty('url');
    expect(response.body.data.file).toHaveProperty('thumbnailUrl');
  });
});
```

### Performance Testing

#### Load Testing Configuration
```typescript
// k6 load testing script
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.1'],    // Less than 10% errors
  },
};

export default function() {
  // Test assessment listing
  let response = http.get('http://localhost:4001/assessments', {
    headers: {
      'x-user-id': 'load-test-user',
      'x-user-role': 'TEACHER'
    }
  });
  
  check(response, {
    'assessment list status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });
}
```

---

## Deployment Guide

### Docker Configuration

#### Production Dockerfile
```dockerfile
# Multi-stage build for production optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

FROM node:18-alpine AS runtime

# Install system dependencies for image processing
RUN apk add --no-cache \
    libc6-compat \
    vips-dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy application code
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads/files uploads/thumbnails uploads/temp && \
    chown -R nodejs:nodejs uploads

USER nodejs

EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4001/health || exit 1

CMD ["npm", "start"]
```

#### Docker Compose Configuration
```yaml
version: '3.8'

services:
  assessment-service:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4001:4001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://assessment:${DB_PASSWORD}@assessment-db:5432/assessmentdb
      - UPLOADS_PATH=/app/uploads
      - MAX_FILE_SIZE=50MB
    volumes:
      - assessment_uploads:/app/uploads
    depends_on:
      assessment-db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  assessment-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=assessmentdb
      - POSTGRES_USER=assessment
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - assessment_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U assessment -d assessmentdb"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  assessment_db_data:
  assessment_uploads:
```

### Environment Configuration

#### Production Environment Variables
```bash
# Application Configuration
NODE_ENV=production
PORT=4001
API_VERSION=v1
SERVICE_NAME=assessment-service

# Database Configuration
DATABASE_URL=postgresql://assessment:password@localhost:5433/assessmentdb
DATABASE_POOL_SIZE=25
DATABASE_TIMEOUT=30000

# File Upload Configuration
UPLOADS_PATH=/app/uploads
MAX_FILE_SIZE=52428800          # 50MB in bytes
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword,text/plain
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/mp4

# Image Processing
THUMBNAIL_SIZE=300
THUMBNAIL_QUALITY=80
MAX_IMAGE_DIMENSION=4096

# Security Configuration
CORS_ORIGIN=https://yourdomain.com
TRUST_PROXY=true
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
```

### Kubernetes Deployment

#### Service Deployment Manifest
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: assessment-service
  labels:
    app: assessment-service
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: assessment-service
  template:
    metadata:
      labels:
        app: assessment-service
    spec:
      containers:
      - name: assessment-service
        image: pediafor/assessment-service:latest
        ports:
        - containerPort: 4001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: assessment-secrets
              key: database-url
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        volumeMounts:
        - name: uploads-storage
          mountPath: /app/uploads
        livenessProbe:
          httpGet:
            path: /health
            port: 4001
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 4001
          initialDelaySeconds: 10
          periodSeconds: 10
      volumes:
      - name: uploads-storage
        persistentVolumeClaim:
          claimName: assessment-uploads-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: assessment-service
spec:
  selector:
    app: assessment-service
  ports:
  - port: 4001
    targetPort: 4001
  type: ClusterIP
```

#### Persistent Volume for File Storage
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: assessment-uploads-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 100Gi
  storageClassName: fast-ssd
```

---

## Performance & Optimization

### Performance Metrics

#### Target Response Times
- **Assessment CRUD**: < 200ms (p95)
- **File Upload**: < 2s for files under 10MB
- **Thumbnail Generation**: < 500ms
- **Database Queries**: < 50ms (p95)

#### Optimization Strategies

##### Database Optimization
```typescript
// Optimized assessment query with selective loading
const getAssessments = async (filters: AssessmentFilters) => {
  return await prisma.assessment.findMany({
    where: {
      isPublished: filters.published,
      createdBy: filters.createdBy,
      title: filters.search ? {
        contains: filters.search,
        mode: 'insensitive'
      } : undefined
    },
    select: {
      id: true,
      title: true,
      description: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          questions: true
        }
      },
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      [filters.sortBy]: filters.sortOrder
    },
    take: filters.limit,
    skip: (filters.page - 1) * filters.limit
  });
};
```

##### File Processing Optimization
```typescript
// Async file processing with queue
import Bull from 'bull';

const fileProcessingQueue = new Bull('file processing', {
  redis: { port: 6379, host: 'localhost' }
});

// Process thumbnails asynchronously
fileProcessingQueue.process('generate-thumbnail', async (job) => {
  const { filePath, outputPath } = job.data;
  
  await sharp(filePath)
    .resize(300, 300, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
    
  return { thumbnailPath: outputPath };
});

// Add job to queue
export const queueThumbnailGeneration = (filePath: string, outputPath: string) => {
  return fileProcessingQueue.add('generate-thumbnail', {
    filePath,
    outputPath
  });
};
```

### Monitoring Implementation

#### Health Check Endpoint
```typescript
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Database health
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;
    
    // File system health
    const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    await fs.access(uploadsPath, fs.constants.W_OK);
    
    // Memory usage
    const memUsage = process.memoryUsage();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV,
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`
      },
      storage: {
        status: 'accessible',
        path: uploadsPath
      },
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      }
    };
    
    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
```

#### Metrics Collection
```typescript
// Prometheus metrics
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const metrics = {
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status']
  }),
  
  fileUploads: new Counter({
    name: 'file_uploads_total',
    help: 'Total number of file uploads',
    labelNames: ['type', 'result']
  }),
  
  assessmentOperations: new Counter({
    name: 'assessment_operations_total',
    help: 'Total number of assessment operations',
    labelNames: ['operation', 'result']
  }),
  
  activeAssessments: new Gauge({
    name: 'active_assessments_total',
    help: 'Number of published assessments'
  })
};
```

---

## Development Guidelines

### Code Organization

#### Service Layer Structure
```
src/
├── controllers/          # HTTP request handlers
│   ├── assessmentController.ts
│   ├── questionController.ts
│   └── mediaController.ts
├── services/            # Business logic layer
│   ├── assessmentService.ts
│   ├── questionService.ts
│   └── mediaService.ts
├── middleware/          # Request processing middleware
│   ├── auth.ts
│   ├── validation.ts
│   └── upload.ts
├── routes/             # API route definitions
│   ├── assessments.ts
│   ├── questions.ts
│   └── media.ts
├── utils/              # Utility functions
│   ├── fileUtils.ts
│   ├── validation.ts
│   └── sanitization.ts
├── types/              # TypeScript type definitions
│   ├── assessment.ts
│   ├── question.ts
│   └── media.ts
└── app.ts             # Express application setup
```

#### Development Workflow

```bash
# Development setup
cd services/assessment-service
npm install
cp .env.example .env

# Start database
docker-compose up assessment-db -d

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

### Coding Standards

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

#### API Response Standards
```typescript
// Standardized API response format
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Success response helper
export const successResponse = <T>(data: T, pagination?: any): ApiResponse<T> => ({
  success: true,
  data,
  ...(pagination && { pagination })
});

// Error response helper
export const errorResponse = (error: string, code?: string): ApiResponse => ({
  success: false,
  error,
  ...(code && { code })
});
```

### Contributing Guidelines

#### Pull Request Checklist
- [ ] All tests pass locally (`npm test`)
- [ ] Code follows TypeScript/ESLint standards
- [ ] New features have corresponding tests
- [ ] Documentation updated if necessary
- [ ] Database migrations tested
- [ ] Performance impact considered
- [ ] Security implications reviewed

#### Git Workflow
```bash
# Create feature branch
git checkout -b feature/assessment-duplication

# Make changes and commit
git add .
git commit -m "feat: add assessment duplication functionality"

# Push and create PR
git push origin feature/assessment-duplication
```

---

## API Reference Summary

### Quick Reference

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Service info | ❌ |
| `/health` | GET | Health check | ❌ |
| `/assessments` | GET | List assessments | ✅ |
| `/assessments/:id` | GET | Get assessment details | ✅ |
| `/assessments` | POST | Create assessment | ✅ (Teacher/Admin) |
| `/assessments/:id` | PUT | Update assessment | ✅ (Owner/Admin) |
| `/assessments/:id` | DELETE | Delete assessment | ✅ (Owner/Admin) |
| `/assessments/:id/publish` | POST | Publish assessment | ✅ (Owner/Admin) |
| `/assessments/:id/duplicate` | POST | Duplicate assessment | ✅ (Teacher/Admin) |
| `/media/question` | POST | Upload question media | ✅ (Teacher/Admin) |
| `/media/option` | POST | Upload option images | ✅ (Teacher/Admin) |
| `/media/audio` | POST | Upload audio files | ✅ (Teacher/Admin) |
| `/media/video` | POST | Upload video files | ✅ (Teacher/Admin) |
| `/uploads/:filename` | GET | Serve uploaded files | ❌ |

---

*Documentation last updated: October 2025*  
*Service version: 1.0.0*  
*Production ready: ✅*