import express from 'express';
import { UserContext } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

/**
 * Middleware to extract user context from headers
 * This is typically set by the API Gateway after token verification
 */
export const userContextMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const email = req.headers['x-user-email'] as string;
    const role = req.headers['x-user-role'] as string;
    const permissions = req.headers['x-user-permissions'] as string;

    if (!userId || !email || !role) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    req.user = {
      userId,
      email,
      role: role as 'student' | 'teacher' | 'admin',
      permissions: permissions ? permissions.split(',') : []
    };

    next();
  } catch (error) {
    console.error('Error in user context middleware:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid authentication context'
    });
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (roles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const userContext = req.user as UserContext;

    if (!userContext) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(userContext.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  console.error('Unhandled error:', error);

  // Don't send error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(isDevelopment && { details: error.message, stack: error.stack })
  });
};