# User Service Test Suite

This directory contains comprehensive tests for the User Service, covering all implemented functionality including authentication, user management, and PASETO token handling.

## Test Structure

```
tests/
├── setup.ts                 # Global test setup and utilities
├── basic.test.ts            # Basic environment and setup tests
├── unit/                    # Unit tests for individual components
│   ├── utils/               # Tests for utility functions
│   │   ├── hash.test.ts     # Password hashing and verification
│   │   └── paseto.test.ts   # PASETO token generation and verification
│   └── services/            # Tests for service layer
│       ├── user.service.test.ts    # User CRUD operations
│       └── auth.service.test.ts    # Authentication token management
├── integration/             # Integration tests for API endpoints
│   └── user.routes.test.ts  # User route testing (template)
└── helpers/                 # Test utilities and helpers
    └── testApp.ts          # Test application setup
```

## Test Categories

### Unit Tests

**Hash Utils (`tests/unit/utils/hash.test.ts`)**
- Password hashing with Argon2
- Password verification
- Error handling for invalid inputs
- Special character support

**PASETO Utils (`tests/unit/utils/paseto.test.ts`)**
- Access token generation and verification
- Refresh token handling
- Token expiration management
- Claims validation (iss, aud, iat, exp)
- Environment variable validation

**User Service (`tests/unit/services/user.service.test.ts`)**
- User registration and creation
- User retrieval by ID and email
- User updates and soft deletion
- Pagination and filtering
- Last login tracking
- Refresh token storage and removal

**Auth Service (`tests/unit/services/auth.service.test.ts`)**
- Token issuance (access + refresh)
- Token refresh flow
- Token validation and error handling
- Database integration for token storage

### Integration Tests

**User Routes (`tests/integration/user.routes.test.ts`)**
- User registration endpoint validation
- Profile management endpoints
- User listing with pagination
- Health check endpoint
- Error response validation

## Running Tests

### Install Dependencies

First, install the testing dependencies:

```bash
npm install --save-dev @types/jest @types/supertest jest supertest ts-jest
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Categories

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Run Individual Test Files

```bash
# Hash utilities
npx jest tests/unit/utils/hash.test.ts

# PASETO utilities
npx jest tests/unit/utils/paseto.test.ts

# User service
npx jest tests/unit/services/user.service.test.ts

# Auth service
npx jest tests/unit/services/auth.service.test.ts
```

## Test Environment

### Environment Variables

The tests use mock environment variables for PASETO keys:

```bash
NODE_ENV=test
PASETO_PRIVATE_KEY=MC4CAQAwBQYDK2VwBCIEIDEp8VZfRw1P2vDEzO2Y1a+LLQ1NKYF6OiC+vLXY8RZN
PASETO_PUBLIC_KEY=MCowBQYDK2VwAyEAMSnxVl9HDU/a8MTM7ZjVr4stDU0pgXo6IL68tdjxFk0=
```

### Database

Tests use mocked Prisma client for unit tests. For integration tests, you should set up a separate test database:

```bash
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pediafor_test
```

### Global Test Utilities

The `tests/setup.ts` file provides global utilities:

- `global.testUtils.cleanDatabase()` - Clear test data
- `global.testUtils.createTestUser()` - Create test users with defaults

## Test Coverage

The test suite covers:

✅ **Password Security**
- Argon2 hashing implementation
- Password verification
- Salt generation and uniqueness

✅ **PASETO Token Management**
- Ed25519 key-based signing
- Token generation with proper claims
- Expiration handling
- Token verification and validation

✅ **User Management**
- User registration with validation
- Profile retrieval and updates
- Soft deletion (isActive flag)
- Role-based access patterns

✅ **Authentication Flow**
- Access token generation (15m expiry)
- Refresh token generation (7d expiry)
- Token refresh mechanism
- Token storage and cleanup

✅ **Data Validation**
- Email format validation
- Password strength requirements
- Role validation
- Input sanitization

✅ **Error Handling**
- Database connection errors
- Invalid token formats
- Expired tokens
- Missing users
- Validation failures

## Mock Strategy

### Unit Tests
- **Prisma Client**: Fully mocked for isolated testing
- **PASETO Utils**: Mocked in service tests to control token behavior
- **Environment Variables**: Mocked for consistent test environment

### Integration Tests
- **Test Database**: Optional separate database for real integration testing
- **Test App**: Minimal Express app with only necessary middleware
- **Request/Response**: Real HTTP requests using Supertest

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Mocking**: External dependencies are mocked in unit tests
3. **Data Cleanup**: Test data is cleaned up after each test
4. **Environment**: Tests run in a controlled test environment
5. **Coverage**: Aim for high coverage of critical authentication and user management flows

## Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Single Test with Debug
```bash
npx jest tests/unit/utils/hash.test.ts --verbose --no-cache
```

### Coverage Report
```bash
npm run test:coverage
open coverage/lcov-report/index.html  # View detailed coverage report
```

## Future Enhancements

- [ ] Complete integration tests with real database
- [ ] Performance tests for token operations
- [ ] Security tests for edge cases
- [ ] Load testing for concurrent user operations
- [ ] API endpoint rate limiting tests