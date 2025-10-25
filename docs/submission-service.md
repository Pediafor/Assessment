# Submission Service - Comprehensive Documentation

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)](.)
[![File Upload](https://img.shields.io/badge/File%20Upload-Complete%20System-brightgreen)](.)
[![Event Integration](https://img.shields.io/badge/Events-RabbitMQ%20Ready-FF6600?logo=rabbitmq)](.)
[![Port](https://img.shields.io/badge/Port-4002-blue)](.)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](.)
[![Express](https://img.shields.io/badge/Express.js-4.x-green?logo=express)](.)

## Table of Contents

1. [Service Overview](#service-overview)
2. [Features](#features)
3. [API Documentation](#api-documentation)
4. [Database Schema](#database-schema)
5. [Development Setup](#development-setup)

---

## Service Overview

The Submission Service is a core microservice in the Pediafor Assessment Platform responsible for managing the complete student submission lifecycle.

---

## Features

- **Submission Management**: CRUD operations for student submissions.
- **Answer Management**: Flexible JSON-based answer storage.
- **File Upload System**: Multer-based file upload with validation.
- **Event-Driven**: Publishes submission lifecycle events.

---

## API Documentation

### Submission Endpoints

- `POST /`: Create a new submission.
- `GET /:id`: Get submission by ID.
- `GET /`: Get submissions with filtering.
- `GET /assessment/:assessmentId`: Get submission by assessment ID.
- `PUT /:id`: Update a submission.
- `POST /:id/submit`: Submit a submission for grading.
- `POST /:id/answers`: Save/update answers in a submission.
- `GET /stats/:assessmentId`: Get submission statistics for an assessment.
- `DELETE /:id`: Delete a submission.

### File Endpoints

- `POST /submissions/:submissionId/files`: Upload a file to a submission.
- `GET /submissions/:submissionId/files`: Get all files for a submission.
- `GET /submissions/:submissionId/files/stats`: Get file statistics for a submission.
- `GET /files/:fileId`: Get file details.
- `GET /files/:fileId/download`: Download a file.
- `DELETE /files/:fileId`: Delete a file.

---

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Submission {
  id           String   @id @default(cuid())
  assessmentId String
  userId       String
  answers      Json
  status       SubmissionStatus @default(DRAFT)
  score        Float?
  maxScore     Float?
  startedAt    DateTime @default(now())
  submittedAt  DateTime?
  gradedAt     DateTime?
  ipAddress    String?
  userAgent    String?
  checksum     String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  files        SubmissionFile[]
  grades       Grade[]
  attempts     AttemptLog[]
  
  @@map("submissions")
  @@index([assessmentId])
  @@index([userId])
  @@index([status])
}

model SubmissionFile {
  id           String   @id @default(cuid())
  submissionId String
  originalName String
  fileName     String
  filePath     String
  mimeType     String
  fileSize     Int
  questionId   String?
  description  String?
  thumbnail    String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  
  @@map("submission_files")
  @@index([submissionId])
}

model Grade {
  id           String      @id @default(cuid())
  submissionId String
  questionId   String?
  score        Float
  maxScore     Float
  feedback     String?
  gradedBy     String?
  gradingType  GradingType @default(AUTO)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  
  @@map("grades")
  @@index([submissionId])
  @@index([questionId])
}

model AttemptLog {
  id           String        @id @default(cuid())
  submissionId String
  action       AttemptAction
  data         Json?
  ipAddress    String?
  userAgent    String?
  
  createdAt    DateTime @default(now())
  
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  
  @@map("attempt_logs")
  @@index([submissionId])
  @@index([createdAt])
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  GRADING
  GRADED
  PUBLISHED
  ARCHIVED
}

enum GradingType {
  AUTO
  MANUAL
  HYBRID
  PEER
}

enum AttemptAction {
  CREATED
  SAVED
  UPDATED
  SUBMITTED
  FILE_ADDED
  FILE_REMOVED
  GRADED
  PUBLISHED
  ARCHIVED
}
```

---

## Development Setup

```bash
# Clone repository
git clone <repository-url>
cd services/submission-service

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Database setup
npx prisma db push
npx prisma generate

# Start development server
npm run dev

# Run tests
npm test
```

---

*Documentation last updated: October 13, 2025*
