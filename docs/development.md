# Pediafor Assessment Platform - Development Guide

[![Development Status](https://img.shields.io/badge/Development-Active-brightgreen)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-295%2F310%20(95%25)-success)](.)
[![Code Quality](https://img.shields.io/badge/Quality-TypeScript%20%2B%20ESLint%20%2B%20Prettier-blue)](.)
[![Architecture](https://img.shields.io/badge/Architecture-Microservices-orange)](.)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20per%20Service-336791?logo=postgresql)](.)
[![Testing](https://img.shields.io/badge/Testing-Jest%20%2B%20Supertest-red?logo=jest)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](.)

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Testing Guidelines](#testing-guidelines)
6. [Code Standards](#code-standards)
7. [Database Development](#database-development)
8. [API Development](#api-development)
9. [Contributing Guidelines](#contributing-guidelines)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

#### **Required Software**
- **Node.js**: 20.x LTS ([Download](https://nodejs.org/))
- **Docker**: 24.0+ with Docker Compose v2 ([Download](https://docker.com/))
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Visual Studio Code**: Recommended IDE ([Download](https://code.visualstudio.com/))

#### **Recommended VS Code Extensions**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode-remote.remote-containers",
    "ms-vscode.docker",
    "prisma.prisma"
  ]
}
```

#### **System Requirements**
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 10GB free space for development environment
- **OS**: Windows 10+, macOS 12+, or Ubuntu 20.04+

### Quick Setup

#### 1. Clone Repository
```bash
git clone https://github.com/pediafor/assessment.git
cd assessment
```

#### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install service dependencies
npm run install:all

# Alternative: Install individual services
cd services/user-service && npm install
cd services/gateway-service && npm install
cd services/assessment-service && npm install
cd services/submission-service && npm install
```

#### 3. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env
npm run setup:env

# Generate PASETO key pair
npm run generate-keys
```

#### 4. Start Development Environment
```bash
# Start databases and cache
docker-compose up -d postgres-user postgres-assessment postgres-submission redis

# Run database migrations
npm run db:migrate:all

# Start all services in development mode
npm run dev

# Or start individual services
npm run dev:gateway
npm run dev:user
npm run dev:assessment
npm run dev:submission
```

#### 5. Verify Setup
```bash
# Check service health
curl http://localhost:3000/health

# Run test suite
npm test

# Check code quality
npm run lint
npm run type-check
```

---

## Development Environment

### Docker Development Setup

#### **Development Docker Compose**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Development Databases
  postgres-user:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: pediafor_users_dev
      POSTGRES_USER: pediafor
      POSTGRES_PASSWORD: development
    volumes:
      - postgres-user-dev:/var/lib/postgresql/data

  postgres-assessment:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: pediafor_assessments_dev
      POSTGRES_USER: pediafor
      POSTGRES_PASSWORD: development
    volumes:
      - postgres-assessment-dev:/var/lib/postgresql/data

  postgres-submission:
    image: postgres:15-alpine
    ports:
      - "5434:5432"
    environment:
      POSTGRES_DB: pediafor_submissions_dev
      POSTGRES_USER: pediafor
      POSTGRES_PASSWORD: development
    volumes:
      - postgres-submission-dev:/var/lib/postgresql/data

  # Redis for development
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis-dev:/data

  # Database admin interface
  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@pediafor.com
      PGADMIN_DEFAULT_PASSWORD: development
    volumes:
      - pgadmin-dev:/var/lib/pgadmin

volumes:
  postgres-user-dev:
  postgres-assessment-dev:
  postgres-submission-dev:
  redis-dev:
  pgadmin-dev:
```

#### **Start Development Environment**
```bash
# Start development infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Verify databases are running
docker-compose -f docker-compose.dev.yml ps
```

### Environment Variables

#### **Development .env Template**
```env
# Development Environment
NODE_ENV=development
LOG_LEVEL=debug

# Service Ports
GATEWAY_PORT=3000
USER_SERVICE_PORT=4000
ASSESSMENT_SERVICE_PORT=4001
SUBMISSION_SERVICE_PORT=4002
GRADING_SERVICE_PORT=4003

# Database URLs
USER_SERVICE_DB_URL=postgresql://pediafor:development@localhost:5432/pediafor_users_dev
ASSESSMENT_SERVICE_DB_URL=postgresql://pediafor:development@localhost:5433/pediafor_assessments_dev
SUBMISSION_SERVICE_DB_URL=postgresql://pediafor:development@localhost:5434/pediafor_submissions_dev
GRADING_SERVICE_DB_URL=postgresql://pediafor:development@localhost:5435/pediafor_grading_dev

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=pediafor:dev:

# PASETO Keys (generated by npm run generate-keys)
PASETO_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
PASETO_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Development Settings
CORS_ORIGIN=http://localhost:3001
RATE_LIMIT_ENABLED=false
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Email Configuration (development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASS=""
```

---

## Project Structure

### **Repository Layout**
```
pediafor-assessment/
├── docs/                          # Documentation
│   ├── architecture.md            # System architecture
│   ├── api.md                     # API documentation
│   ├── deployment.md              # Deployment guide
│   └── development.md             # This file
├── scripts/                       # Build and utility scripts
│   ├── generate-keys.js           # PASETO key generation
│   ├── setup-env.js               # Environment setup
│   └── migrate-all.js             # Run all migrations
├── services/                      # Microservices
│   ├── gateway-service/           # API Gateway
│   ├── user-service/              # User management & auth
│   ├── assessment-service/        # Assessment management
│   ├── submission-service/        # Student submissions
│   └── grading-service/           # Automated grading (planned)
├── infra/                         # Infrastructure configuration
│   ├── docker/                    # Docker configurations
│   ├── k8s/                       # Kubernetes manifests
│   └── nginx/                     # NGINX configuration
├── .github/                       # GitHub workflows
│   └── workflows/
│       ├── ci.yml                 # Continuous integration
│       └── cd.yml                 # Continuous deployment
├── package.json                   # Root package configuration
├── docker-compose.yml             # Production composition
├── docker-compose.dev.yml         # Development composition
└── README.md                      # Project overview
```

### **Service Structure Template**
```
service-name/
├── src/                           # Source code
│   ├── middleware/                # Express middleware
│   │   ├── authentication.ts     # Auth middleware
│   │   ├── validation.ts          # Input validation
│   │   └── errorHandler.ts       # Error handling
│   ├── routes/                    # API routes
│   │   ├── service.routes.ts      # Main service routes
│   │   └── health.routes.ts       # Health check routes
│   ├── services/                  # Business logic
│   │   └── service.service.ts     # Core service logic
│   ├── types/                     # TypeScript types
│   │   └── index.ts               # Type definitions
│   ├── utils/                     # Utility functions
│   │   └── helpers.ts             # Helper functions
│   ├── prismaClient.ts            # Database client
│   └── server.ts                  # Express server setup
├── tests/                         # Test suites
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   ├── fixtures/                  # Test data
│   └── setup.ts                   # Test configuration
├── prisma/                        # Database schema
│   ├── schema.prisma              # Prisma schema
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Seed data
├── uploads/                       # File uploads (dev)
├── Dockerfile                     # Docker configuration
├── Dockerfile.prod                # Production Docker config
├── package.json                   # Service dependencies
├── tsconfig.json                  # TypeScript configuration
├── jest.config.js                 # Jest test configuration
└── .env.example                   # Environment template
```

---

## Development Workflow

### **Feature Development Process**

#### 1. Create Feature Branch
```bash
# Create and checkout feature branch
git checkout -b feature/student-submission-workflow
git push -u origin feature/student-submission-workflow
```

#### 2. Development Cycle
```bash
# Make changes to code
# Write/update tests
# Verify functionality

# Run tests frequently
npm test

# Check code quality
npm run lint
npm run type-check
npm run format
```

#### 3. Pre-Commit Checks
```bash
# Run full test suite
npm run test:all

# Run integration tests
npm run test:integration

# Check test coverage
npm run test:coverage

# Verify build
npm run build:all
```

#### 4. Commit and Push
```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add student submission workflow with autosave"

# Push changes
git push origin feature/student-submission-workflow
```

#### 5. Create Pull Request
- **Title**: Clear, descriptive title
- **Description**: Detailed explanation of changes
- **Tests**: Include test results and coverage information
- **Documentation**: Update relevant documentation

### **Git Workflow Standards**

#### **Branch Naming Convention**
```
feature/description-of-feature
bugfix/description-of-bug-fix
hotfix/critical-issue-description
refactor/description-of-refactor
docs/documentation-update
```

#### **Conventional Commit Messages**
```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting, missing semicolons, etc.
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

#### **Example Commit Messages**
```bash
git commit -m "feat: implement student submission autosave functionality"
git commit -m "fix: resolve authentication token expiry issue"
git commit -m "docs: update API documentation for submission endpoints"
git commit -m "test: add integration tests for submission workflow"
git commit -m "refactor: extract submission validation logic to service"
```

---

## Testing Guidelines

### **Testing Philosophy**
- **Test-Driven Development**: Write tests before implementation
- **High Coverage**: Maintain >90% test coverage
- **Fast Feedback**: Tests should run quickly for rapid development
- **Reliable**: Tests should be deterministic and not flaky

### **Test Structure**

#### **Test Categories**
1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test API endpoints and service integration
3. **Database Tests**: Test database operations and schema
4. **End-to-End Tests**: Test complete user workflows

#### **Test Organization**
```
tests/
├── unit/                          # Unit tests
│   ├── services/
│   │   ├── user.service.test.ts
│   │   ├── assessment.service.test.ts
│   │   └── submission.service.test.ts
│   └── utils/
│       └── helpers.test.ts
├── integration/                   # Integration tests
│   ├── user.routes.test.ts
│   ├── assessment.routes.test.ts
│   └── submission.routes.test.ts
├── fixtures/                      # Test data
│   ├── users.json
│   ├── assessments.json
│   └── submissions.json
├── helpers/                       # Test utilities
│   ├── testUtils.ts
│   └── dbHelpers.ts
└── setup.ts                       # Global test setup
```

### **Testing Standards**

#### **Unit Test Example**
```typescript
// tests/unit/services/submission.service.test.ts
import { SubmissionService } from '../../../src/services/submission.service';
import { mockPrisma } from '../../helpers/mockPrisma';

describe('SubmissionService', () => {
  let submissionService: SubmissionService;

  beforeEach(() => {
    submissionService = new SubmissionService();
    jest.clearAllMocks();
  });

  describe('createSubmission', () => {
    it('should create a new submission for a student', async () => {
      // Arrange
      const mockUser = { id: 'user-123', role: 'STUDENT' };
      const submissionData = { assessmentId: 'assessment-456' };
      const expectedSubmission = {
        id: 'submission-789',
        userId: 'user-123',
        assessmentId: 'assessment-456',
        status: 'DRAFT'
      };

      mockPrisma.submission.create.mockResolvedValue(expectedSubmission);

      // Act
      const result = await submissionService.createSubmission(submissionData, mockUser);

      // Assert
      expect(result).toEqual(expectedSubmission);
      expect(mockPrisma.submission.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          assessmentId: 'assessment-456',
          status: 'DRAFT'
        }
      });
    });

    it('should throw error if assessment ID is missing', async () => {
      // Arrange
      const mockUser = { id: 'user-123', role: 'STUDENT' };
      const submissionData = { assessmentId: '' };

      // Act & Assert
      await expect(
        submissionService.createSubmission(submissionData, mockUser)
      ).rejects.toThrow('Assessment ID is required');
    });
  });
});
```

#### **Integration Test Example**
```typescript
// tests/integration/submission.routes.test.ts
import request from 'supertest';
import { app } from '../../src/server';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/dbHelpers';

describe('Submission Routes', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/submissions', () => {
    it('should create a new submission', async () => {
      // Arrange
      const authToken = await createTestUser('STUDENT');
      const assessment = await createTestAssessment();

      // Act
      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assessmentId: assessment.id,
          autoSave: false
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        assessmentId: assessment.id,
        status: 'DRAFT'
      });
    });

    it('should return 401 without authentication', async () => {
      // Act
      const response = await request(app)
        .post('/api/submissions')
        .send({
          assessmentId: 'assessment-123'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

### **Test Commands**

#### **Running Tests**
```bash
# Run all tests
npm test

# Run tests for specific service
npm run test:user
npm run test:assessment
npm run test:submission

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Run unit tests only
npm run test:unit
```

#### **Test Configuration**

**Jest Configuration Example**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  maxConcurrency: 1, // For database tests
};
```

---

## Code Standards

### **TypeScript Configuration**

#### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### **ESLint Configuration**

#### **.eslintrc.js**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-const': 'error',
  },
};
```

### **Prettier Configuration**

#### **.prettierrc**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### **Code Quality Tools**

#### **Package.json Scripts**
```json
{
  "scripts": {
    "lint": "eslint \"{src,tests}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "start": "node dist/src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### **Code Style Guidelines**

#### **Naming Conventions**
- **Files**: kebab-case (`user-service.ts`, `submission.routes.ts`)
- **Classes**: PascalCase (`UserService`, `SubmissionController`)
- **Functions**: camelCase (`createSubmission`, `validateInput`)
- **Variables**: camelCase (`userId`, `assessmentData`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`)
- **Interfaces**: PascalCase with `I` prefix (`IUserContext`, `ISubmissionData`)
- **Types**: PascalCase (`UserRole`, `SubmissionStatus`)

#### **Code Organization**
```typescript
// 1. Imports (external first, then internal)
import express from 'express';
import { Request, Response } from 'express';

import { UserService } from '../services/user.service';
import { validateRequest } from '../middleware/validation';
import { IUserContext } from '../types';

// 2. Type definitions
interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// 3. Constants
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// 4. Main implementation
export class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: Request, res: Response): Promise<void> {
    // Implementation
  }
}
```

#### **Error Handling Patterns**
```typescript
// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// Error handling in services
async createSubmission(data: CreateSubmissionData, user: IUserContext): Promise<Submission> {
  try {
    // Validation
    if (!data.assessmentId) {
      throw new ValidationError('Assessment ID is required', 'assessmentId');
    }

    // Business logic
    const submission = await this.prisma.submission.create({
      data: {
        userId: user.id,
        assessmentId: data.assessmentId,
        status: 'DRAFT'
      }
    });

    return submission;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error; // Re-throw validation errors
    }
    
    // Log unexpected errors
    this.logger.error('Failed to create submission', {
      error: error.message,
      userId: user.id,
      assessmentId: data.assessmentId
    });
    
    throw new Error('Failed to create submission');
  }
}
```

---

## Database Development

### **Prisma Schema Development**

#### **Schema Design Principles**
- **Consistent Naming**: Use camelCase for fields, PascalCase for models
- **Proper Relationships**: Define clear foreign key relationships
- **Indexing**: Add indexes for frequently queried fields
- **Constraints**: Use appropriate constraints for data integrity

#### **Example Schema**
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
  id           String   @id @default(cuid())
  email        String   @unique
  firstName    String?
  lastName     String?
  passwordHash String
  role         UserRole @default(STUDENT)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  isActive     Boolean  @default(true)

  // Relationships
  submissions Submission[]
  assessments Assessment[]

  @@map("users")
}

model Submission {
  id           String           @id @default(cuid())
  userId       String
  assessmentId String
  answers      Json?
  status       SubmissionStatus @default(DRAFT)
  score        Float?
  maxScore     Float?
  submittedAt  DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  // Relationships
  user  User   @relation(fields: [userId], references: [id])
  files SubmissionFile[]
  
  // Indexes
  @@index([userId])
  @@index([assessmentId])
  @@index([status])
  @@unique([userId, assessmentId])
  @@map("submissions")
}

enum UserRole {
  STUDENT
  TEACHER
  ADMIN
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  GRADING
  GRADED
  RETURNED
}
```

### **Migration Workflow**

#### **Creating Migrations**
```bash
# Create migration for schema changes
npx prisma migrate dev --name add_submission_files_table

# Generate Prisma client after schema changes
npx prisma generate

# Apply migrations to production
npx prisma migrate deploy
```

#### **Migration Best Practices**
- **Small Changes**: Create focused migrations for specific changes
- **Backwards Compatible**: Ensure migrations don't break existing code
- **Data Migration**: Include data migration scripts when needed
- **Testing**: Test migrations against production-like data

#### **Example Migration Script**
```sql
-- Migration: 20251006120000_add_submission_files_table
-- Description: Add file upload support for submissions

CREATE TABLE "submission_files" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_files_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "submission_files_submissionId_idx" ON "submission_files"("submissionId");

ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submissionId_fkey" 
  FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### **Database Testing**

#### **Test Database Setup**
```typescript
// tests/helpers/dbHelpers.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

export async function setupTestDatabase(): Promise<void> {
  // Run migrations
  await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  // Additional setup if needed
}

export async function cleanupTestDatabase(): Promise<void> {
  // Clean up test data
  await prisma.submissionFile.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.user.deleteMany();
  
  await prisma.$disconnect();
}

export async function createTestUser(role: 'STUDENT' | 'TEACHER' | 'ADMIN' = 'STUDENT') {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashed-password',
      role,
    },
  });
}
```

---

## API Development

### **API Design Principles**

#### **RESTful Design**
- **Resource-based URLs**: `/api/submissions/:id`
- **HTTP Methods**: GET, POST, PUT, DELETE for CRUD operations
- **Status Codes**: Use appropriate HTTP status codes
- **Consistent Response Format**: Standardized JSON responses

#### **API Response Format**
```typescript
// Success Response
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Error Response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
    timestamp: string;
    path: string;
  };
}

// Usage Example
export const createSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const submission = await submissionService.createSubmission(req.body, req.user);
    
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: [{ field: error.field, message: error.message }],
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }
  }
};
```

### **Input Validation**

#### **Express Validator Example**
```typescript
import { body, param, query, validationResult } from 'express-validator';

// Validation rules
export const createSubmissionValidation = [
  body('assessmentId')
    .isString()
    .notEmpty()
    .withMessage('Assessment ID is required'),
  body('autoSave')
    .optional()
    .isBoolean()
    .withMessage('Auto save must be a boolean'),
];

export const updateSubmissionValidation = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Submission ID is required'),
  body('answers')
    .optional()
    .isObject()
    .withMessage('Answers must be an object'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'SUBMITTED'])
    .withMessage('Invalid status'),
];

// Validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array(),
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
    return;
  }
  
  next();
};

// Usage in routes
router.post(
  '/submissions',
  createSubmissionValidation,
  validateRequest,
  authenticateUser,
  createSubmission
);
```

### **Authentication Middleware**

#### **PASETO Token Verification**
```typescript
// middleware/authentication.ts
import { Request, Response, NextFunction } from 'express';
import { V4 } from 'paseto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    firstName?: string;
    lastName?: string;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication token is required',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }

    // Verify PASETO token
    const publicKey = process.env.PASETO_PUBLIC_KEY!;
    const payload = await V4.verify(token, publicKey);
    
    // Attach user context to request
    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as 'STUDENT' | 'TEACHER' | 'ADMIN',
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
};

// Authorization middleware
export const requireRole = (roles: Array<'STUDENT' | 'TEACHER' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions for this operation',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }
    
    next();
  };
};
```

---

## Contributing Guidelines

### **Pull Request Process**

#### **Before Creating PR**
1. **Branch**: Create feature branch from `main`
2. **Tests**: Ensure all tests pass (`npm test`)
3. **Linting**: Fix all linting issues (`npm run lint`)
4. **Coverage**: Maintain >90% test coverage
5. **Documentation**: Update relevant documentation

#### **PR Template**
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass locally
- [ ] Integration tests pass locally
- [ ] Added tests for new functionality
- [ ] Test coverage maintained above 90%

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes without major version bump
```

### **Code Review Guidelines**

#### **For Authors**
- **Small PRs**: Keep changes focused and small
- **Clear Descriptions**: Explain what and why, not just what
- **Test Coverage**: Include comprehensive tests
- **Documentation**: Update docs for user-facing changes

#### **For Reviewers**
- **Functionality**: Does the code do what it claims?
- **Design**: Is the code well-designed and appropriate?
- **Complexity**: Is the code more complex than needed?
- **Tests**: Are there appropriate tests?
- **Documentation**: Is documentation clear and sufficient?

### **Release Process**

#### **Version Numbering**
- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features, backwards compatible (1.0.0 → 1.1.0)
- **Patch**: Bug fixes, backwards compatible (1.0.0 → 1.0.1)

#### **Release Checklist**
1. **Version Bump**: Update version in all package.json files
2. **Changelog**: Update CHANGELOG.md with new features/fixes
3. **Documentation**: Update API documentation if needed
4. **Testing**: Run full test suite including integration tests
5. **Build**: Verify production builds work correctly
6. **Tag**: Create git tag for release
7. **Deploy**: Deploy to staging, then production

---

## Troubleshooting

### **Common Development Issues**

#### **Port Already in Use**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### **Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres-user

# Restart database
docker-compose restart postgres-user

# Check connection
npx prisma db pull
```

#### **PASETO Key Issues**
```bash
# Regenerate keys
npm run generate-keys

# Verify keys are set
echo $PASETO_PUBLIC_KEY | head -c 50
```

#### **Test Failures**
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- tests/unit/submission.service.test.ts

# Clear test cache
npm test -- --clearCache
```

### **Performance Issues**

#### **Slow Database Queries**
```sql
-- Enable query logging in PostgreSQL
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

#### **Memory Issues**
```bash
# Monitor memory usage
docker stats

# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Check for memory leaks
node --inspect=0.0.0.0:9229 dist/src/server.js
```

### **Debug Configuration**

#### **VS Code Launch Configuration**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug User Service",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/services/user-service/src/server.ts",
      "env": {
        "NODE_ENV": "development",
        "PORT": "4000"
      },
      "runtimeArgs": ["-r", "ts-node/register"],
      "sourceMaps": true,
      "cwd": "${workspaceFolder}/services/user-service",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache", "--no-coverage"],
      "cwd": "${workspaceFolder}/services/submission-service",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

**Development Guide Version**: 1.0 | **Last Updated**: October 6, 2025  
**Support**: [dev-support@pediafor.com](mailto:dev-support@pediafor.com) | **Community**: [GitHub Discussions](https://github.com/pediafor/assessment/discussions)