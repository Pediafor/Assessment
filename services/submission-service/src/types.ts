import { Request } from 'express';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// Error types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

// User context (from gateway headers)
export interface UserContext {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
}

// Extended Request type with user context
export interface AuthenticatedRequest extends Request {
  user: UserContext;
}

// Submission types
export interface CreateSubmissionRequest {
  assessmentId: string;
  autoSave?: boolean;
}

export interface UpdateSubmissionRequest {
  status?: 'DRAFT' | 'SUBMITTED' | 'GRADING' | 'GRADED' | 'PUBLISHED' | 'ARCHIVED';
  answers?: any;
  score?: number;
  maxScore?: number;
  submittedAt?: Date;
}

export interface SaveAnswersRequest {
  answers: any;
}

// Query parameters
export interface SubmissionQuery {
  assessmentId?: string;
  studentId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}