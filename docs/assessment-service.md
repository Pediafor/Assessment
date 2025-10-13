# Assessment Service - Comprehensive Documentation

[![Status](https://img.shields.io/badge/Status-Production%20Ready%20%26%20Operational-success)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)](.)
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

---

## API Documentation

### Assessment Endpoints

*   `POST /assessments`: Create new assessment
*   `GET /assessments`: Get all assessments
*   `GET /assessments/:id`: Get assessment by ID
*   `PUT /assessments/:id`: Update assessment
*   `DELETE /assessments/:id`: Delete assessment
*   `POST /assessments/:id/publish`: Publish assessment
*   `POST /assessments/:id/duplicate`: Duplicate assessment

### Media Endpoints

*   `POST /media/question`: Upload question media
*   `POST /media/option`: Upload option media
*   `POST /media/audio`: Upload audio files
*   `POST /media/video`: Upload video files

---

## Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  
  @@index([createdBy, status])
  @@index([status, isActive])
  @@index([createdAt])
  @@map("assessments")
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
  
  @@unique([assessmentId, setNumber])
  @@index([assessmentId, displayOrder])
  @@map("question_sets")
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
  
  @@index([questionSetId, displayOrder])
  @@index([type, difficulty])
  @@index([tags])
  @@map("questions")
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
  
  @@index([questionId, displayOrder])
  @@map("question_media")
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
  
  @@index([questionId, displayOrder])
  @@map("question_options")
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
  
  @@index([optionId, displayOrder])
  @@map("option_media")
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

---

## Development Guidelines

### Code Organization

```
src/
├── prismaClient.ts
├── server.ts
├── types.ts
├── config/
├── events/
├── middleware/
├── routes/
│   ├── assessment.routes.ts
│   └── media.routes.ts
├── services/
├── types/
└── utils/
```

---

*Documentation last updated: October 13, 2025*
