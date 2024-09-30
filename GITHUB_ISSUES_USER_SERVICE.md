# GitHub Issues for User Service Enhancements

Copy and paste each section below as separate GitHub issues.

---

## Issue 1: Fix User Service Integration Tests Database Connection

**Labels:** `bug`, `testing`, `good first issue`

### Problem Description
The integration tests in `services/user-service/tests/integration/` are failing because they attempt to connect to a real database (`user-db:5432`) during test execution, but no database is available.

### Current Behavior
```bash
npm test
# Results in:
# ✅ 61 unit tests PASSING
# ❌ 16 integration tests FAILING with PrismaClientInitializationError
```

### Error Details
```
PrismaClientInitializationError:
Can't reach database server at `user-db:5432`
Please make sure your database server is running at `user-db:5432`.
```

### Root Cause
Integration tests in `tests/integration/user.routes.test.ts` are trying to use real Prisma client connections instead of mocks like the successful unit tests.

### Acceptance Criteria
- [ ] All tests pass with `npm test` command
- [ ] Integration tests use mocks OR proper test database setup
- [ ] Maintain the same test coverage (77 total tests)
- [ ] Update test documentation if approach changes
- [ ] Ensure tests run in CI/CD without external dependencies

### Suggested Solutions
**Option A:** Convert to mocks (recommended)
- Follow patterns from `tests/unit/` directory
- Mock Prisma client and services
- Fast execution, no dependencies

**Option B:** Add test database setup
- Docker test database container
- Proper test data seeding/cleanup
- Real integration testing

### Files to Modify
- `tests/integration/user.routes.test.ts`
- `tests/setup.ts`
- Potentially `package.json` for test scripts

### Why Good First Issue
- Clear, well-defined problem
- Existing working patterns to follow (unit tests)
- Good introduction to testing practices
- Non-critical for main functionality

---

## Issue 2: Implement Email Verification System

**Labels:** `enhancement`, `security`, `feature`

### Feature Description
Implement email verification functionality to ensure users provide valid email addresses during registration and enhance account security.

### Current Behavior
Users can register with any email address and immediately access the system without email verification.

### Desired Behavior
Users must verify their email address before their account becomes fully active.

### Business Value
- **Security**: Prevent fake account creation
- **Communication**: Ensure reliable email delivery for notifications
- **Compliance**: Meet standard authentication practices
- **User Trust**: Professional onboarding experience

### Technical Requirements

#### Database Changes
```sql
-- Add to User model
emailVerified: Boolean @default(false)
emailVerificationToken: String?
emailVerificationExpires: DateTime?
```

#### New API Endpoints
```typescript
POST /auth/verify-email/:token    // Verify email with token
POST /auth/resend-verification    // Resend verification email
GET  /auth/verification-status    // Check verification status
```

#### Email Integration
- Email service (Nodemailer, SendGrid, or AWS SES)
- HTML email templates
- Secure token generation and validation

### Acceptance Criteria

#### Core Functionality
- [ ] Generate verification tokens on registration
- [ ] Send verification email with secure link
- [ ] Email verification endpoint validates tokens
- [ ] Resend verification functionality
- [ ] Token expiration (24 hours recommended)
- [ ] Update user verification status

#### Security Requirements
- [ ] Secure token generation (crypto.randomBytes)
- [ ] Token single-use (invalidate after verification)
- [ ] Rate limiting for resend requests
- [ ] XSS protection in email templates

#### User Experience
- [ ] Clear verification email template
- [ ] Success/error pages for verification
- [ ] Account status indicators
- [ ] Configurable enforcement (block unverified login)

#### Integration
- [ ] Update registration flow
- [ ] Modify login logic (if enforcement enabled)
- [ ] Admin override capabilities
- [ ] Gateway service compatibility

### Technical Implementation

#### Service Layer Updates
```typescript
// auth.service.ts
generateEmailVerificationToken(userId: string)
sendVerificationEmail(email: string, token: string)
verifyEmailToken(token: string)
resendVerificationEmail(userId: string)
```

#### Middleware Considerations
```typescript
// Optional: requireEmailVerification middleware
// For endpoints that need verified users only
```

### Testing Requirements
- [ ] Unit tests for token generation/validation
- [ ] Email service mocking
- [ ] End-to-end verification flow tests
- [ ] Error handling tests
- [ ] Rate limiting tests

### Dependencies
- Email service provider account
- Email template system
- Environment variables for email config

### Estimated Effort
**Medium** (3-5 days for experienced developer)

### Related Files
- `src/services/auth.service.ts`
- `src/routes/auth.routes.ts`
- `src/middleware/auth.middleware.ts`
- `prisma/schema.prisma`
- Email templates directory

---

## Issue 3: Implement Password Reset Flow

**Labels:** `enhancement`, `security`, `feature`

### Feature Description
Implement secure password reset functionality allowing users to reset forgotten passwords through email-based verification.

### User Story
As a user who has forgotten my password, I want to receive a secure reset link via email so that I can regain access to my account safely.

### Current Gap
No password recovery mechanism exists. Users with forgotten passwords cannot regain access.

### Security Requirements

#### Token Security
- Cryptographically secure token generation
- One-time use tokens
- Short expiration (1 hour maximum)
- Tokens invalidated after successful reset

#### Rate Limiting
- Maximum 5 reset requests per hour per email
- Progressive delays for repeated requests
- IP-based rate limiting consideration

#### Session Management
- Invalidate all existing sessions after password reset
- Logout user from all devices
- Clear refresh tokens

### Technical Implementation

#### Database Schema Updates
```typescript
// Add to User model
passwordResetToken: String?
passwordResetExpires: DateTime?
passwordResetAttempts: Int @default(0)
lastPasswordResetRequest: DateTime?
```

#### API Endpoints
```typescript
POST /auth/forgot-password     // Request password reset
POST /auth/reset-password      // Reset password with token
GET  /auth/reset-password/:token // Validate token (optional)
```

#### Service Functions
```typescript
// auth.service.ts
requestPasswordReset(email: string)
validateResetToken(token: string)
resetPassword(token: string, newPassword: string)
invalidateUserSessions(userId: string)
```

### Acceptance Criteria

#### Core Functionality
- [ ] Password reset request endpoint
- [ ] Generate secure reset tokens
- [ ] Send password reset email
- [ ] Token validation and expiration
- [ ] Password update with proper hashing
- [ ] Session invalidation after reset

#### Security Implementation
- [ ] Rate limiting (5 requests/hour/email)
- [ ] Secure token generation (32+ bytes)
- [ ] Token expiration (1 hour)
- [ ] One-time use token validation
- [ ] Password strength validation
- [ ] Audit logging for reset attempts

#### User Experience
- [ ] Professional email template
- [ ] Clear reset instructions
- [ ] Success/error feedback
- [ ] Token expiration handling
- [ ] Invalid token error messages

#### Email Content
```html
Subject: Password Reset Request - Pediafor Assessment Platform

Body:
- Clear call-to-action button
- Token expiration time
- Security notice
- Alternative contact method
- Link directly to reset form
```

### Error Handling

#### Common Scenarios
- Invalid/expired tokens
- Non-existent email addresses
- Rate limit exceeded
- Weak new passwords
- System errors during reset

#### Response Strategy
- Generic responses for security (don't reveal if email exists)
- Clear error messages for user issues
- Proper HTTP status codes
- Logging for monitoring

### Testing Requirements

#### Unit Tests
- [ ] Token generation and validation
- [ ] Password hashing verification
- [ ] Rate limiting logic
- [ ] Email service integration

#### Integration Tests
- [ ] Complete reset flow
- [ ] Token expiration scenarios
- [ ] Rate limiting enforcement
- [ ] Session invalidation

#### Security Tests
- [ ] Token manipulation attempts
- [ ] Timing attack resistance
- [ ] Rate limit bypass attempts

### Dependencies
- Email service (same as verification system)
- Rate limiting middleware
- Secure token generation library

### Implementation Files
```
src/
├── routes/auth.routes.ts          # New endpoints
├── services/auth.service.ts       # Reset logic
├── middleware/rateLimiting.ts     # Rate limiting
├── utils/tokenGeneration.ts      # Secure tokens
└── templates/passwordReset.html  # Email template

tests/
├── unit/auth.service.reset.test.ts
└── integration/passwordReset.test.ts
```

### Estimated Effort
**Medium-Large** (5-7 days)

### Success Metrics
- Password reset completion rate
- Token expiration effectiveness
- Rate limiting efficiency
- User satisfaction with process

---

## Issue 4: Enhanced User Search and Filtering

**Labels:** `enhancement`, `feature`, `good first issue`

### Feature Description
Enhance the existing user listing endpoint (`GET /users`) with advanced search and filtering capabilities for better user management.

### Current Functionality
```typescript
GET /users?page=1&limit=10&role=STUDENT
```

Currently supports:
- Basic pagination (`page`, `limit`)
- Single role filtering (`role`)

### Proposed Enhancements

#### Search Capabilities
```typescript
GET /users?search=john                    // Search by name
GET /users?email=*@domain.com            // Email pattern matching
GET /users?status=active                 // Activity status
```

#### Advanced Filtering
```typescript
GET /users?roles=STUDENT,TEACHER         // Multiple roles
GET /users?createdAfter=2024-01-01       // Date range filtering
GET /users?createdBefore=2024-12-31      // Date range filtering
GET /users?lastLoginAfter=2024-11-01     // Recent activity
```

#### Sorting Options
```typescript
GET /users?sortBy=createdAt&sortOrder=desc
GET /users?sortBy=lastName&sortOrder=asc
GET /users?sortBy=lastLogin&sortOrder=desc
```

#### Combined Examples
```typescript
// Find active students created in 2024, sorted by name
GET /users?roles=STUDENT&status=active&createdAfter=2024-01-01&sortBy=lastName&sortOrder=asc

// Search for teachers with recent activity
GET /users?search=john&roles=TEACHER&lastLoginAfter=2024-11-01
```

### Technical Implementation

#### Query Parameter Validation
```typescript
interface GetUsersQuery {
  // Existing
  page?: number;
  limit?: number;
  role?: string;
  
  // New
  search?: string;           // Name search
  email?: string;           // Email pattern
  roles?: string;           // Comma-separated roles
  status?: 'active' | 'inactive';
  createdAfter?: string;    // ISO date
  createdBefore?: string;   // ISO date
  lastLoginAfter?: string;  // ISO date
  lastLoginBefore?: string; // ISO date
  sortBy?: 'createdAt' | 'lastName' | 'firstName' | 'lastLogin' | 'email';
  sortOrder?: 'asc' | 'desc';
}
```

#### Service Layer Updates
```typescript
// user.service.ts
interface GetUsersOptions {
  // Pagination
  page: number;
  limit: number;
  
  // Filtering
  roles?: string[];
  search?: string;
  emailPattern?: string;
  status?: 'active' | 'inactive';
  dateRange?: {
    createdAfter?: Date;
    createdBefore?: Date;
    lastLoginAfter?: Date;
    lastLoginBefore?: Date;
  };
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

async function getAllUsers(options: GetUsersOptions) {
  // Build dynamic Prisma query
  const where = buildWhereClause(options);
  const orderBy = buildOrderClause(options);
  
  return await prisma.user.findMany({
    where,
    orderBy,
    skip: (options.page - 1) * options.limit,
    take: options.limit,
  });
}
```

#### Database Query Optimization
```typescript
// Efficient search implementation
const buildWhereClause = (options: GetUsersOptions) => {
  const where: any = { isActive: true };
  
  // Name search
  if (options.search) {
    where.OR = [
      { firstName: { contains: options.search, mode: 'insensitive' } },
      { lastName: { contains: options.search, mode: 'insensitive' } },
    ];
  }
  
  // Email pattern
  if (options.emailPattern) {
    where.email = { contains: options.emailPattern.replace('*', ''), mode: 'insensitive' };
  }
  
  // Multiple roles
  if (options.roles?.length) {
    where.role = { in: options.roles };
  }
  
  // Date ranges
  if (options.dateRange?.createdAfter) {
    where.createdAt = { ...where.createdAt, gte: options.dateRange.createdAfter };
  }
  
  return where;
};
```

### Acceptance Criteria

#### Core Functionality
- [ ] Name search (first name, last name)
- [ ] Email pattern matching
- [ ] Multiple role filtering
- [ ] Date range filtering (created, last login)
- [ ] Activity status filtering
- [ ] Sorting by multiple fields
- [ ] Maintain existing pagination

#### Performance Requirements
- [ ] Efficient database queries
- [ ] Proper indexing recommendations
- [ ] Response time under 500ms for typical queries
- [ ] Handle large datasets gracefully

#### API Compatibility
- [ ] Backward compatibility with existing queries
- [ ] Proper parameter validation
- [ ] Clear error messages for invalid parameters
- [ ] Consistent response format

#### Response Format
```typescript
{
  users: User[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  filters: {
    applied: string[],    // List of active filters
    search?: string,
    roles?: string[],
    // ... other applied filters
  }
}
```

### Validation Rules

#### Search Parameters
- `search`: 2-50 characters, alphanumeric + spaces
- `email`: Valid email pattern with * wildcards
- `roles`: Valid role names only
- `status`: 'active' or 'inactive' only
- Date fields: Valid ISO date strings

#### Performance Limits
- `limit`: Maximum 100 users per request
- Complex queries: Maximum 5 filter parameters
- Search terms: Minimum 2 characters

### Testing Requirements

#### Unit Tests
- [ ] Query parameter validation
- [ ] Where clause building logic
- [ ] Sorting logic
- [ ] Edge cases (empty results, invalid params)

#### Integration Tests
- [ ] Full search scenarios
- [ ] Combined filter testing
- [ ] Performance testing with large datasets
- [ ] Backward compatibility verification

### Database Considerations

#### Recommended Indexes
```sql
-- For name search
CREATE INDEX idx_users_name ON users(first_name, last_name);

-- For email search
CREATE INDEX idx_users_email ON users(email);

-- For date filtering
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Composite for common queries
CREATE INDEX idx_users_role_active ON users(role, is_active);
```

### Files to Modify
```
src/
├── routes/user.routes.ts         # Add query parameter handling
├── services/user.service.ts      # Enhanced getAllUsers function
└── utils/validation.ts           # Query parameter validation

tests/
├── unit/services/user.service.enhanced.test.ts
└── integration/user.search.test.ts

docs/
└── api/user-endpoints.md         # Update documentation
```

### Why Good First Issue
- Clear, well-defined requirements
- Existing patterns to follow
- Incremental implementation possible
- Good introduction to query optimization
- Immediate visible impact

### Estimated Effort
**Small-Medium** (2-4 days)

---

## Issue 5: Add User Activity Tracking and Analytics

**Labels:** `enhancement`, `analytics`, `feature`

### Feature Description
Implement comprehensive user activity tracking and analytics system to provide insights into user engagement and platform usage patterns.

### Business Value
- **Platform Insights**: Understand user engagement patterns
- **Administrative Tools**: Help admins monitor platform health
- **User Experience**: Identify usage bottlenecks and popular features
- **Security Monitoring**: Detect unusual activity patterns

### Current Limitations
- Basic last login tracking only
- No activity analytics or reporting
- Limited admin insights into user behavior

### Proposed Features

#### Enhanced Activity Tracking
```typescript
// Track various user activities
- Login/logout events with timestamps
- API endpoint usage patterns
- Session duration tracking
- Failed login attempts
- Password change events
- Profile updates
```

#### Analytics Endpoints
```typescript
GET /users/:id/analytics          // Individual user analytics
GET /users/analytics/overview     // Platform-wide analytics
GET /users/analytics/activity     // Recent activity feed
GET /users/analytics/engagement   // User engagement metrics
```

#### Admin Dashboard Data
```typescript
// Aggregate statistics
- Total active users (daily/weekly/monthly)
- Login frequency distributions
- User retention metrics
- Popular usage times
- Geographic distribution (if tracking)
- Role-based usage patterns
```

### Technical Implementation

#### Database Schema Updates
```typescript
// New UserActivity model
model UserActivity {
  id          String   @id @default(cuid())
  userId      String
  activityType String  // 'login', 'logout', 'api_call', 'password_change', etc.
  endpoint    String?  // API endpoint if applicable
  metadata    Json?    // Additional context data
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId, timestamp])
  @@index([activityType, timestamp])
}

// Enhanced User model
model User {
  // ... existing fields
  
  // Enhanced tracking
  loginCount        Int @default(0)
  lastLoginIP       String?
  sessionDuration   Int? // in minutes
  totalSessionTime  Int @default(0) // total minutes
  
  activities        UserActivity[]
}
```

#### Activity Tracking Service
```typescript
// services/analytics.service.ts
interface ActivityEvent {
  userId: string;
  activityType: 'login' | 'logout' | 'api_call' | 'password_change' | 'profile_update';
  endpoint?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

async function trackActivity(event: ActivityEvent) {
  await prisma.userActivity.create({
    data: {
      userId: event.userId,
      activityType: event.activityType,
      endpoint: event.endpoint,
      metadata: event.metadata,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    }
  });
}

async function getUserAnalytics(userId: string, timeRange: string) {
  // Return user-specific analytics
}

async function getPlatformAnalytics(timeRange: string) {
  // Return platform-wide analytics
}
```

#### Middleware Integration
```typescript
// middleware/activity.middleware.ts
export const trackApiActivity = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (req.user?.userId) {
      trackActivity({
        userId: req.user.userId,
        activityType: 'api_call',
        endpoint: `${req.method} ${req.path}`,
        metadata: {
          statusCode: res.statusCode,
          responseTime: Date.now() - req.startTime
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
  });
  next();
};
```

### Analytics API Endpoints

#### Individual User Analytics
```typescript
GET /users/:id/analytics?timeRange=7d

Response:
{
  userId: string,
  timeRange: string,
  summary: {
    totalSessions: number,
    averageSessionDuration: number,
    totalApiCalls: number,
    lastActive: string,
    mostActiveDay: string,
    mostUsedEndpoints: Array<{endpoint: string, count: number}>
  },
  activityTimeline: Array<{
    date: string,
    sessions: number,
    apiCalls: number,
    sessionDuration: number
  }>,
  recentActivity: Array<{
    timestamp: string,
    activityType: string,
    endpoint?: string,
    metadata?: any
  }>
}
```

#### Platform Analytics
```typescript
GET /users/analytics/overview?timeRange=30d

Response:
{
  timeRange: string,
  totalUsers: number,
  activeUsers: {
    daily: number,
    weekly: number,
    monthly: number
  },
  newRegistrations: number,
  sessionMetrics: {
    totalSessions: number,
    averageDuration: number,
    averageSessionsPerUser: number
  },
  apiUsage: {
    totalRequests: number,
    averageResponseTime: number,
    mostPopularEndpoints: Array<{endpoint: string, count: number}>
  },
  userEngagement: {
    highlyActive: number,    // Users with >10 sessions
    moderatelyActive: number, // Users with 3-10 sessions
    lowActivity: number      // Users with 1-2 sessions
  }
}
```

### Acceptance Criteria

#### Core Functionality
- [ ] Activity tracking for all major user actions
- [ ] User-specific analytics endpoint
- [ ] Platform-wide analytics endpoint
- [ ] Activity timeline and history
- [ ] Session duration tracking
- [ ] API usage analytics

#### Performance Requirements
- [ ] Efficient activity logging (async/background)
- [ ] Optimized analytics queries
- [ ] Data aggregation for large datasets
- [ ] Response time under 1s for analytics queries

#### Privacy and Security
- [ ] Configurable activity tracking levels
- [ ] Data retention policies
- [ ] Anonymous analytics options
- [ ] IP address anonymization option
- [ ] GDPR compliance considerations

#### Administrative Features
- [ ] Admin-only analytics endpoints
- [ ] Exportable analytics data
- [ ] Real-time activity monitoring
- [ ] Suspicious activity detection

### Data Retention Strategy

#### Retention Policies
```typescript
// Configurable retention periods
const RETENTION_CONFIG = {
  detailedActivity: 90,    // days
  aggregatedMetrics: 365,  // days
  anonymizedData: 1095,    // 3 years
};

// Cleanup job
async function cleanupOldActivity() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_CONFIG.detailedActivity);
  
  await prisma.userActivity.deleteMany({
    where: {
      timestamp: { lt: cutoffDate }
    }
  });
}
```

### Testing Requirements

#### Unit Tests
- [ ] Activity tracking functions
- [ ] Analytics calculation logic
- [ ] Data aggregation algorithms
- [ ] Performance optimization tests

#### Integration Tests
- [ ] End-to-end activity tracking
- [ ] Analytics endpoint responses
- [ ] Data consistency across time ranges
- [ ] Large dataset performance

#### Privacy Tests
- [ ] Data anonymization verification
- [ ] Retention policy enforcement
- [ ] Admin access control
- [ ] User data export/deletion

### Performance Considerations

#### Database Optimization
```sql
-- Indexes for analytics queries
CREATE INDEX idx_user_activity_user_time ON user_activity(user_id, timestamp);
CREATE INDEX idx_user_activity_type_time ON user_activity(activity_type, timestamp);
CREATE INDEX idx_user_activity_endpoint ON user_activity(endpoint, timestamp);

-- Partitioning by date for large datasets
CREATE TABLE user_activity_2024_09 PARTITION OF user_activity
FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
```

#### Caching Strategy
- Redis cache for frequently accessed analytics
- Pre-aggregated metrics for common time ranges
- Background jobs for heavy analytics calculations

### Files to Create/Modify
```
src/
├── services/analytics.service.ts      # Core analytics logic
├── routes/analytics.routes.ts         # Analytics endpoints
├── middleware/activity.middleware.ts  # Activity tracking
├── utils/analytics.helpers.ts         # Helper functions
└── jobs/analyticsCleanup.job.ts      # Data cleanup

prisma/
├── schema.prisma                      # UserActivity model
└── migrations/                        # Database migrations

tests/
├── unit/services/analytics.test.ts
├── integration/analytics.routes.test.ts
└── performance/analytics.perf.test.ts
```

### Estimated Effort
**Large** (1-2 weeks)

### Success Metrics
- Analytics response time under 1 second
- 99.9% activity tracking reliability
- Admin adoption of analytics features
- Performance impact on existing endpoints minimal

---

## Issue 6: Implement Profile Picture Upload and Management

**Labels:** `enhancement`, `feature`, `good first issue`

### Feature Description
Enable users to upload, manage, and display profile pictures with proper file handling, optimization, and security measures.

### Current State
- Profile picture field exists but only accepts URL strings
- No file upload functionality
- No image processing or optimization

### User Stories
- **As a user**, I want to upload my profile picture to personalize my account
- **As a user**, I want to see profile pictures in user listings and profiles
- **As an admin**, I want to ensure uploaded images meet size and format requirements

### Technical Requirements

#### File Upload System
```typescript
// New endpoint for file uploads
POST /users/:id/avatar
Content-Type: multipart/form-data

// File validation
- Supported formats: JPEG, PNG, WebP, GIF
- Maximum file size: 5MB
- Minimum dimensions: 100x100px
- Maximum dimensions: 2048x2048px
```

#### Image Processing
```typescript
// Automatic image optimization
- Resize to standard dimensions: 256x256px
- Generate multiple sizes: thumbnail (64x64), medium (128x128), full (256x256)
- Compress images for web delivery
- Convert to WebP format for modern browsers
- Maintain original aspect ratio with smart cropping
```

#### File Storage
```typescript
// Storage options (configurable)
Option A: Local file system
- Store in /uploads/avatars/{userId}/
- Secure filename generation
- Direct file serving with Express static

Option B: Cloud storage (AWS S3, Cloudinary)
- Upload to cloud storage
- CDN delivery
- Automatic backups
```

### API Design

#### Upload Avatar
```typescript
POST /users/:id/avatar
Content-Type: multipart/form-data

Request:
- file: Image file (multipart)
- cropData?: {x: number, y: number, width: number, height: number}

Response:
{
  success: true,
  avatar: {
    original: "https://example.com/avatars/user123/original.webp",
    large: "https://example.com/avatars/user123/large.webp",
    medium: "https://example.com/avatars/user123/medium.webp",
    thumbnail: "https://example.com/avatars/user123/thumb.webp"
  },
  user: {
    // Updated user object with new avatar URLs
  }
}
```

#### Get Avatar
```typescript
GET /users/:id/avatar?size=medium

Response:
- Direct image file or redirect to CDN URL
- Proper caching headers
- Support for different sizes
```

#### Delete Avatar
```typescript
DELETE /users/:id/avatar

Response:
{
  success: true,
  message: "Avatar deleted successfully"
}
```

### Technical Implementation

#### Database Schema Updates
```typescript
// Update User model
model User {
  // ... existing fields
  
  // Avatar URLs for different sizes
  avatarOriginal   String?
  avatarLarge      String?    // 256x256
  avatarMedium     String?    // 128x128
  avatarThumbnail  String?    // 64x64
  
  // Metadata
  avatarUploadedAt DateTime?
  avatarFileSize   Int?       // in bytes
  avatarMimeType   String?
}
```

#### File Upload Service
```typescript
// services/avatar.service.ts
import multer from 'multer';
import sharp from 'sharp';

interface AvatarUpload {
  userId: string;
  file: Express.Multer.File;
  cropData?: {x: number, y: number, width: number, height: number};
}

interface AvatarUrls {
  original: string;
  large: string;
  medium: string;
  thumbnail: string;
}

async function processAndUploadAvatar(upload: AvatarUpload): Promise<AvatarUrls> {
  // Validate file
  validateImageFile(upload.file);
  
  // Process image with Sharp
  const processedImages = await processImageSizes(upload.file, upload.cropData);
  
  // Upload to storage
  const urls = await uploadToStorage(upload.userId, processedImages);
  
  // Update user record
  await updateUserAvatar(upload.userId, urls);
  
  return urls;
}

async function processImageSizes(file: Express.Multer.File, cropData?: any) {
  const image = sharp(file.buffer);
  
  // Apply cropping if provided
  if (cropData) {
    image.extract({
      left: cropData.x,
      top: cropData.y,
      width: cropData.width,
      height: cropData.height
    });
  }
  
  // Generate different sizes
  const sizes = {
    original: await image.resize(256, 256).webp().toBuffer(),
    large: await image.resize(256, 256).webp().toBuffer(),
    medium: await image.resize(128, 128).webp().toBuffer(),
    thumbnail: await image.resize(64, 64).webp().toBuffer()
  };
  
  return sizes;
}
```

#### Multer Configuration
```typescript
// middleware/upload.middleware.ts
import multer from 'multer';

const avatarUpload = multer({
  storage: multer.memoryStorage(), // Store in memory for processing
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

export const uploadAvatar = avatarUpload.single('avatar');
```

#### Storage Implementation
```typescript
// utils/storage.ts
interface StorageProvider {
  uploadImage(userId: string, filename: string, buffer: Buffer): Promise<string>;
  deleteImage(url: string): Promise<void>;
  getSignedUrl(filename: string): Promise<string>;
}

// Local file system storage
class LocalStorage implements StorageProvider {
  private basePath = './uploads/avatars';
  
  async uploadImage(userId: string, filename: string, buffer: Buffer): Promise<string> {
    const userDir = path.join(this.basePath, userId);
    await fs.ensureDir(userDir);
    
    const filePath = path.join(userDir, filename);
    await fs.writeFile(filePath, buffer);
    
    return `/uploads/avatars/${userId}/${filename}`;
  }
  
  async deleteImage(url: string): Promise<void> {
    const filePath = path.join(process.cwd(), url);
    await fs.remove(filePath);
  }
}

// AWS S3 storage (optional)
class S3Storage implements StorageProvider {
  // Implementation for S3 uploads
}
```

### Route Implementation
```typescript
// routes/user.routes.ts
import { uploadAvatar } from '../middleware/upload.middleware';
import { processAndUploadAvatar, deleteUserAvatar } from '../services/avatar.service';

// Upload avatar
router.post('/:id/avatar', 
  authenticateToken, 
  injectUserContext, 
  requireOwnership, 
  uploadAvatar,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const avatarUrls = await processAndUploadAvatar({
        userId: req.params.id,
        file: req.file,
        cropData: req.body.cropData ? JSON.parse(req.body.cropData) : undefined
      });

      res.json({
        success: true,
        avatar: avatarUrls,
        message: 'Avatar uploaded successfully'
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }
);

// Get avatar
router.get('/:id/avatar', async (req, res) => {
  try {
    const size = req.query.size as string || 'medium';
    const user = await getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const avatarUrl = getAvatarUrl(user, size);
    
    if (!avatarUrl) {
      // Return default avatar
      return res.redirect('/assets/default-avatar.png');
    }
    
    // Redirect to actual avatar URL or serve file directly
    res.redirect(avatarUrl);
  } catch (error) {
    console.error('Get avatar error:', error);
    res.status(500).json({ error: 'Failed to get avatar' });
  }
});

// Delete avatar
router.delete('/:id/avatar',
  authenticateToken,
  injectUserContext,
  requireOwnership,
  async (req, res) => {
    try {
      await deleteUserAvatar(req.params.id);
      
      res.json({
        success: true,
        message: 'Avatar deleted successfully'
      });
    } catch (error) {
      console.error('Delete avatar error:', error);
      res.status(500).json({ error: 'Failed to delete avatar' });
    }
  }
);
```

### Acceptance Criteria

#### Core Functionality
- [ ] Upload image files via multipart form data
- [ ] Support JPEG, PNG, WebP, GIF formats
- [ ] File size validation (5MB maximum)
- [ ] Image dimension validation
- [ ] Generate multiple image sizes automatically
- [ ] Secure file storage with proper naming

#### Image Processing
- [ ] Resize images to standard dimensions
- [ ] Maintain aspect ratio with smart cropping
- [ ] Convert to WebP for optimization
- [ ] Generate thumbnail, medium, and large sizes
- [ ] Optional crop coordinates support

#### Security
- [ ] File type validation
- [ ] File size limits
- [ ] Secure filename generation
- [ ] User ownership verification
- [ ] Prevent directory traversal attacks

#### User Experience
- [ ] Default avatar for users without uploads
- [ ] Fast image loading with proper caching
- [ ] Replace existing avatars seamlessly
- [ ] Delete avatar functionality
- [ ] Progress indicators for uploads

#### Integration
- [ ] Update user profiles with avatar URLs
- [ ] Display avatars in user listings
- [ ] Gateway service compatibility
- [ ] Responsive image serving

### Testing Requirements

#### Unit Tests
- [ ] File validation logic
- [ ] Image processing functions
- [ ] Storage provider implementations
- [ ] Avatar URL generation

#### Integration Tests
- [ ] Complete upload flow
- [ ] File format validation
- [ ] Size limit enforcement
- [ ] Delete functionality
- [ ] Error handling scenarios

#### Security Tests
- [ ] Malicious file upload prevention
- [ ] File type spoofing attempts
- [ ] Size limit bypass attempts
- [ ] Path traversal prevention

### Dependencies
```json
{
  "multer": "^1.4.5",
  "sharp": "^0.32.0",
  "fs-extra": "^11.0.0",
  "aws-sdk": "^2.1400.0" // Optional for S3
}
```

### Environment Variables
```env
# Avatar storage configuration
AVATAR_STORAGE_TYPE=local # or 's3'
AVATAR_UPLOAD_PATH=./uploads/avatars
AVATAR_MAX_SIZE=5242880 # 5MB in bytes
AVATAR_BASE_URL=http://localhost:4000

# AWS S3 configuration (if using S3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Files to Create/Modify
```
src/
├── services/avatar.service.ts         # Avatar processing logic
├── middleware/upload.middleware.ts    # Multer configuration
├── utils/storage.ts                   # Storage providers
├── routes/user.routes.ts              # Avatar endpoints
└── utils/imageProcessing.ts           # Image utilities

uploads/                               # Local storage directory
└── avatars/
    └── {userId}/
        ├── original.webp
        ├── large.webp
        ├── medium.webp
        └── thumbnail.webp

tests/
├── unit/services/avatar.test.ts
├── integration/avatar.upload.test.ts
└── security/avatar.security.test.ts

assets/
└── default-avatar.png                # Default avatar image
```

### Why Good First Issue
- Clear, well-defined functionality
- Existing file upload patterns available online
- Visual feedback makes testing easy
- Non-critical feature that doesn't break existing functionality
- Good introduction to file handling and image processing

### Estimated Effort
**Medium** (3-5 days)

### Success Metrics
- Upload success rate >95%
- Image processing time <3 seconds
- Storage efficiency (proper compression)
- User adoption of avatar feature

---

## Summary

These 6 issues provide a comprehensive roadmap for enhancing the User Service:

1. **Fix Integration Tests** (Good First Issue) - Testing infrastructure
2. **Email Verification** - Security enhancement  
3. **Password Reset** - Security feature
4. **Enhanced Search/Filtering** (Good First Issue) - User management
5. **Activity Analytics** - Platform insights
6. **Profile Picture Upload** (Good First Issue) - User experience

Each issue is self-contained and can be worked on independently, making them perfect for parallel development by contributors.