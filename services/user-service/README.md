# User Service — Pediafor Assessment Platform

[![Status](https://img.shields.io/badge/status-production--ready-success)](.)
[![Port](https://img.shields.io/badge/port-4000-blue)](.)
[![Auth](https://img.shields.io/badge/auth-PASETO%20v4-green)](.)
[![Runtime](https://img.shields.io/badge/runtime-Node.js%2018+-brightgreen?logo=nodedotjs)](.)
[![Lang](https://img.shields.io/badge/lang-TypeScript%205.x-blue?logo=typescript)](.)

## Overview

The User Service is a core microservice in the Pediafor Assessment Platform, responsible for user authentication and management.

## Features

- **Authentication**: Secure user authentication using PASETO V4 tokens.
- **User Management**: Full CRUD operations for users.
- **Role-Based Access Control**: Manages STUDENT, TEACHER, and ADMIN roles.
- **Event-Driven**: Publishes user-related events to RabbitMQ.

## Architecture

The service is a standard Node.js application using Express.js, TypeScript, and Prisma. It has its own PostgreSQL database and communicates with other services via REST APIs and RabbitMQ.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Messaging**: RabbitMQ with amqplib
- **Authentication**: paseto, argon2
- **Testing**: Jest, Supertest

## API Endpoints

### Authentication Endpoints

- `POST /auth/login`: User login.
- `POST /auth/refresh`: Refresh access token.
- `POST /auth/logout`: User logout.

### User Management Endpoints

- `POST /register`: Register a new user.
- `GET /:id`: Get user by ID.
- `PUT /:id`: Update user.
- `DELETE /:id`: Delete user.
- `GET /`: Get paginated users (ADMIN). Supports `page`, `limit`, `role`, `q` (search).

### Teacher/Admin Students Endpoints

- `GET /students`: List students with pagination and search (TEACHER/ADMIN). Query: `page`, `limit`, `q`.
- `GET /students/:id`: Get a single student detail (sanitized) (TEACHER/ADMIN).

Note: Through the API Gateway, protected alias routes are available at `/users/*` (and public alias for registration at `/users/register`).

## Database Schema

```prisma
model User {
  id                 String    @id @default(uuid())
  email              String    @unique
  passwordHash       String
  firstName          String?
  lastName           String?
  role               UserRole  @default(STUDENT)
  isActive           Boolean   @default(true)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  lastLogin          DateTime?
  profilePicture     String?
  metadata           Json?
  resetPasswordToken String?
  resetTokenExpiry   DateTime?
  refreshToken       String?
}

enum UserRole {
  STUDENT
  TEACHER
  ADMIN
}
```

## Development

To run this service locally:

```bash
cd services/user-service
npm install
cp .env.example .env
# Update .env with your database connection string and PASETO keys
docker-compose up -d user-db
npx prisma db push
npm run dev
```

## Smoke test (via Gateway aliases)

```bash
# Health (direct service when port exposed)
curl -s http://localhost:4000/health

# Register
curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student+1@local","password":"Passw0rd!","firstName":"Stu","lastName":"Dent"}'

# Login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student+1@local","password":"Passw0rd!"}' | jq -r .data.accessToken)

# Me
curl -s http://localhost:3000/users/me -H "Authorization: Bearer $TOKEN"
```

## Contributing

What makes it special:
- PASETO v4 token issuance with strict iss/aud/iat/exp validation.
- Role-aware user listings and students endpoints with search/pagination.
- Emits user-related events for downstream consumers.

Starter issues/ideas:
- Add email verification and password reset flows.
- Enrich user metadata schema (org/classroom fields) and indexes.
- Harden refresh token rotation with device binding.

---

Docs Version: 1.3 • Last Updated: October 20, 2025