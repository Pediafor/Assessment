# Submission Service — Pediafor Assessment Platform

[![Status](https://img.shields.io/badge/status-production--ready-success)](.)
[![Port](https://img.shields.io/badge/port-4002-blue)](.)
[![Runtime](https://img.shields.io/badge/runtime-Node.js%2018+-brightgreen?logo=nodedotjs)](.)
[![Lang](https://img.shields.io/badge/lang-TypeScript%205.x-blue?logo=typescript)](.)

## Overview

The Submission Service is a core microservice in the Pediafor Assessment Platform responsible for managing student submissions.

## Features

- **Submission Management**: Full CRUD operations for submissions.
- **Answer Management**: Flexible JSON-based answer storage.
- **File Uploads**: Support for attaching files to submissions.
- **Event-Driven**: Publishes events on submission status changes.

## Architecture

The service is a standard Node.js application using Express.js, TypeScript, and Prisma. It has its own PostgreSQL database and communicates with other services via REST APIs and RabbitMQ.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Messaging**: RabbitMQ with amqplib
- **File Uploads**: multer
- **Testing**: Jest, Supertest

## API Endpoints

### Submission Endpoints

- `POST /`: Create a new submission.
- `GET /:id`: Get submission by ID.
- `GET /`: Get submissions with filtering.
- `GET /assessment/:assessmentId`: Get submission by assessment ID.
- `PUT /:id`: Update a submission.
- `POST /:id/submit`: Submit a submission for grading.
- `POST /:id/answers`: Save/update answers in a submission. Request body must include `{ answers: Record<string, any> }`. Additional client metadata may be sent but will be ignored by the service.
- `GET /stats/:assessmentId`: Get submission statistics for an assessment.
- `DELETE /:id`: Delete a submission.

### File Endpoints

- `POST /submissions/:submissionId/files`: Upload a file to a submission.
- `GET /submissions/:submissionId/files`: Get all files for a submission.
- `GET /submissions/:submissionId/files/stats`: Get file statistics for a submission.
- `GET /files/:fileId`: Get file details.
- `GET /files/:fileId/download`: Download a file.
- `DELETE /files/:fileId`: Delete a file.

## Database Schema

```prisma
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

## Development

To run this service locally:

```bash
cd services/submission-service
npm install
cp .env.example .env
# Update .env with your database connection string
docker-compose up -d submission-db
npx prisma db push
npm run dev
```

## Smoke test (via Gateway aliases)

```bash
# Health (direct service when port exposed)
curl -s http://localhost:4002/health

# Create submission (student token)
curl -s -X POST http://localhost:3000/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assessmentId":"ASSESSMENT_ID"}'

# Save answers
curl -s -X POST http://localhost:3000/submissions/SUBMISSION_ID/answers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers": {"q1":"A"}}'

# Submit
curl -s -X POST http://localhost:3000/submissions/SUBMISSION_ID/submit -H "Authorization: Bearer $TOKEN"
```

## Contributing

What makes it special:
- Flexible answers JSON with file attachments.
- Emits events for grading and audit trails.
- Pagination and teacher filters with sorting.

Starter issues/ideas:
- Add idempotency keys for autosave operations.
- Add checksums/signatures for tamper detection.
- Add bulk export/download for teacher workflows.

### Notes

- Listing submissions returns an array as `data` plus a `meta` object with pagination:
  ```json
  {
    "success": true,
    "data": [ /* submissions */ ],
    "meta": { "page": 1, "limit": 10, "total": 1 }
  }
  ```
  Students receive only their own submissions; teachers/admins can filter by `assessmentId`, `studentId`, `status`, with optional `sortBy` and `sortOrder`.

Note: Through the API Gateway, protected alias routes are available at `/submissions/*`.

---

Docs Version: 1.3 • Last Updated: October 20, 2025