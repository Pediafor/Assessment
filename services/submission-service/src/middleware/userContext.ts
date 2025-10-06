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
      throw new UnauthorizedError('User context not found in request headers');
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
 * Middleware to require student role
 */
export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('User context not found');
  }

  if (req.user.role !== 'STUDENT') {
    throw new UnauthorizedError('Student access required');
  }

  next();
};

/**
 * Middleware to require teacher or admin role
 */
export const requireTeacherOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('User context not found');
  }

  if (!['TEACHER', 'ADMIN'].includes(req.user.role)) {
    throw new UnauthorizedError('Teacher or Admin access required');
  }

  next();
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('User context not found');
  }

  if (req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('Admin access required');
  }

  next();
};