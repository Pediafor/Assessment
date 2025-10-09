# Pediafor Assessment Platform - API Documentation

[![API Version](https://img.shields.io/badge/API%20Version-v1.0-blue)](.)
[![Base URL](https://img.shields.io/badge/Base%20URL-api.pediafor.com-gray)](.)
[![Authentication](https://img.shields.io/badge/Auth-PASETO%20V4%20Tokens-green)](.)
[![Content Type](https://img.shields.io/badge/Content%20Type-application%2Fjson-blue)](.)
[![Rate Limit](https://img.shields.io/badge/Rate%20Limit-100%20req%2F15min-yellow)](.)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](.)

## Table of Contents

1. [Authentication](#authentication)
2. [User Service API](#user-service-api)
3. [Assessment Service API](#assessment-service-api)
4. [Submission Service API](#submission-service-api)
5. [Grading Service API](#grading-service-api)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)

---

## Authentication

All API requests (except registration and login) require authentication via PASETO V4 tokens.

### Authentication Methods

#### 1. Cookie-Based Authentication (Recommended for Web)
```http
Cookie: token=v4.public.eyJ...
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
  "iat": "2025-10-06T12:00:00Z",
  "exp": "2025-10-06T16:00:00Z"
}
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
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
  "success": true,
  "data": {
    "user": {
      "id": "user_01HQRS2...",
      "email": "student@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "createdAt": "2025-10-06T12:00:00Z"
    },
    "token": "v4.public.eyJ..."
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
  "success": true,
  "data": {
    "user": {
      "id": "user_01HQRS2...",
      "email": "student@university.edu", 
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT"
    },
    "token": "v4.public.eyJ..."
  }
}
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Service API

Base URL: `/api/users`

### Get User Profile
```http
GET /api/users/profile/:id
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_01HQRS2...",
    "email": "student@university.edu",
    "firstName": "John", 
    "lastName": "Doe",
    "role": "STUDENT",
    "lastLoginAt": "2025-10-06T11:30:00Z",
    "createdAt": "2025-10-05T14:22:00Z",
    "updatedAt": "2025-10-06T11:30:00Z"
  }
}
```

### Update User Profile
```http
PUT /api/users/profile/:id
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "firstName": "Jonathan",
  "lastName": "Smith"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_01HQRS2...",
    "email": "student@university.edu",
    "firstName": "Jonathan",
    "lastName": "Smith",
    "role": "STUDENT",
    "updatedAt": "2025-10-06T12:15:00Z"
  }
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
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_01HQRS2...",
        "email": "student1@university.edu",
        "firstName": "John",
        "lastName": "Doe", 
        "role": "STUDENT",
        "createdAt": "2025-10-05T14:22:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

## Assessment Service API

Base URL: `/api/assessments`

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
        "createdAt": "2025-10-05T10:00:00Z",
        "questionSets": [
          {
            "id": "questionset_01HQR...",
            "name": "Multiple Choice Questions",
            "questionCount": 10,
            "timeLimit": 30
          }
        ]
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

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
      "timeLimit": 60,
      "attemptsAllowed": 1,
      "randomizeQuestions": true,
      "showResults": false
    },
    "questionSets": [
      {
        "id": "questionset_01HQR...",
        "name": "Multiple Choice Questions",
        "description": "Basic programming concepts",
        "timeLimit": 30,
        "questions": [
          {
            "id": "question_01HQR...",
            "type": "MULTIPLE_CHOICE",
            "content": "What is a variable in programming?",
            "points": 2.0,
            "options": [
              {
                "id": "option_01HQR...",
                "content": "A container for storing data",
                "isCorrect": true
              },
              {
                "id": "option_01HQR...",
                "content": "A programming language",
                "isCorrect": false
              }
            ]
          }
        ]
      }
    ]
  }
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
    "timeLimit": 90,
    "attemptsAllowed": 2,
    "randomizeQuestions": false,
    "showResults": true
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
    "createdAt": "2025-10-06T12:00:00Z"
  }
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
    "publishedAt": "2025-10-06T12:15:00Z"
  }
}
```

---

## Submission Service API

Base URL: `/api/submissions`

### Create Submission
```http
POST /api/submissions
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "assessmentId": "assessment_01HQR...",
  "autoSave": false
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
    "answers": null,
    "createdAt": "2025-10-06T12:00:00Z"
  }
}
```

### Save Answers (Autosave)
```http
POST /api/submissions/:id/save-answers
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "answers": {
    "question_01HQR001": "A container for storing data",
    "question_01HQR002": ["option1", "option3"],
    "question_01HQR003": {
      "type": "essay",
      "content": "Variables are fundamental building blocks..."
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "submission_01HQT...",
    "answers": {
      "question_01HQR001": "A container for storing data",
      "question_01HQR002": ["option1", "option3"],
      "question_01HQR003": {
        "type": "essay",
        "content": "Variables are fundamental building blocks..."
      }
    },
    "updatedAt": "2025-10-06T12:05:00Z"
  }
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
    "submittedAt": "2025-10-06T12:30:00Z"
  }
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
    "answers": {
      "question_01HQR001": "A container for storing data",
      "question_01HQR002": ["option1", "option3"]
    },
    "score": null,
    "maxScore": null,
    "submittedAt": "2025-10-06T12:30:00Z",
    "createdAt": "2025-10-06T12:00:00Z",
    "updatedAt": "2025-10-06T12:30:00Z"
  }
}
```

### List Submissions (Teachers/Admins)
```http
GET /api/submissions?assessmentId=assessment_01HQR...&page=1&limit=20
Authorization: Bearer v4.public.eyJ...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "submission_01HQT...",
        "userId": "user_01HQRS2...",
        "assessmentId": "assessment_01HQR...",
        "status": "SUBMITTED",
        "score": 8.5,
        "maxScore": 10.0,
        "submittedAt": "2025-10-06T12:30:00Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "student@university.edu"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

## Grading Service API

Base URL: `/api/grading` (Ready for Implementation)

### Grade Submission (Automated)
```http
POST /api/grading/submissions/:id/grade
Authorization: Bearer v4.public.eyJ...
Content-Type: application/json

{
  "gradingMethod": "AUTOMATED",
  "settings": {
    "partialCredit": true,
    "penaltyForIncorrect": 0.25
  }
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "grade_01HQU...",
    "submissionId": "submission_01HQT...",
    "totalScore": 8.5,
    "maxScore": 10.0,
    "percentage": 85.0,
    "gradedAt": "2025-10-06T12:45:00Z",
    "gradedBy": null,
    "questionGrades": [
      {
        "questionId": "question_01HQR001",
        "pointsEarned": 2.0,
        "maxPoints": 2.0,
        "isCorrect": true,
        "feedback": "Correct answer!"
      },
      {
        "questionId": "question_01HQR002", 
        "pointsEarned": 1.5,
        "maxPoints": 2.0,
        "isCorrect": false,
        "feedback": "Partial credit awarded"
      }
    ]
  }
}
```

### Get Grade
```http
GET /api/grading/submissions/:id
Authorization: Bearer v4.public.eyJ...
```

### Assessment Statistics (Teachers)
```http
GET /api/grading/assessment/:id/stats
Authorization: Bearer v4.public.eyJ...
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "assessment_01HQR...",
    "totalSubmissions": 45,
    "averageScore": 7.8,
    "medianScore": 8.0,
    "statusBreakdown": {
      "SUBMITTED": 5,
      "GRADED": 40
    },
    "scoreDistribution": {
      "90-100": 12,
      "80-89": 15,
      "70-79": 10,
      "60-69": 5,
      "below-60": 3
    }
  }
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ],
    "timestamp": "2025-10-06T12:00:00Z",
    "path": "/api/auth/register"
  }
}
```

### HTTP Status Codes

| Status Code | Description | Example |
|-------------|-------------|---------|
| `200` | Success | Request completed successfully |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input, validation errors |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
| `422` | Unprocessable Entity | Valid format but semantic errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error |

### Common Error Codes

| Error Code | Description | HTTP Status |
|------------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | Missing authentication token | 401 |
| `INVALID_TOKEN` | Token invalid or expired | 401 |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions | 403 |
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `RESOURCE_NOT_FOUND` | Requested resource not found | 404 |
| `DUPLICATE_RESOURCE` | Resource already exists | 409 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |

---

## Rate Limiting

### Current Limits
- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per 15 minutes  
- **File upload endpoints**: 10 requests per minute
- **Burst limit**: 200 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696608000
X-RateLimit-Window: 900
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 300,
    "timestamp": "2025-10-06T12:00:00Z"
  }
}
```

---

## Examples

### Complete Student Workflow

#### 1. Student Registration & Login
```bash
# Register
curl -X POST https://api.pediafor.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe", 
    "role": "STUDENT"
  }'

# Login
curl -X POST https://api.pediafor.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecurePassword123!"
  }'
```

#### 2. View Available Assessments
```bash
curl -X GET "https://api.pediafor.com/api/assessments?status=PUBLISHED" \
  -H "Authorization: Bearer v4.public.eyJ..."
```

#### 3. Start Assessment (Create Submission)
```bash
curl -X POST https://api.pediafor.com/api/submissions \
  -H "Authorization: Bearer v4.public.eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "assessment_01HQR...",
    "autoSave": true
  }'
```

#### 4. Save Answers (During Assessment)
```bash
curl -X POST https://api.pediafor.com/api/submissions/submission_01HQT.../save-answers \
  -H "Authorization: Bearer v4.public.eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "question_01HQR001": "A container for storing data",
      "question_01HQR002": ["option1", "option3"]
    }
  }'
```

#### 5. Submit Assessment
```bash
curl -X POST https://api.pediafor.com/api/submissions/submission_01HQT.../submit \
  -H "Authorization: Bearer v4.public.eyJ..."
```

### Teacher Workflow

#### 1. Create Assessment
```bash
curl -X POST https://api.pediafor.com/api/assessments \
  -H "Authorization: Bearer v4.public.eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Programming Fundamentals Quiz",
    "description": "Basic programming concepts",
    "settings": {
      "timeLimit": 60,
      "attemptsAllowed": 1
    }
  }'
```

#### 2. Publish Assessment
```bash
curl -X POST https://api.pediafor.com/api/assessments/assessment_01HQS.../publish \
  -H "Authorization: Bearer v4.public.eyJ..."
```

#### 3. View Student Submissions
```bash
curl -X GET "https://api.pediafor.com/api/submissions?assessmentId=assessment_01HQS..." \
  -H "Authorization: Bearer v4.public.eyJ..."
```

---

## SDK and Client Libraries

### JavaScript/TypeScript SDK (Recommended)
```bash
npm install @pediafor/assessment-sdk
```

```typescript
import { PediaforSDK } from '@pediafor/assessment-sdk';

const client = new PediaforSDK({
  baseURL: 'https://api.pediafor.com',
  apiKey: 'your-api-key-here'
});

// Authenticate
const { user, token } = await client.auth.login({
  email: 'student@university.edu',
  password: 'SecurePassword123!'
});

// Get assessments
const assessments = await client.assessments.list({
  status: 'PUBLISHED'
});

// Create submission
const submission = await client.submissions.create({
  assessmentId: 'assessment_01HQR...'
});
```

### Python SDK
```bash
pip install pediafor-assessment-sdk
```

```python
from pediafor import PediaforClient

client = PediaforClient(
    base_url='https://api.pediafor.com',
    api_key='your-api-key-here'
)

# Authenticate
response = client.auth.login(
    email='student@university.edu',
    password='SecurePassword123!'
)

# Get assessments
assessments = client.assessments.list(status='PUBLISHED')

# Create submission
submission = client.submissions.create(
    assessment_id='assessment_01HQR...'
)
```

---

**API Documentation Version**: 1.0 | **Last Updated**: October 6, 2025  
**Support**: [api-support@pediafor.com](mailto:api-support@pediafor.com) | **Status Page**: [status.pediafor.com](https://status.pediafor.com)