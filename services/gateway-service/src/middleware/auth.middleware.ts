import { Request, Response, NextFunction } from 'express';
import { V4 } from 'paseto';
import crypto from 'crypto';

// Extend Express Request interface to include user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

// PASETO public key for token verification (shared with UserService)
const PUBLIC_KEY_ENV = process.env.PASETO_PUBLIC_KEY!;
const PUBLIC_KEY = PUBLIC_KEY_ENV.startsWith('-----BEGIN') 
  ? PUBLIC_KEY_ENV 
  : Buffer.from(PUBLIC_KEY_ENV, 'base64').toString('utf8');
const GATEWAY_SECRET = process.env.GATEWAY_SECRET || 'gateway-secret-key-change-in-production';

// Helper to create public key object from string
function createPublicKey(keyString: string) {
  try {
    return crypto.createPublicKey(keyString);
  } catch {
    const keyBuffer = Buffer.from(keyString, 'base64');
    return crypto.createPublicKey({
      key: keyBuffer,
      format: 'der',
      type: 'spki'
    });
  }
}

// Verify PASETO token using public key
async function verifyAccessToken(token: string) {
  if (!PUBLIC_KEY) throw new Error('PASETO_PUBLIC_KEY not set in gateway');
  
  const publicKey = createPublicKey(PUBLIC_KEY);
  const payload = await V4.verify(token, publicKey) as any;
  
  // Check expiration
  if (payload.exp && new Date(payload.exp) < new Date()) {
    throw new Error('Token has expired');
  }
  
  // Check audience and issuer
  if (payload.aud !== 'pediafor-assessment' || payload.iss !== 'user-service') {
    throw new Error('Invalid token audience or issuer');
  }
  
  return payload;
}

// Create gateway signature to prevent header spoofing
function createGatewaySignature(userId: string, email: string, role: string): string {
  return crypto.createHmac('sha256', GATEWAY_SECRET)
    .update(`${userId}:${email}:${role}`)
    .digest('hex');
}

/**
 * Gateway authentication middleware
 * Validates PASETO tokens and injects user context headers for downstream services
 */
export const authenticateGateway = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`[GATEWAY AUTH] ${req.method} ${req.url}`);
    
    // Skip authentication for public routes
    // Handle both direct routes (with /api prefix in tests) and proxied routes (without /api prefix)
    const publicRoutes = [
      '/auth/login',
      '/auth/refresh', 
      '/auth/logout',
      '/users/register',
      '/users/login',
      '/users/verify-email',
      '/users/forgot-password',
      '/users/reset-password',
      '/health',
      // Test routes with /api prefix
      '/api/auth/login',
      '/api/auth/refresh', 
      '/api/auth/logout',
      '/api/users/register',
      '/api/users/login',
      '/api/users/verify-email',
      '/api/users/forgot-password',
      '/api/users/reset-password'
    ];
    
    const isPublicRoute = publicRoutes.some(route => 
      req.path.startsWith(route) || req.path === route
    );
    
    if (isPublicRoute) {
      console.log(`[GATEWAY AUTH] Public route detected: ${req.path}`);
      return next();
    }
    
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;
    
    if (!token) {
      console.log(`[GATEWAY AUTH] No token provided for protected route: ${req.path}`);
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid access token in Authorization header'
      });
    }
    
    // Verify PASETO token
    const payload = await verifyAccessToken(token);
    
    if (!payload || !payload.userId) {
      console.log(`[GATEWAY AUTH] Invalid token payload`);
      return res.status(401).json({
        error: 'Invalid access token',
        message: 'Token verification failed'
      });
    }
    
    console.log(`[GATEWAY AUTH] Token validated for user: ${payload.userId}`);
    
    // Note: In a full implementation, we might cache user info or fetch from UserService
    // For now, we'll trust the token payload and add headers
    const user = {
      id: payload.userId,
      email: payload.email || '',
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      role: payload.role || 'STUDENT',
      isActive: payload.isActive !== false
    };
    
    // Add user context to request for downstream services
    req.user = user;
    
    // Create signed headers for downstream services
    const signature = createGatewaySignature(user.id, user.email, user.role);
    
    // Inject user context headers with gateway signature
    req.headers['x-user-id'] = user.id;
    req.headers['x-user-email'] = user.email;
    req.headers['x-user-role'] = user.role;
    req.headers['x-user-active'] = user.isActive.toString();
    req.headers['x-user-first-name'] = user.firstName;
    req.headers['x-user-last-name'] = user.lastName;
    req.headers['x-gateway-signature'] = signature;
    req.headers['x-authenticated'] = 'true';
    
    console.log(`[GATEWAY AUTH] User context injected: ${user.role} user ${user.id}`);
    
    next();
  } catch (error: any) {
    console.error('[GATEWAY AUTH] Authentication error:', error.message);
    
    // Handle different types of token errors
    if (error.message.includes('expired')) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired, please refresh'
      });
    }
    
    if (error.message.includes('invalid')) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token signature or format is invalid'
      });
    }
    
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Unable to verify access token'
    });
  }
};

/**
 * Verify gateway signature (for downstream services)
 * This function can be used by downstream services to verify headers came from gateway
 */
export function verifyGatewaySignature(
  userId: string, 
  email: string, 
  role: string, 
  signature: string
): boolean {
  const expectedSignature = createGatewaySignature(userId, email, role);
  return signature === expectedSignature;
}