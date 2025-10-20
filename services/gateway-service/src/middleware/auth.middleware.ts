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
// Accepts either PEM (-----BEGIN PUBLIC KEY-----) or base64-encoded DER (SPKI)
const RAW_PUBLIC_KEY = process.env.PASETO_PUBLIC_KEY || '';
let PUBLIC_KEY_OBJECT: crypto.KeyObject | null = null;
const GATEWAY_SECRET = process.env.GATEWAY_SECRET || 'gateway-secret-key-change-in-production';

// Helper to create public key object from string
function getPublicKeyObject(): crypto.KeyObject {
  if (PUBLIC_KEY_OBJECT) return PUBLIC_KEY_OBJECT;

  if (!RAW_PUBLIC_KEY) {
    throw new Error('PASETO_PUBLIC_KEY not set in gateway');
  }

  try {
    // If looks like PEM, normalize escaped newlines
    if (RAW_PUBLIC_KEY.includes('BEGIN PUBLIC KEY')) {
      const pem = RAW_PUBLIC_KEY.replace(/\\n/g, '\n');
      PUBLIC_KEY_OBJECT = crypto.createPublicKey(pem);
      return PUBLIC_KEY_OBJECT;
    }

    // Try base64 decode; it may be PEM text or raw DER SPKI
    const decoded = Buffer.from(RAW_PUBLIC_KEY, 'base64');
    const asUtf8 = decoded.toString('utf8');
    if (asUtf8.includes('BEGIN PUBLIC KEY')) {
      PUBLIC_KEY_OBJECT = crypto.createPublicKey(asUtf8);
      return PUBLIC_KEY_OBJECT;
    }
    // Otherwise assume decoded bytes are DER SPKI
    PUBLIC_KEY_OBJECT = crypto.createPublicKey({ key: decoded, format: 'der', type: 'spki' });
    return PUBLIC_KEY_OBJECT;
  } catch (e) {
    // Provide actionable error
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to construct PASETO public key: ${msg}`);
  }
}

// Verify PASETO token using public key
async function verifyAccessToken(token: string) {
  const publicKey = getPublicKeyObject();
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