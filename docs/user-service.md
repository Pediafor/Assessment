# User Service — Comprehensive Documentation

[![Status](https://img.shields.io/badge/status-production--ready-success)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)](.)
[![Security](https://img.shields.io/badge/Security-Hardened-green)](.)
[![Port](https://img.shields.io/badge/Port-4000-blue)](.)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](.)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](.)

## Table of Contents

1. [Service Overview](#service-overview)
2. [Features](#features)
3. [API Documentation](#api-documentation)
4. [Database Schema](#database-schema)
5. [Development Setup](#development-setup)

---

## Service Overview

The User Service is the foundational authentication and user management microservice for the Pediafor Assessment Platform.

---

## Features

- **User Authentication**: Secure login/logout with PASETO V4 tokens.
- **User Management**: CRUD operations for user accounts.
- **Role-Based Access Control**: STUDENT, TEACHER, ADMIN permissions.
- **Event-Driven**: Publishes user lifecycle events.

---

## API Documentation

### Authentication Endpoints

- `POST /auth/login`: Authenticate user and establish session.
- `POST /auth/refresh`: Refresh authentication token.
- `POST /auth/logout`: Terminate user session.

### User Management Endpoints

- `POST /register`: Create new user account.
- `GET /:id`: Retrieve user profile by ID.
- `PUT /:id`: Update user profile.
- `DELETE /:id`: Soft delete user account.
- `GET /`: Get paginated list of users (ADMIN). Query: `page`, `limit`, `role`, `q`.

### Teacher/Admin Students Endpoints

- `GET /students`: List students (TEACHER/ADMIN). Query: `page`, `limit`, `q` (search name/email).
- `GET /students/:id`: Get a single student detail (TEACHER/ADMIN).

---

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

---

## Development Setup

```bash
# Clone repository
git clone <repository-url>
cd services/user-service

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Database setup
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev

# Run tests
npm test
```

---

Docs Version: 1.3 • Last Updated: October 20, 2025
