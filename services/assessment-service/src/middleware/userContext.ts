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
 * Gateway provides authenticated user data via trusted headers
 */
export const extractUserContext = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract user data from gateway headers
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const userFirstName = req.headers['x-user-first-name'] as string;
    const userLastName = req.headers['x-user-last-name'] as string;

    // Validate required headers
    if (!userId || !userEmail || !userRole) {
      throw new UnauthorizedError('Missing user context headers from gateway');
    }

    // Validate role is one of the expected values
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
    if (!validRoles.includes(userRole)) {
      throw new UnauthorizedError(`Invalid user role: ${userRole}`);
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