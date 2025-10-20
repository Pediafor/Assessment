# Pediafor Assessment Platform — API Documentation

[![API](https://img.shields.io/badge/api-v1.0-blue)](.)
[![Base URL](https://img.shields.io/badge/base-url%20via%20gateway%20aliases%20%2F%20api-gray)](.)
[![Auth](https://img.shields.io/badge/auth-PASETO%20v4-green)](.)
[![Content Type](https://img.shields.io/badge/content-application%2Fjson-blue)](.)
[![Rate Limit](https://img.shields.io/badge/rate%20limit-100%20req%2F15min-yellow)](.)
[![Status](https://img.shields.io/badge/status-production--ready-success)](.)

## Table of Contents

1. [Authentication](#authentication)
2. [User Service API](#user-service-api)
3. [Assessment Service API](#assessment-service-api)
4. [Media Service API](#media-service-api)
5. [Submission Service API](#submission-service-api)
6. [File Service API](#file-service-api)
7. [Grading Service API](#grading-service-api)
8. [Notification Service API](#notification-service-api)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [Examples](#examples)

---

## Authentication

All API requests (except registration and login) require authentication via PASETO V4 tokens.

### Authentication Methods

#### 1. Cookie-Based Authentication (Recommended for Web)
```http
Cookie: sessionId=user-uuid-here
```

#### 2. Bearer Token Authentication (API/Mobile)
```http
Authorization: Bearer v4.public.eyJ...
```

### Token Structure
```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com", 
  "role": "STUDENT" | "TEACHER" | "ADMIN",
  "iat": "2025-10-13T12:00:00Z",
  "exp": "2025-10-13T16:00:00Z"
}
```

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_01HQRS2...",
    "email": "student@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "createdAt": "2025-10-13T12:00:00Z"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_01HQRS2...",
    "email": "student@university.edu", 
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  },
  "accessToken": "v4.public.eyJ..."
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

**Response (200 OK):**
```json
{
  "accessToken": "v4.public.eyJ..."
}
```

#### Logout User
```http
POST /api/auth/logout
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

## User Service API

Base URL: `/api/users` (aliases available at `/users` via gateway)

### Get User Profile
```http
GET /api/users/:id
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
    "id": "user_01HQRS2...",
    "email": "student@university.edu",
    "firstName": "John", 
    "lastName": "Doe",
    "role": "STUDENT",
    "lastLoginAt": "2025-10-13T11:30:00Z",
    "createdAt": "2025-10-12T14:22:00Z",
    "updatedAt": "2025-10-13T11:30:00Z"
}
```

### Update User Profile
```http
PUT /api/users/:id
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "firstName": "Jonathan",
  "lastName": "Smith",
  "profilePicture": "https://example.com/new-profile.jpg",
  "metadata": {
    "bio": "A short bio"
  }
}
```

**Response (200 OK):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "user_01HQRS2...",
    "email": "student@university.edu",
    "firstName": "Jonathan",
    "lastName": "Smith",
    "role": "STUDENT",
    "updatedAt": "2025-10-13T12:15:00Z"
  }
}
```

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

### List Users (Admin Only)
```http
GET /api/users?page=1&limit=20&role=STUDENT
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "user_01HQRS2...",
      "email": "student1@university.edu",
      "firstName": "John",
      "lastName": "Doe", 
      "role": "STUDENT",
      "createdAt": "2025-10-12T14:22:00Z"
    }
  ],
  "total": 150
}
```

---

## Assessment Service API

Base URL: `/api/assessments` (aliases available at `/assessments`)

### List Assessments
```http
GET /api/assessments?page=1&limit=10&status=PUBLISHED
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assessments": [
      {
        "id": "assessment_01HQR...",
        "title": "Introduction to Programming",
        "description": "Basic programming concepts assessment",
        "status": "PUBLISHED",
        "createdBy": "teacher_01HQR...",
        "createdAt": "2025-10-12T10:00:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "timestamp": "2025-10-13T12:00:00Z"
}
```

Notes:
- Students will only see assessments with status=PUBLISHED (created by any teacher). Teachers see their own by default; Admins see all. Status filtering applies for teachers/admins.

### Get Assessment Details
```http
GET /api/assessments/:id
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "assessment_01HQR...",
    "title": "Introduction to Programming",
    "description": "Basic programming concepts assessment",
    "instructions": "Answer all questions within the time limit",
    "status": "PUBLISHED",
    "createdBy": "teacher_01HQR...",
    "settings": {
      "duration": 60,
      "maxAttempts": 1
    }
  },
  "timestamp": "2025-10-13T12:00:00Z"
}
```

### Create Assessment (Teacher/Admin)
```http
POST /api/assessments
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "title": "Web Development Fundamentals",
  "description": "HTML, CSS, and JavaScript basics",
  "instructions": "Complete all sections within the time limit",
  "settings": {
    "duration": 90,
    "maxAttempts": 2
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "assessment_01HQS...",
    "title": "Web Development Fundamentals", 
    "description": "HTML, CSS, and JavaScript basics",
    "status": "DRAFT",
    "createdBy": "teacher_01HQR...",
    "createdAt": "2025-10-13T12:00:00Z"
  },
  "message": "Assessment created successfully",
  "timestamp": "2025-10-13T12:00:00Z"
}
```

### Update Assessment (Teacher/Admin)
```http
PUT /api/assessments/:id
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "title": "Advanced Web Development",
  "description": "Advanced topics in web development"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "assessment_01HQS...",
    "title": "Advanced Web Development",
    "description": "Advanced topics in web development",
    "status": "DRAFT",
    "createdBy": "teacher_01HQR...",
    "updatedAt": "2025-10-13T12:15:00Z"
  },
  "message": "Assessment updated successfully",
  "timestamp": "2025-10-13T12:15:00Z"
}
```

### Delete Assessment (Teacher/Admin)
```http
DELETE /api/assessments/:id
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assessment deleted successfully",
  "timestamp": "2025-10-13T12:20:00Z"
}
```

### Publish Assessment (Teacher/Admin)
```http
POST /api/assessments/:id/publish
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "assessment_01HQS...",
    "status": "PUBLISHED",
    "publishedAt": "2025-10-13T12:15:00Z"
  },
  "message": "Assessment published successfully",
  "timestamp": "2025-10-13T12:15:00Z"
}
```

### Duplicate Assessment (Teacher/Admin)
```http
POST /api/assessments/:id/duplicate
Authorization: Bearer v4.public.eyJ...
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "assessment_01HQT...",
    "title": "Copy of Web Development Fundamentals",
    "status": "DRAFT"
  },
  "message": "Assessment duplicated successfully",
  "timestamp": "2025-10-13T12:30:00Z"
}
```

---

## Media Service API

Base URL: `/api/media`

### Upload Question Media
```http
POST /api/media/question
Authorization: Bearer v4.public.eyJ...
Content-Type: multipart/form-data
```

### Upload Option Media
```http
POST /api/media/option
Authorization: Bearer v4.public.eyJ...
Content-Type: multipart/form-data
```

### Upload Audio
```http
POST /api/media/audio
Authorization: Bearer v4.public.eyJ...
Content-Type: multipart/form-data
```

### Upload Video
```http
POST /api/media/video
Authorization: Bearer v4.public.eyJ...
Content-Type: multipart/form-data
```

---

## Submission Service API

Base URL: `/api/submissions` (aliases available at `/submissions`)

### Create Submission
```http
POST /api/submissions
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "assessmentId": "assessment_01HQR..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "submission_01HQT...",
    "userId": "user_01HQRS2...",
    "assessmentId": "assessment_01HQR...",
    "status": "DRAFT",
    "createdAt": "2025-10-13T12:00:00Z"
  },
  "message": "Submission created successfully"
}
```

### Save Answers
```http
POST /api/submissions/:id/answers
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "answers": {
    "question_01HQR001": "A container for storing data"
  }
}
```

Notes:
- Request body may contain additional fields (e.g., metadata such as current index/flags) but the service persists only the `answers` object.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "submission_01HQT...",
    "updatedAt": "2025-10-13T12:05:00Z"
  },
  "message": "Answers saved successfully"
}
```

### Submit for Grading
```http
POST /api/submissions/:id/submit
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "submission_01HQT...",
    "status": "SUBMITTED",
    "submittedAt": "2025-10-13T12:30:00Z"
  },
  "message": "Submission submitted successfully"
}
```

### Get Submission
```http
GET /api/submissions/:id
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "submission_01HQT...",
    "userId": "user_01HQRS2...",
    "assessmentId": "assessment_01HQR...",
    "status": "SUBMITTED",
    "submittedAt": "2025-10-13T12:30:00Z"
  }
}
```

### List Submissions
```http
GET /api/submissions?assessmentId=assessment_01HQR...
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "submission_01HQT...",
      "userId": "user_01HQRS2...",
      "status": "SUBMITTED"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

Notes:
- Students will only receive their own submissions. Teachers/Admins can filter by assessmentId, studentId, and status.

---

## File Service API

Base URL: `/api`

### Upload File
```http
POST /api/submissions/:submissionId/files
Authorization: Bearer v4.public.eyJ...
Content-Type: multipart/form-data
```

### Get Submission Files
```http
GET /api/submissions/:submissionId/files
Authorization: Bearer v4.public.eyJ...
```

### Get File Stats
```http
GET /api/submissions/:submissionId/files/stats
Authorization: Bearer v4.public.eyJ...
```

### Get File Details
```http
GET /api/files/:fileId
Authorization: Bearer v4.public.eyJ...
```

### Download File
```http
GET /api/files/:fileId/download
Authorization: Bearer v4.public.eyJ...
```

### Delete File
```http
DELETE /api/files/:fileId
Authorization: Bearer v4.public.eyJ...
```

---

## Grading Service API

Base URL: `/api/grade` (aliases available at `/grade`)

### Grade Submission
```http
POST /api/grade
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "submissionId": "submission_01HQT...",
  "forceRegrade": false
}
```

### Get Grade by Submission
```http
GET /api/grade/submission/:submissionId
Authorization: Bearer v4.public.eyJ...
```

### Get Grades by User
```http
GET /api/grade/user/:userId
Authorization: Bearer v4.public.eyJ...
```

### Get Grades by Assessment
```http
GET /api/grade/assessment/:assessmentId
Authorization: Bearer v4.public.eyJ...
```

### Get My Grades
```http
GET /api/grade/my-grades
Authorization: Bearer v4.public.eyJ...
```

---

## Notification Service API

Base URL: `/`

### Health Check
```http
GET /health
```

### Behavior
- Subscribes to `grading.completed` events from RabbitMQ (exchange: `grading`, routing key: `grading.completed`).
- On event, fetches the student by `studentId` from User Service and sends an email using configured SMTP credentials.

### Environment Variables
- `AMQP_URL`: RabbitMQ connection string
- `USER_SERVICE_URL`: Internal URL to the User Service (e.g., http://user-service:4000 or http://localhost:4000)
- `FRONTEND_URL`: Base URL for deep links in emails
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`: SMTP settings

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided"
  },
  "timestamp": "2025-10-13T12:00:00Z"
}
```

---

---

Docs Version: 1.3 • Last Updated: October 20, 2025
**Support**: [api-support@pediafor.com](mailto:api-support@pediafor.com) | **Status Page**: [status.pediafor.com](https://status.pediafor.com)
