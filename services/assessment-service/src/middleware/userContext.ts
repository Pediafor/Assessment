import { Request, Response, NextFunction } from 'express';
import { UserContext, UnauthorizedError } from '../types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user: UserContext;
    }
  }
}

/**
 * Middleware to extract user context from gateway headers
 * Gateway injects user data via signed headers after authentication
 */
export const extractUserContext = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract user data from gateway headers
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const userFirstName = req.headers['x-user-first-name'] as string;
    const userLastName = req.headers['x-user-last-name'] as string;
    const gatewaySignature = req.headers['x-gateway-signature'] as string;

    // Validate required headers
    if (!userId || !userEmail || !userRole) {
      throw new UnauthorizedError('Missing user context headers from gateway');
    }

    // Validate gateway signature (optional security check)
    if (process.env.VERIFY_GATEWAY_SIGNATURE === 'true' && !gatewaySignature) {
      throw new UnauthorizedError('Missing gateway signature');
    }

    // Create user context
    const userContext: UserContext = {
      id: userId,
      email: userEmail,
      role: userRole as 'STUDENT' | 'TEACHER' | 'ADMIN',
      firstName: userFirstName || undefined,
      lastName: userLastName || undefined,
    };

    // Attach to request
    req.user = userContext;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User context not found');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new UnauthorizedError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to require teacher or admin role
 */
export const requireTeacherOrAdmin = requireRole(['TEACHER', 'ADMIN']);

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole(['ADMIN']);