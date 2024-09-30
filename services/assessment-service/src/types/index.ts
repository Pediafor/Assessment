// Base types
export interface Assessment {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  createdBy: string;
  status: string;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface QuestionSet {
  id: string;
  assessmentId: string;
  setNumber: number;
  name: string;
  description: string | null;
  instructions: string | null;
  timeLimit: number | null;
  selectionConfig: any;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Question {
  id: string;
  questionSetId: string;
  type: string;
  title: string | null;
  content: string;
  points: number;
  negativeMarking: number | null;
  difficulty: string;
  tags: string[];
  hints: string[];
  explanation: string | null;
  timeLimit: number | null;
  metadata: any;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface QuestionMedia {
  id: string;
  questionId: string;
  type: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText: string | null;
  caption: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  explanation: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OptionMedia {
  id: string;
  optionId: string;
  type: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText: string | null;
  caption: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types with relations
export interface AssessmentWithSets extends Assessment {
  questionSets: QuestionSetWithQuestions[];
}

export interface QuestionSetWithQuestions extends QuestionSet {
  questions: QuestionWithDetails[];
}

export interface QuestionWithDetails extends Question {
  mediaItems: QuestionMedia[];
  options: QuestionOptionWithMedia[];
}

export interface QuestionOptionWithMedia extends QuestionOption {
  mediaItems: OptionMedia[];
}

// API Request/Response types
export interface CreateAssessmentRequest {
  title: string;
  description?: string;
  instructions?: string;
  settings?: AssessmentSettings;
}

export interface UpdateAssessmentRequest {
  title?: string;
  description?: string;
  instructions?: string;
  settings?: AssessmentSettings;
  status?: string;
}

export interface AssessmentSettings {
  startDate?: Date;
  endDate?: Date;
  duration?: number; // minutes
  maxAttempts?: number;
  showResults?: boolean;
  shuffleQuestions?: boolean;
  allowedTimeZones?: string[];
  lateSubmissionPenalty?: number;
  browserRestrictions?: BrowserRestrictions;
  proctoring?: ProctoringSettings;
  [key: string]: any; // Allow additional properties for JSON compatibility
}

export interface BrowserRestrictions {
  fullScreen?: boolean;
  disableRightClick?: boolean;
  disableCopyPaste?: boolean;
  preventNavigation?: boolean;
  [key: string]: any; // Allow additional properties for JSON compatibility
}

export interface ProctoringSettings {
  requireWebcam?: boolean;
  requireMicrophone?: boolean;
  detectMultipleFaces?: boolean;
  detectTabSwitching?: boolean;
  [key: string]: any; // Allow additional properties for JSON compatibility
}

export interface CreateQuestionSetRequest {
  name: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  selectionConfig?: RandomizationStrategy;
}

export interface RandomizationStrategy {
  selectionType: 'ALL' | 'RANDOM_X' | 'WEIGHTED_RANDOM';
  questionsToSelect?: number;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
    expert: number;
  };
  tagWeights?: Record<string, number>;
}

export interface CreateQuestionRequest {
  type: string;
  title?: string;
  content: string;
  points?: number;
  negativeMarking?: number;
  difficulty?: string;
  tags?: string[];
  hints?: string[];
  explanation?: string;
  timeLimit?: number;
  options?: CreateQuestionOptionRequest[];
}

export interface CreateQuestionOptionRequest {
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
}

// Gateway user context
export interface UserContext {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
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
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(message, 403);
  }
}