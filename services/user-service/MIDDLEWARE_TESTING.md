# PASETO Middleware Testing Guide

## 🔐 **Authentication Middleware Implementation**

Our middleware provides comprehensive authentication and authorization for all API endpoints.

### **Middleware Functions**

| Middleware | Purpose | Usage |
|------------|---------|-------|
| `authenticateToken` | Validates PASETO tokens, extracts user info | Required auth |
| `requireRole(['ADMIN'])` | Ensures user has specific role(s) | Role-based access |
| `requireOwnership` | Users can only access their own resources | Data ownership |
| `injectUserContext` | Adds user headers for downstream services | Microservice integration |
| `optionalAuth` | Authentication optional, doesn't fail if no token | Public + auth endpoints |

### **Protected Routes**

```
✅ PUBLIC ROUTES (No authentication required):
POST /users/register    - User registration
POST /auth/login        - User login  
POST /auth/refresh      - Token refresh
POST /auth/logout       - User logout
GET  /                  - Service info
GET  /health           - Health check

🔐 PROTECTED ROUTES (Authentication + authorization required):
GET    /users/:id       - Get user profile (self or admin)
PUT    /users/:id       - Update user profile (self or admin)  
DELETE /users/:id       - Delete user account (self or admin)
GET    /users           - List all users (admin only)
```

### **Testing Authentication Flow**

#### 1. **Register and Login to Get Access Token**
```bash
# Register user
curl -X POST http://localhost:4000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "STUDENT"
  }'

# Login to get access token
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePassword123!"}'
```

#### 2. **Test Protected Routes with Token**
```bash
# Get user profile (with valid token)
curl -X GET http://localhost:4000/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Try without token (should fail with 401)
curl -X GET http://localhost:4000/users/USER_ID

# Try to access another user's profile (should fail with 403)
curl -X GET http://localhost:4000/users/ANOTHER_USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. **Test Admin-Only Routes**
```bash
# List all users (requires ADMIN role)
curl -X GET http://localhost:4000/users \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"

# Should fail with 403 for non-admin users
curl -X GET http://localhost:4000/users \
  -H "Authorization: Bearer STUDENT_ACCESS_TOKEN"
```

### **PowerShell Testing Examples**

```powershell
# Login and store access token
$loginResponse = Invoke-WebRequest -Uri "http://localhost:4000/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"SecurePassword123!"}'

$token = ($loginResponse.Content | ConvertFrom-Json).accessToken

# Test protected route with authentication
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-WebRequest -Uri "http://localhost:4000/users/USER_ID" -Headers $headers

# Test without authentication (should fail)
try {
  Invoke-WebRequest -Uri "http://localhost:4000/users/USER_ID"
} catch {
  Write-Host "Expected 401 Unauthorized: $($_.Exception.Response.StatusCode)"
}
```

### **Error Responses**

```json
// No token provided
{
  "error": "Access token required",
  "message": "Please provide a valid access token in Authorization header"
}

// Invalid/expired token
{
  "error": "Token expired", 
  "message": "Access token has expired, please refresh"
}

// Insufficient permissions
{
  "error": "Insufficient permissions",
  "message": "Access denied. Required roles: ADMIN"
}

// Ownership violation
{
  "error": "Access denied",
  "message": "You can only access your own resources"
}
```

### **User Context Headers (for downstream services)**

When authenticated, these headers are added to requests:
- `x-user-id`: User's unique identifier
- `x-user-email`: User's email address  
- `x-user-role`: User's role (STUDENT/TEACHER/ADMIN)
- `x-user-active`: Whether user account is active (true/false)

This allows other microservices to:
- Link data to users without direct database access
- Implement their own authorization logic
- Track user activity across services

### **Middleware Security Features**

- ✅ **Token Validation**: PASETO V4 with Ed25519 verification
- ✅ **User Verification**: Checks user still exists and is active
- ✅ **Role-Based Access**: Granular permission control
- ✅ **Ownership Protection**: Users can only access their own data
- ✅ **Token Expiration**: Automatic handling of expired tokens
- ✅ **Error Handling**: Comprehensive error messages and status codes
- ✅ **Context Injection**: User info available to downstream services