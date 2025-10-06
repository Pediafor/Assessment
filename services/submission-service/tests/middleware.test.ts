import { Request, Response, NextFunction } from 'express';
import { extractUserContext, requireStudent, requireTeacherOrAdmin, requireAdmin } from '../src/middleware/userContext';
import { UnauthorizedError } from '../src/types';

describe('User Context Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();
  });

  describe('extractUserContext', () => {
    it('should extract valid user context from headers', () => {
      req.headers = {
        'x-user-id': 'user-123',
        'x-user-email': 'test@example.com',
        'x-user-role': 'STUDENT',
        'x-user-first-name': 'John',
        'x-user-last-name': 'Doe'
      };

      extractUserContext(req as Request, res as Response, next);

      expect((req as any).user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'STUDENT',
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should throw error for missing user ID', () => {
      req.headers = {
        'x-user-email': 'test@example.com',
        'x-user-role': 'STUDENT'
      };

      extractUserContext(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw error for missing email', () => {
      req.headers = {
        'x-user-id': 'user-123',
        'x-user-role': 'STUDENT'
      };

      extractUserContext(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw error for missing role', () => {
      req.headers = {
        'x-user-id': 'user-123',
        'x-user-email': 'test@example.com'
      };

      extractUserContext(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw error for invalid role', () => {
      req.headers = {
        'x-user-id': 'user-123',
        'x-user-email': 'test@example.com',
        'x-user-role': 'INVALID_ROLE'
      };

      extractUserContext(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should handle optional name fields', () => {
      req.headers = {
        'x-user-id': 'user-123',
        'x-user-email': 'test@example.com',
        'x-user-role': 'TEACHER'
      };

      extractUserContext(req as Request, res as Response, next);

      expect((req as any).user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'TEACHER',
        firstName: undefined,
        lastName: undefined
      });
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('requireStudent', () => {
    it('should allow access for student', () => {
      (req as any).user = {
        id: 'user-123',
        email: 'student@test.com',
        role: 'STUDENT'
      };

      requireStudent(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access for teacher', () => {
      (req as any).user = {
        id: 'user-123',
        email: 'teacher@test.com',
        role: 'TEACHER'
      };

      expect(() => {
        requireStudent(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });

    it('should deny access for admin', () => {
      (req as any).user = {
        id: 'user-123',
        email: 'admin@test.com',
        role: 'ADMIN'
      };

      expect(() => {
        requireStudent(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });

    it('should throw error when user context is missing', () => {
      expect(() => {
        requireStudent(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });
  });

  describe('requireTeacherOrAdmin', () => {
    it('should allow access for teacher', () => {
      (req as any).user = {
        id: 'user-123',
        email: 'teacher@test.com',
        role: 'TEACHER'
      };

      requireTeacherOrAdmin(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should allow access for admin', () => {
      (req as any).user = {
        id: 'user-123',
        email: 'admin@test.com',
        role: 'ADMIN'
      };

      requireTeacherOrAdmin(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access for student', () => {
      (req as any).user = {
        id: 'user-123',
        email: 'student@test.com',
        role: 'STUDENT'
      };

      expect(() => {
        requireTeacherOrAdmin(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });

    it('should throw error when user context is missing', () => {
      expect(() => {
        requireTeacherOrAdmin(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin', () => {
      (req as any).user = {
        id: 'user-123',
        email: 'admin@test.com',
        role: 'ADMIN'
      };

      requireAdmin(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access for teacher', () => {
      (req as any).user = {
        id: 'user-123',
        email: 'teacher@test.com',
        role: 'TEACHER'
      };

      expect(() => {
        requireAdmin(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });

    it('should deny access for student', () => {
      (req as any).user = {
        id: 'user-123',
        email: 'student@test.com',
        role: 'STUDENT'
      };

      expect(() => {
        requireAdmin(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });

    it('should throw error when user context is missing', () => {
      expect(() => {
        requireAdmin(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });
  });
});