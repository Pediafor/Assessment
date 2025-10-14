# User Service - Pediafor Assessment Platform

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)](.)
[![Port](https://img.shields.io/badge/Port-4000-blue)](.)

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
- `GET /`: Get all users.

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
npx prisma migrate dev
npm run dev
```

---

*Last Updated: October 13, 2025*