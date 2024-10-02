# Assessment Service Test Suite

This directory contains comprehensive tests for the Assessment Service, covering all implemented functionality including assessment management, file uploads, media processing, and authentication integration.

## Test Structure

```
tests/
├── setup.ts                    # Global test setup and utilities
├── basic.test.ts              # Basic environment and setup tests
├── unit/                      # Unit tests for individual components
│   ├── services/              # Tests for service layer
│   │   └── assessment.service.test.ts  # Assessment CRUD operations
│   └── middleware/            # Tests for middleware components
│       └── userContext.test.ts         # User context middleware
├── integration/               # Integration tests for API endpoints
│   ├── assessment.routes.test.ts       # Assessment CRUD endpoint tests
│   └── media.routes.test.ts            # File upload and media tests
└── helpers/                   # Test utilities and helpers
    └── mockPrisma.ts         # Prisma database mocking utilities
```

## Test Categories

### Unit Tests

**Assessment Service (`tests/unit/services/assessment.service.test.ts`)**
- Assessment creation and validation
- Question set management with ordering
- Question CRUD operations with options
- Media attachment handling
- User permission checking
- Input validation and error scenarios
- Soft delete functionality

**User Context Middleware (`tests/unit/middleware/userContext.test.ts`)**
- User context extraction from Gateway headers
- Role validation (TEACHER, ADMIN, STUDENT)
- Authentication error handling
- Missing header validation
- Invalid user data handling

### Integration Tests

**Assessment Routes (`tests/integration/assessment.routes.test.ts`)**
- Assessment CRUD endpoint validation
- Nested question set creation
- Question management with options
- Permission-based access control
- Error response validation
- Pagination and filtering

**Media Routes (`tests/integration/media.routes.test.ts`)**
- File upload functionality with multiple formats
- Image processing and thumbnail generation
- Authentication and authorization testing
- File size and type validation
- Static file serving with security controls
- Directory traversal attack prevention
- Error handling for invalid uploads and missing files

### Environment Tests

**Basic Tests (`tests/basic.test.ts`)**
- Environment setup validation
- TypeScript compilation verification
- Global test utilities functionality
## Testing Philosophy

### Mock-Based Approach
- **Fast Execution**: Tests run without external dependencies
- **Isolated Testing**: Each component tested independently
- **Comprehensive Mocking**: Custom Prisma mock factory for database operations
- **CI/CD Ready**: No database requirements for unit tests

### Security Testing
- **Authentication Validation**: Gateway integration testing
- **Authorization Control**: Role-based access verification
- **File Security**: Upload validation and path traversal prevention
- **Input Validation**: Comprehensive request validation testing

### Integration Coverage
- **Real HTTP Testing**: Supertest for actual API endpoint testing
- **End-to-End Scenarios**: Complete user workflows
- **Error Path Testing**: Comprehensive error handling validation

## Test Infrastructure

### Mock Utilities (`tests/helpers/mockPrisma.ts`)
- **Prisma Client Mocking**: Complete database operation simulation
- **Data Factory Functions**: Reusable mock data generators
- **Relationship Handling**: Proper mock relationship management
- **Error Simulation**: Database error scenario testing

### Global Setup (`tests/setup.ts`)
- **Environment Configuration**: Test environment setup
- **Global Utilities**: Shared test helper functions
- **Mock Initialization**: Setup for consistent mock behavior
- **Cleanup Operations**: Test cleanup and reset utilities

### User Context Simulation
- **Gateway Headers**: Simulated authentication headers
- **Role Variations**: Different user role testing scenarios
- **Permission Testing**: Access control validation
- **Error Scenarios**: Authentication failure simulation

## Running Tests

### Install Dependencies

Testing dependencies are included in the main package.json:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Categories

```bash
# Unit tests only
npm test tests/unit

# Integration tests only
npm test tests/integration

# Specific test files
npm test tests/basic.test.ts
npm test tests/integration/media.routes.test.ts
npm test tests/unit/services/assessment.service.test.ts

# Watch mode for development
npm test -- --watch

# Coverage report
npm test -- --coverage

# Verbose output
npm test -- --verbose
```

### Run Individual Test Suites

```bash
# Environment validation
npx jest tests/basic.test.ts

# Assessment service unit tests
npx jest tests/unit/services/assessment.service.test.ts

# User context middleware tests
npx jest tests/unit/middleware/userContext.test.ts

# Media upload integration tests
npx jest tests/integration/media.routes.test.ts

# Assessment endpoints integration tests
npx jest tests/integration/assessment.routes.test.ts
```

## Current Test Status

### ✅ Completed (11+ Tests Passing)

**Basic Environment Tests (2 tests)**
- ✅ Environment variable validation
- ✅ TypeScript compilation and setup

**Integration Tests - Media Routes (9 tests)**
- ✅ File upload with image processing
- ✅ Multiple file format support (PNG, JPG, PDF)
- ✅ Authentication and authorization validation
- ✅ File size and type validation
- ✅ Thumbnail generation testing
- ✅ Static file serving with security
- ✅ Directory traversal attack prevention
- ✅ Error handling for invalid uploads
- ✅ Missing file error responses

### 🔄 In Progress

**Unit Tests - Assessment Service**
- 🔄 Assessment CRUD operations
- 🔄 Question set management
- 🔄 Question and option handling
- 🔄 User permission validation
- 🔄 Input validation scenarios

**Unit Tests - User Context Middleware**
- 🔄 Gateway header extraction
- 🔄 Role validation testing
- 🔄 Authentication error handling

**Integration Tests - Assessment Routes**
- 🔄 Assessment endpoint testing
- 🔄 Nested resource creation
- 🔄 Permission-based access control

### Test Coverage Goals

- **Unit Tests**: 95%+ code coverage for all service and middleware components
- **Integration Tests**: Complete API endpoint coverage with error scenarios
- **Security Tests**: Comprehensive authentication and authorization validation
- **Performance Tests**: Load testing for file upload and processing operations

## Development Testing Workflow

### Local Development

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm test -- --watch

# Run specific test file during development
npm test tests/unit/services/assessment.service.test.ts -- --watch
```

### Pre-commit Testing

```bash
# Run all tests before committing
npm test

# Run tests with coverage report
npm test -- --coverage

# Lint and test together
npm run lint && npm test
```

### Docker Testing

```bash
# Test in containerized environment
docker-compose up -d assessment-db
npm test

# Full container testing
docker-compose up --build
docker-compose exec assessment-service npm test
```

## Debugging Tests

### Common Issues

**TypeScript Module Resolution**
- Ensure proper Jest configuration in package.json
- Check tsconfig.json test configuration
- Verify mock imports and hoisting

**Prisma Mocking**
- Use inline mock definitions to avoid hoisting issues
- Properly mock Prisma client methods
- Ensure mock data matches schema types

**File Upload Testing**
- Verify test file paths and permissions
- Check multipart form data formatting
- Ensure proper cleanup of uploaded test files

### Debug Commands

```bash
# Run tests with debug output
npm test -- --verbose --detectOpenHandles

# Debug specific test file
node --inspect-brk node_modules/.bin/jest tests/unit/services/assessment.service.test.ts

# Run single test with full output
npm test -- --testNamePattern="should create assessment" --verbose
```

## Contributing to Tests

### Adding New Tests

1. **Unit Tests**: Create tests in appropriate `tests/unit/` subdirectory
2. **Integration Tests**: Add endpoint tests to `tests/integration/`
3. **Mock Data**: Extend mock utilities in `tests/helpers/`
4. **Documentation**: Update this README with new test categories

### Test Standards

- **Descriptive Names**: Clear test descriptions explaining what is being tested
- **Arrange-Act-Assert**: Follow AAA pattern for test structure
- **Mock Isolation**: Proper mocking to avoid external dependencies
- **Error Testing**: Include both success and error scenarios
- **Performance**: Efficient tests that run quickly in CI/CD

### Code Coverage

- Maintain 90%+ code coverage for all new features
- Test both happy path and error scenarios
- Include edge cases and boundary conditions
- Validate input sanitization and security measures

---

**🧪 Part of the Pediafor Assessment Platform testing ecosystem**

These tests ensure the reliability and security of the Assessment Service, working in conjunction with:
- **Gateway Service Tests**: Authentication and routing validation
- **User Service Tests**: User management and role testing
- **Integration Tests**: Cross-service communication validation

For questions about testing or to report test issues, please refer to the main project documentation or open an issue in the repository.
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/prismaClient.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
```

### TypeScript Configuration
**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": [
    "src/**/*",
    "tests/**/*"
  ]
}
```

## 🔒 Security Testing

### Authentication Testing
- **Missing Headers**: Verify 401 responses for unauthenticated requests
- **Invalid Roles**: Check role-based access control enforcement
- **Header Injection**: Test against malicious header manipulation
- **Token Validation**: Ensure proper Gateway integration

### File Security Testing
- **Upload Validation**: Test file type and size restrictions
- **Path Traversal**: Verify protection against directory traversal attacks
- **Malicious Files**: Test handling of potentially dangerous file types
- **Access Control**: Ensure proper file access permissions

### Input Validation Testing
- **SQL Injection**: Test against malicious database queries
- **XSS Prevention**: Verify safe handling of user input
- **Buffer Overflow**: Test file size limits and memory protection
- **MIME Type Spoofing**: Validate actual file content vs. declared type

## 📈 Performance Testing

### Load Testing Scenarios
```bash
# File upload performance
# Test concurrent file uploads with various sizes

# Database query optimization
# Measure query performance under load

# Memory usage monitoring
# Track memory consumption during file processing

# Concurrent user simulation
# Test system behavior with multiple authenticated users
```

### Performance Metrics
- **Response Time**: API endpoint response times under load
- **Throughput**: Requests per second capacity
- **Memory Usage**: Peak memory consumption during operations
- **File Processing**: Image processing and thumbnail generation speed

## 🔄 Continuous Integration

### GitHub Actions Workflow
```yaml
name: Assessment Service Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: assessment_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/assessment_test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🎯 Testing Roadmap

### Phase 1: Core Unit Tests ✅
- [x] Basic environment and setup tests
- [x] Integration tests for file upload functionality
- [x] Mock infrastructure and test utilities

### Phase 2: Service Layer Testing 🔄
- [ ] Complete assessment service unit tests
- [ ] Middleware testing with proper mocking
- [ ] Error handling and edge case coverage

### Phase 3: Advanced Testing 📋
- [ ] Performance and load testing
- [ ] Security penetration testing
- [ ] End-to-end workflow testing
- [ ] Cross-service integration testing

### Phase 4: Quality Assurance 🎯
- [ ] 100% test coverage achievement
- [ ] Automated accessibility testing
- [ ] Database migration testing
- [ ] Container security scanning

## 🤝 Contributing to Tests

### Writing New Tests

1. **Follow naming conventions**:
   ```
   describe('FeatureName', () => {
     describe('methodName', () => {
       it('should do something when condition is met');
     });
   });
   ```

2. **Use proper test structure**:
   ```typescript
   // Arrange - Set up test data
   const mockData = testUtils.createMockAssessment();
   
   // Act - Execute the functionality
   const result = await assessmentService.create(mockData, userContext);
   
   // Assert - Verify the results
   expect(result).toEqual(expectedResult);
   expect(mockPrisma.assessment.create).toHaveBeenCalledWith(expectedArgs);
   ```

3. **Include error scenarios**:
   ```typescript
   it('should throw ValidationError for invalid input', async () => {
     const invalidData = { /* missing required fields */ };
     
     await expect(
       assessmentService.create(invalidData, userContext)
     ).rejects.toThrow(ValidationError);
   });
   ```

### Test Review Checklist

- [ ] Test names clearly describe the scenario
- [ ] Both positive and negative cases covered
- [ ] Proper mock setup and cleanup
- [ ] Error cases and edge conditions tested
- [ ] Security and permission scenarios included
- [ ] Performance implications considered
- [ ] Documentation updated if needed

---

**🧪 Testing is a cornerstone of the Assessment Service quality assurance strategy**

Our comprehensive testing approach ensures reliability, security, and maintainability while supporting rapid development and deployment cycles.