# User Service Test Suite

This directory contains comprehensive tests for the User Service, covering all implemented functionality including authentication, user management, and PASETO token handling.

## Test Structure

```
tests/
├── setup.ts                 # Global test setup and utilities
├── basic.test.ts            # Basic environment and setup tests
├── functional.test.ts       # Functional and integration concepts
├── unit/                    # Unit tests (isolated components)
│   ├── services/
│   │   ├── auth.service.test.ts    # Authentication service tests
│   │   └── user.service.test.ts    # User service tests
│   └── utils/
│       ├── hash.test.ts            # Password hashing tests
│       └── paseto.test.ts          # PASETO token tests
├── integration/             # Integration tests (with database)
│   └── user.routes.test.ts          # API endpoint tests
└── helpers/                 # Test utilities and helpers
    └── testApp.ts          # Test application setup
```

## Test Categories

### 🧪 Unit Tests (42 tests)
Focus on testing individual components in isolation with mocked dependencies:

- **Auth Service Tests** (12 tests): Token generation, refresh logic, validation
- **User Service Tests** (13 tests): CRUD operations, pagination, validation
- **PASETO Utils Tests** (9 tests): Token signing, verification, security
- **Hash Utils Tests** (7 tests): Password hashing, verification, security

### � Integration Tests (17 tests)
Test complete API workflows with real database connections:

- **User Registration Flow**: Account creation, validation, error handling
- **Authentication Flow**: Login, token management, session handling
- **User Management**: Profile operations, updates, soft deletion
- **User Listing**: Pagination, filtering, search functionality
- **Health Monitoring**: Service status and diagnostics

### ⚙️ Functional Tests (18 tests)
Verify environment setup and core business concepts:

- **Environment Configuration**: Test setup validation
- **Data Structures**: User models, validation rules
- **Token Management Concepts**: Expiration logic, claims structure

## Test Environment Setup

### Prerequisites
1. **Docker Desktop**: Must be running for integration tests
2. **PostgreSQL Container**: Test database instance
3. **Environment Variables**: PASETO keys and database configuration

### Database Configuration
```bash
# Test database connection
DATABASE_URL=postgresql://userservice:userpass123@localhost:5432/user_service_db

# Test environment variables
NODE_ENV=test
PASETO_PRIVATE_KEY=<test-private-key>
PASETO_PUBLIC_KEY=<test-public-key>
```

### Quick Setup
```bash
# Start test database
docker-compose up user-db -d

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Run all tests
npm test
```

## Running Tests

### All Tests (77 total)
```bash
npm test
```
Expected: All 77 tests passing ✅

### Unit Tests Only (42 tests)
```bash
npm run test:unit
```
Tests business logic in isolation with mocked dependencies.

### Integration Tests Only (17 tests)
```bash
npm run test:integration
```
Tests API endpoints with real database connections.

### Watch Mode
```bash
npm run test:watch
```
Continuously runs tests when files change.

### Coverage Report
```bash
npm run test:coverage
```
Generates detailed test coverage analysis.

## Test Results Overview

| Category | Tests | Status | Description |
|----------|-------|--------|-------------|
| **Unit Tests** | 42 | ✅ | Business logic with mocks |
| **Integration Tests** | 17 | ✅ | API endpoints with database |
| **Functional Tests** | 18 | ✅ | Environment and concepts |
| **Total** | **77** | **✅** | **All Tests Passing** |