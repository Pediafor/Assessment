# Grading Service — Pediafor Assessment Platform

[![Status](https://img.shields.io/badge/status-production--ready-success)](.)
[![Port](https://img.shields.io/badge/port-4003-blue)](.)
[![Runtime](https://img.shields.io/badge/runtime-Node.js%2018+-brightgreen?logo=nodedotjs)](.)
[![Lang](https://img.shields.io/badge/lang-TypeScript%205.x-blue?logo=typescript)](.)

## Overview

The Grading Service is a microservice in the Pediafor Assessment Platform responsible for automated grading of student submissions.

## Features

- **Automated Grading**: Automatically grades multiple-choice and true/false questions.
- **Event-Driven**: Subscribes to `submission.submitted` events to trigger grading.
- **API**: Provides endpoints for retrieving grades.

## Architecture

The service is a standard Node.js application using Express.js, TypeScript, and Prisma. It has its own PostgreSQL database and communicates with other services via REST APIs and RabbitMQ.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Messaging**: RabbitMQ with amqplib
- **Testing**: Jest, Supertest

## API Endpoints

- `POST /`: Grade a submission
- `GET /submission/:submissionId`: Get grade by submission ID
- `GET /user/:userId`: Get grades by user ID
- `GET /assessment/:assessmentId`: Get grades by assessment ID
- `GET /my-grades`: Get grades for the current user
- `GET /queue`: Teacher manual grading queue (TEACHER/ADMIN)
- `GET /analytics/teacher/overview`: Teacher overview stats (TEACHER/ADMIN)
- `PUT /submission/:submissionId/question/:questionId`: Manual per-question grading (TEACHER/ADMIN)

Note: Through the API Gateway, protected alias routes are available at `/grade/*`.

## Database Schema

```prisma
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

## Development

To run this service locally:

```bash
cd services/grading-service
npm install
cp .env.example .env
# Update .env with your database connection string
docker-compose up -d grading-db
npx prisma migrate dev
npm run dev
```

---

Docs Version: 1.3 • Last Updated: October 20, 2025