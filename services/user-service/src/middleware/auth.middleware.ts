import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/paseto";
import { getUserById } from "../services/user.service";

// Extend Express Request interface to include user
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

/**
 * Middleware to authenticate PASETO access tokens
 * Extracts user information and adds it to request object
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        error: "Access token required",
        message: "Please provide a valid access token in Authorization header"
      });
    }

    // Verify PASETO token
    const payload = await verifyAccessToken(token);
    
    if (!payload || !payload.userId) {
      return res.status(401).json({
        error: "Invalid access token",
        message: "Token verification failed"
      });
    }

    // Get user from database to ensure they still exist and are active
    const user = await getUserById(payload.userId);
    
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "User associated with token no longer exists"
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: "Account deactivated",
        message: "User account has been deactivated"
      });
    }

    // Add user info to request object (excluding sensitive data)
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive
    };

    next();
  } catch (error: any) {
    console.error("Authentication error:", error);
    
    // Handle different types of token errors
    if (error.message.includes('expired')) {
      return res.status(401).json({
        error: "Token expired",
        message: "Access token has expired, please refresh"
      });
    }
    
    if (error.message.includes('invalid')) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token signature or format is invalid"
      });
    }

    return res.status(401).json({
      error: "Authentication failed",
      message: "Unable to verify access token"
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * Useful for endpoints that have different behavior for authenticated users
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (!token) {
      // No token provided, continue without user info
      return next();
    }

    // Try to authenticate, but don't fail if token is invalid
    const payload = await verifyAccessToken(token);
    
    if (payload && payload.userId) {
      const user = await getUserById(payload.userId);
      
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role,
          isActive: user.isActive
        };
      }
    }

    next();
  } catch (error) {
    // Silently continue without authentication for optional auth
    next();
  }
};

/**
 * Role-based authorization middleware
 * Requires user to be authenticated and have specific role(s)
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Must be authenticated to access this resource"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to ensure user can only access their own resources
 * Checks if the userId parameter matches the authenticated user's ID
 */
export const requireOwnership = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Must be authenticated to access this resource"
    });
  }

  const requestedUserId = req.params.id || req.params.userId;
  
  if (!requestedUserId) {
    return res.status(400).json({
      error: "Invalid request",
      message: "User ID parameter is required"
    });
  }

  // Allow access if user is requesting their own data or if they're an admin
  if (req.user.id === requestedUserId || req.user.role === 'ADMIN') {
    return next();
  }

  return res.status(403).json({
    error: "Access denied",
    message: "You can only access your own resources"
  });
};

/**
 * Middleware to inject user ID as pseudo foreign key for downstream services
 * Adds user context to request headers for microservice communication
 */
export const injectUserContext = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    // Add user context headers for downstream services
    req.headers['x-user-id'] = req.user.id;
    req.headers['x-user-email'] = req.user.email;
    req.headers['x-user-role'] = req.user.role;
    req.headers['x-user-active'] = req.user.isActive.toString();
    
    // Also add to response headers for client visibility (optional)
    res.setHeader('X-User-Context', 'authenticated');
  }
  
  next();
};