# UserService - Pediafor

## Overview

UserService is a core microservice in the Pediafor Assessment Platform. It manages:

- User authentication and authorization
- Role management (STUDENT, TEACHER, ADMIN)
- CRUD operations for user profiles
- Token issuance and management using PASETO tokens
- Multi-service data ownership via user IDs

This service is fully containerized and interacts with the GatewayService and other downstream services in the platform.

## Architecture

```
[Client] --> [GatewayService] --> [UserService] --> [PostgreSQL DB]
                    |                   |
                    |<-- Access Token --|
```

- **Client**: Receives access and refresh tokens upon login.
- **GatewayService**: Validates incoming requests using access tokens.
- **UserService**: Issues PASETO access/refresh tokens, performs user CRUD, and manages roles.

### Token Workflow:
1. Login request → UserService
2. UserService generates access + refresh tokens
3. Access token validated by Gateway for every request
4. Refresh token stored in DB for token renewal

## Key Features

- **CRUD**: Create, read, update, delete users
- **Authentication**: Login with email + password
- **Authorization**: Role-based access control
- **Token Management**: PASETO access/refresh tokens
- **Profile Management**: Store metadata, profile picture, last login
- **Cross-Service Ownership**: userId as pseudo foreign key for downstream services

## Database Schema

Using Prisma ORM:

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

## Folder Structure

```
src/
├── app.ts                 # Main entry point
├── server.ts              # HTTP server config
├── routes/
│   ├── auth.routes.ts     # Login, refresh, logout
│   └── user.routes.ts     # CRUD operations
├── controllers/
│   ├── auth.controller.ts
│   └── user.controller.ts
├── services/
│   ├── auth.service.ts    # Token generation, password hashing
│   └── user.service.ts    # Prisma queries for CRUD
├── middleware/
│   ├── validateToken.ts
│   └── errorHandler.ts
├── utils/
│   ├── paseto.ts          # PASETO helper functions
│   └── hash.ts            # Password hashing and comparison
└── config/
    └── index.ts           # DB, token keys, env config
```

## Getting Started (Docker)

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (containerized)
- `.env` file with:

```env
DATABASE_URL=postgresql://user:password@db:5432/userservice
PASETO_SECRET=your-secret-key
PORT=4000
```

### Build & Run

```bash
# Build docker container
docker build -t pediafor-user-service .

# Run with docker-compose
docker-compose up -d
```

### Prisma Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init_user_service
```

## API Endpoints

### Auth Routes:

| Method | Endpoint      | Description                               |
|--------|---------------|-------------------------------------------|
| POST   | /auth/login   | Login user, issue tokens                 |
| POST   | /auth/refresh | Refresh access token using refresh token |
| POST   | /auth/logout  | Invalidate refresh token                  |

### User Routes:

| Method | Endpoint    | Description    |
|--------|-------------|----------------|
| POST   | /users      | Create user    |
| GET    | /users/:id  | Get user by ID |
| PUT    | /users/:id  | Update user    |
| DELETE | /users/:id  | Delete user    |
| GET    | /users      | List users     |

## Token Workflow

- **Access Token**: Short-lived, validated by Gateway
- **Refresh Token**: Stored in DB, used to request new access token
- **PASETO**: Symmetric key in `.env`, Gateway validates access tokens

## Contributing

1. Fork the repo
2. Use branches for features (`feature/auth`, `feature/crud`)
3. PR with proper descriptions
4. Ensure tests pass before merging

## Testing

Unit tests in `test/` folder using Jest

Run tests:

```bash
npm install
npm test
```

## Environment Variables

| Variable      | Description                      |
|---------------|----------------------------------|
| DATABASE_URL  | Postgres connection string       |
| PASETO_SECRET | Symmetric key for token signing  |
| PORT          | Port for the service to run      |

## Future Enhancements

- Multi-factor authentication
- Soft-delete and audit logging
- Role-specific metadata
- Integration with other services for ownership verification