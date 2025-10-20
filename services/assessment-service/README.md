# Assessment Service — Pediafor Assessment Platform

[![Status](https://img.shields.io/badge/status-production--ready-success)](.)
[![Port](https://img.shields.io/badge/port-4001-blue)](.)
[![Runtime](https://img.shields.io/badge/runtime-Node.js%2018+-brightgreen?logo=nodedotjs)](.)
[![Lang](https://img.shields.io/badge/lang-TypeScript%205.x-blue?logo=typescript)](.)

## Overview

The Assessment Service is a core microservice in the Pediafor Assessment Platform, responsible for managing assessments, questions, and media.

## Features

- **Assessment Management**: Full CRUD operations for assessments.
- **Question Management**: Support for various question types.
- **Media Management**: File uploads for questions and options.
- **Event-Driven**: Publishes and subscribes to events via RabbitMQ.

## Architecture

The service is a standard Node.js application using Express.js, TypeScript, and Prisma. It has its own PostgreSQL database and communicates with other services via REST APIs and RabbitMQ.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Messaging**: RabbitMQ with amqplib
- **Image Processing**: sharp
- **Testing**: Jest, Supertest

## API Endpoints

### Assessment Endpoints

- `POST /assessments`: Create new assessment
- `GET /assessments`: Role-aware listing (Students see only `PUBLISHED`; Teachers see own; Admins see all). Optional `status` filter applies for teachers/admins. Supports pagination via `page` and `limit`.
- `GET /assessments?status=PUBLISHED`: Recommended for students to explicitly filter published assessments.
- `GET /assessments/:id`: Get assessment by ID
- `PUT /assessments/:id`: Update assessment
- `DELETE /assessments/:id`: Delete assessment
- `POST /assessments/:id/publish`: Publish assessment
- `POST /assessments/:id/duplicate`: Duplicate assessment

#### Notes

- Students receive only assessments with status `PUBLISHED` regardless of creator. Teachers see their own assessments and may filter by `status`; Admins can view all.
- The list endpoint returns `{ assessments: Assessment[], meta: { page, limit, total, totalPages } }` inside the `data` field of the standard API response wrapper.

Note: Through the API Gateway, protected alias routes are available at `/assessments/*`.

### Media Endpoints

- `POST /media/question`: Upload question media
- `POST /media/option`: Upload option media
- `POST /media/audio`: Upload audio files
- `POST /media/video`: Upload video files

## Database Schema

```prisma
model Assessment {
  id          String            @id @default(cuid())
  title       String
  description String?
  instructions String?
  createdBy   String
  status      AssessmentStatus  @default(DRAFT)
  settings    Json?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  isActive    Boolean           @default(true)
  questionSets QuestionSet[]
}

model QuestionSet {
  id              String      @id @default(cuid())
  assessmentId    String
  setNumber       Int
  name            String
  description     String?
  instructions    String?
  timeLimit       Int?
  selectionConfig Json?
  displayOrder    Int         @default(0)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  isActive        Boolean     @default(true)
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
  negativeMarking Float?
  difficulty      Difficulty        @default(MEDIUM)
  tags            String[]
  hints           String[]
  explanation     String?
  timeLimit       Int?
  metadata        Json?
  displayOrder    Int               @default(0)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  isActive        Boolean           @default(true)
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
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  question     Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
}

model QuestionOption {
  id           String        @id @default(cuid())
  questionId   String
  optionText   String
  isCorrect    Boolean       @default(false)
  explanation  String?
  displayOrder Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
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
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  option       QuestionOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
}

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

## Development

To run this service locally:

```bash
cd services/assessment-service
npm install
cp .env.example .env
# Update .env with your database connection string
docker-compose up -d assessment-db
npx prisma migrate dev
npm run dev
```

---

Docs Version: 1.3 • Last Updated: October 20, 2025