// Global test setup for Assessment Service
import { UserContext } from '../src/types';

// Mock Prisma client to avoid database dependency during tests
jest.mock('../src/prismaClient', () => ({
  prisma: {
    assessment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    questionSet: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    question: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  default: {
    assessment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    questionSet: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    question: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  }
}));

// Global test utilities
const testUtils = {
  // Database utilities
  cleanDatabase: async () => {
    // Mock implementation for tests
    return Promise.resolve();
  },

  createTestUser: async (overrides = {}) => {
    // Mock implementation for tests
    return Promise.resolve({
      id: 'user-123',
      email: 'user@example.com',
      role: 'STUDENT',
      firstName: 'Test',
      lastName: 'User',
      ...overrides,
    });
  },

  // Create mock user contexts
  createMockTeacher: (): UserContext => ({
    id: 'teacher-123',
    email: 'teacher@example.com',
    role: 'TEACHER',
    firstName: 'John',
    lastName: 'Teacher',
  }),

  createMockAdmin: (): UserContext => ({
    id: 'admin-123',
    email: 'admin@example.com',
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
  }),

  createMockStudent: (): UserContext => ({
    id: 'student-123',
    email: 'student@example.com',
    role: 'STUDENT',
    firstName: 'Jane',
    lastName: 'Student',
  }),

  // Create mock assessment data
  createMockAssessment: (overrides = {}) => ({
    id: 'assessment-123',
    title: 'Test Assessment',
    description: 'Test Description',
    instructions: 'Test Instructions',
    createdBy: 'teacher-123',
    status: 'DRAFT',
    settings: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isActive: true,
    questionSets: [],
    ...overrides,
  }),

  // Create mock assessment request
  createMockAssessmentRequest: (overrides = {}) => ({
    title: 'New Assessment',
    description: 'Assessment description',
    instructions: 'Assessment instructions',
    settings: {
      duration: 60,
      maxAttempts: 3,
      showResults: true,
    },
    ...overrides,
  }),

  // Create mock question set
  createMockQuestionSet: (overrides = {}) => ({
    id: 'questionset-123',
    assessmentId: 'assessment-123',
    setNumber: 1,
    name: 'Question Set 1',
    description: 'Test question set',
    instructions: 'Set instructions',
    timeLimit: 30,
    selectionConfig: {},
    displayOrder: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    questions: [],
    ...overrides,
  }),

  // Create mock question
  createMockQuestion: (overrides = {}) => ({
    id: 'question-123',
    questionSetId: 'questionset-123',
    type: 'MULTIPLE_CHOICE',
    title: 'Test Question',
    content: 'What is 2 + 2?',
    points: 1.0,
    negativeMarking: null,
    difficulty: 'MEDIUM',
    tags: ['math', 'basic'],
    hints: ['Think about basic arithmetic'],
    explanation: '2 + 2 equals 4',
    timeLimit: null,
    metadata: {},
    displayOrder: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    mediaItems: [],
    options: [],
    ...overrides,
  }),

  // Create mock paginated response
  createMockPaginatedResponse: (items: any[], page = 1, limit = 10) => ({
    items,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  }),

  // Create mock API response
  createMockApiResponse: (data: any, success = true, message = '') => ({
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
  }),
};

// Set global testUtils
(global as any).testUtils = testUtils;

// Environment setup for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.PORT = '4001';
process.env.VERIFY_GATEWAY_SIGNATURE = 'false';

// Global setup
beforeAll(async () => {
  // Any global setup
});

afterAll(async () => {
  // Any global cleanup
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});