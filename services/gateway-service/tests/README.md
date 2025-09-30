# Gateway Service Test Suite

This directory contains comprehensive tests for the Gateway Service, focusing on API gateway functionality, authentication middleware, service routing, and PASETO token verification.

## Test Structure

```
tests/
├── setup.ts                    # Global test setup and utilities
├── auth.middleware.test.ts     # Authentication middleware testing
├── jest.d.ts                   # TypeScript declarations for Jest
└── .gitkeep                    # Placeholder for additional test files
```

## Test Categories

### Authentication Middleware Tests

**Auth Middleware (`tests/auth.middleware.test.ts`)**
- PASETO V4 token verification with Ed25519 public key
- Public route authentication bypass
- Invalid token handling and error responses
- Missing token scenarios
- Expired token validation
- Token format verification
- Request enrichment with user context headers

## Testing Philosophy

### Gateway-Specific Testing Concerns

The Gateway Service has unique testing requirements compared to other microservices:

1. **Stateless Authentication**: Testing token verification without database dependencies
2. **Request Proxying**: Ensuring proper forwarding of authenticated requests
3. **Public Routes**: Verifying authentication bypass for specific endpoints
4. **Error Handling**: Testing gateway-level error responses and formatting
5. **Header Management**: Validating request enrichment and forwarding headers

### Mock Strategy

```typescript
// Mock PASETO verification for predictable testing
jest.mock('../src/utils/paseto', () => ({
  verifyAccessToken: jest.fn()
}));

// Mock service URLs for routing tests
const mockServiceConfig = {
  userService: 'http://mock-user-service:4000',
  assessmentService: 'http://mock-assessment-service:4001'
};
```

## Running Tests

### Install Dependencies

Gateway Service testing dependencies:

```bash
npm install --save-dev @types/jest @types/supertest jest supertest ts-jest
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Authentication middleware tests only
npx jest tests/auth.middleware.test.ts

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Verbose output for debugging
npm test -- --verbose
```

## Test Environment

### Environment Variables

The Gateway Service tests use mock environment variables:

```bash
NODE_ENV=test
PORT=3000

# PASETO V4 Public Key for token verification
PASETO_PUBLIC_KEY=MCowBQYDK2VwAyEAMSnxVl9HDU/a8MTM7ZjVr4stDU0pgXo6IL68tdjxFk0=

# Mock service URLs for testing
USER_SERVICE_URL=http://mock-user-service:4000
ASSESSMENT_SERVICE_URL=http://mock-assessment-service:4001
GRADING_SERVICE_URL=http://mock-grading-service:4002
SUBMISSION_SERVICE_URL=http://mock-submission-service:4003

# Security configuration
CORS_ORIGIN=http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Global Test Utilities

The `tests/setup.ts` file provides Gateway-specific utilities:

```typescript
global.gatewayTestUtils = {
  // Generate valid test tokens
  generateValidToken: (payload: any) => string,
  
  // Generate expired test tokens
  generateExpiredToken: (payload: any) => string,
  
  // Create mock service responses
  mockServiceResponse: (statusCode: number, data: any) => object,
  
  // Setup authentication test scenarios
  setupAuthScenarios: () => void
};
```

## Test Coverage Areas

### ✅ **Authentication Middleware**

**Token Verification**
- Valid PASETO V4 token processing
- Ed25519 signature verification
- Token claims extraction (userId, email, role)
- Token expiration validation

**Public Route Handling**
- Authentication bypass for `/auth/login`
- Authentication bypass for `/users/register`
- Authentication bypass for `/health`
- Authentication bypass for root `/` endpoint

**Error Scenarios**
- Missing Authorization header
- Invalid token format (not PASETO V4)
- Expired tokens
- Malformed tokens
- Invalid signature verification

**Request Enrichment**
- Addition of `X-User-Id` header
- Addition of `X-User-Email` header
- Addition of `X-User-Role` header
- Addition of `X-Request-Id` for tracing

### ✅ **Security Headers**

**CORS Configuration**
- Cross-origin request handling
- Preflight OPTIONS requests
- Origin validation
- Credential handling

**Rate Limiting** (Future)
- Per-client request throttling
- Rate limit header responses
- Burst protection

### 🔄 **Future Test Areas**

**Service Routing** (Planned)
- Request forwarding to correct backend services
- URL path rewriting
- Query parameter forwarding
- Request body proxying

**Health Check Aggregation** (Planned)
- Backend service health monitoring
- Combined health status reporting
- Service discovery testing

**Load Balancing** (Planned)
- Round-robin request distribution
- Health-based routing
- Circuit breaker functionality

## Authentication Test Scenarios

### Valid Token Flow

```typescript
describe('Valid Token Authentication', () => {
  it('should verify valid PASETO token and enrich request', async () => {
    const validToken = 'v4.public.eyJ1c2VySWQ...';
    const mockPayload = {
      userId: '123',
      email: 'test@example.com',
      role: 'STUDENT'
    };
    
    mockVerifyAccessToken.mockResolvedValue(mockPayload);
    
    const response = await request(app)
      .get('/protected-route')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
      
    // Verify request enrichment
    expect(mockNextFunction).toHaveBeenCalled();
    expect(mockRequest.headers['x-user-id']).toBe('123');
  });
});
```

### Public Route Bypass

```typescript
describe('Public Route Authentication', () => {
  it('should bypass authentication for public routes', async () => {
    await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);
      
    // Verify no token verification was attempted
    expect(mockVerifyAccessToken).not.toHaveBeenCalled();
  });
});
```

### Error Handling

```typescript
describe('Authentication Error Handling', () => {
  it('should return 401 for expired tokens', async () => {
    mockVerifyAccessToken.mockRejectedValue(new Error('Token expired'));
    
    const response = await request(app)
      .get('/protected-route')
      .set('Authorization', 'Bearer expired.token.here')
      .expect(401);
      
    expect(response.body).toEqual({
      error: 'Authentication failed',
      message: 'Token expired'
    });
  });
});
```

## Performance Testing

### Token Verification Performance

```typescript
describe('Authentication Performance', () => {
  it('should handle token verification within acceptable time limits', async () => {
    const startTime = Date.now();
    
    await request(app)
      .get('/protected-route')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
      
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(100); // < 100ms
  });
});
```

## Integration Testing

### Gateway-to-Service Communication

```typescript
describe('Service Integration', () => {
  it('should forward authenticated requests to backend services', async () => {
    // Mock backend service response
    nock('http://mock-user-service:4000')
      .get('/users/123')
      .reply(200, { user: { id: '123', email: 'test@example.com' } });
    
    const response = await request(app)
      .get('/users/123')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
      
    expect(response.body.user.id).toBe('123');
  });
});
```

## Mock Configuration

### PASETO Token Mocking

```typescript
// tests/setup.ts
import { jest } from '@jest/globals';

// Mock PASETO verification
jest.mock('../src/utils/paseto', () => ({
  verifyAccessToken: jest.fn()
}));

// Provide test utilities
global.gatewayTestUtils = {
  generateValidToken: (payload: any) => {
    return `v4.public.${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
  },
  
  generateExpiredToken: (payload: any) => {
    const expiredPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    };
    return `v4.public.${Buffer.from(JSON.stringify(expiredPayload)).toString('base64')}`;
  }
};
```

## Debugging Tests

### Common Issues

1. **PASETO Verification Failures**
   ```bash
   # Check if public key is properly mocked
   console.log(process.env.PASETO_PUBLIC_KEY);
   ```

2. **Request Enrichment Not Working**
   ```bash
   # Verify middleware order and next() calls
   npm test -- --verbose tests/auth.middleware.test.ts
   ```

3. **Mock Service Responses**
   ```bash
   # Ensure nock interceptors are properly configured
   npm test -- --detectOpenHandles
   ```

### Debug Configuration

```bash
# Run with debug output
DEBUG=gateway:* npm test

# Run specific test with coverage
npx jest tests/auth.middleware.test.ts --coverage --verbose

# Watch mode for active development
npm test -- --watch --verbose
```

## Security Testing

### Token Security

```typescript
describe('Token Security', () => {
  it('should reject tokens with wrong audience', async () => {
    const invalidToken = gatewayTestUtils.generateValidToken({
      userId: '123',
      aud: 'wrong-audience'
    });
    
    await request(app)
      .get('/protected-route')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
  });
  
  it('should reject tokens with missing required claims', async () => {
    const incompleteToken = gatewayTestUtils.generateValidToken({
      // Missing userId claim
      email: 'test@example.com'
    });
    
    await request(app)
      .get('/protected-route')
      .set('Authorization', `Bearer ${incompleteToken}`)
      .expect(401);
  });
});
```

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Mocking**: External services and dependencies are properly mocked
3. **Security Focus**: Emphasis on authentication and authorization edge cases
4. **Performance**: Tests verify acceptable response times for gateway operations
5. **Real-world Scenarios**: Tests cover actual usage patterns and error conditions

## Future Enhancements

- [ ] Complete service routing and proxy tests
- [ ] Health check aggregation testing
- [ ] Rate limiting and throttling tests
- [ ] WebSocket proxying tests (if implemented)
- [ ] Load balancing algorithm tests
- [ ] Circuit breaker pattern tests
- [ ] Distributed tracing tests
- [ ] API versioning tests

## Contributing

When adding new tests:

1. **Follow naming conventions**: `*.test.ts` for test files
2. **Group related tests**: Use `describe()` blocks for logical grouping
3. **Mock external dependencies**: Don't rely on real backend services
4. **Test edge cases**: Include error scenarios and boundary conditions
5. **Document complex scenarios**: Add comments for non-obvious test logic