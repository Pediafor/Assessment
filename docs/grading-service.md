# Grading Service — Comprehensive Documentation

[![Status](https://img.shields.io/badge/status-production--ready-success)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)](.)
[![Event Integration](https://img.shields.io/badge/Events-RabbitMQ%20Ready-FF6600?logo=rabbitmq)](.)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](.)
[![MCQ Grading](https://img.shields.io/badge/Feature-Automated%20MCQ%20Grading-brightgreen)](.)
[![Port](https://img.shields.io/badge/Port-4003-blue)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](.)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=nodedotjs)](.)

---

## Table of Contents

1. [Service Overview](#service-overview)
2. [Features](#features)
3. [Architecture & Design](#architecture--design)
4. [API Documentation](#api-documentation)
5. [Grading Algorithms](#grading-algorithms)
6. [Database Schema](#database-schema)
7. [Development Setup](#development-setup)

---

## Service Overview

The **Grading Service** is an automated evaluation engine for the Pediafor Assessment Platform. It provides scoring of student submissions, focusing on multiple-choice and true/false questions.

---

## Features

- **Automated MCQ Grading**: Evaluates multiple-choice and true/false questions.
- **Partial Credit**: Supports partial credit for multi-select questions.
- **Event-Driven**: Publishes `grading.completed` and `grading.failed` events.

---

## Architecture & Design

The service is a standard Node.js application using Express.js, TypeScript, and Prisma.

---

## API Documentation

### Core Endpoints

- `POST /`: Grade a submission
- `GET /submission/:submissionId`: Get grade by submission ID
- `GET /user/:userId`: Get grades by user ID
- `GET /assessment/:assessmentId`: Get grades by assessment ID
- `GET /my-grades`: Get grades for the current user
- `GET /queue`: Teacher manual grading queue (TEACHER/ADMIN)
- `GET /analytics/teacher/overview`: Teacher overview stats (TEACHER/ADMIN)
- `PUT /submission/:submissionId/question/:questionId`: Manual per-question grading (TEACHER/ADMIN)

---

## Grading Algorithms

The service currently supports automated grading for:

- **Multiple-Choice Questions**: Both single-select and multi-select.
- **True/False Questions**

Other question types, like text and file uploads, are marked as requiring manual grading.

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

model Grade {
  id              String    @id @default(cuid())
  submissionId    String    @unique
  assessmentId    String
  userId          String
  totalScore      Float
  maxScore        Float
  percentage      Float
  gradedAt        DateTime  @default(now())
  gradedBy        String?
  isAutomated     Boolean   @default(true)
  feedback        String?
  questionGrades  QuestionGrade[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("grades")
}

model QuestionGrade {
  id              String    @id @default(cuid())
  gradeId         String
  questionId      String
  pointsEarned    Float
  maxPoints       Float
  isCorrect       Boolean?
  studentAnswer   Json?
  correctAnswer   Json?
  feedback        String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  grade           Grade     @relation(fields: [gradeId], references: [id], onDelete: Cascade)
  
  @@map("question_grades")
}

model GradeAnalytics {
  id              String    @id @default(cuid())
  assessmentId    String    @unique
  totalSubmissions Int
  averageScore     Float
  medianScore      Float
  standardDeviation Float
  minScore         Float
  maxScore         Float
  scoreDistribution Json
  questionStats    Json
  calculatedAt     DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@map("grade_analytics")
}

model GradingConfig {
  id              String    @id @default(cuid())
  assessmentId    String    @unique
  gradingMethod   GradingMethod @default(AUTOMATED)
  allowPartialCredit Boolean @default(true)
  penaltyPerWrongAnswer Float?
  mcqScoringType  MCQScoringType @default(STANDARD)
  autoGradeOnSubmit Boolean @default(true)
  releaseGradesImmediately Boolean @default(false)
  showCorrectAnswers Boolean @default(false)
  showFeedback      Boolean @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  
  @@map("grading_configs")
}

enum GradingMethod {
  AUTOMATED
  MANUAL
  HYBRID
}

enum MCQScoringType {
  STANDARD
  PARTIAL_CREDIT
  NEGATIVE_MARKING
}
```

---

## Development Setup

```bash
# Clone repository
git clone <repository-url>
cd services/grading-service

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

Docs Version: 1.3 • Last Updated: October 20, 2025