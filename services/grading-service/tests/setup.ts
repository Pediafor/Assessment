import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pediafor_grading_test'
      }
    }
  });

  // Clean up any existing test data
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up before each test to ensure isolation
  await cleanupDatabase();
});

async function cleanupDatabase() {
  // Delete in correct order to respect foreign key constraints
  await prisma.questionGrade.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.gradeAnalytics.deleteMany();
  await prisma.gradingConfig.deleteMany();
}

// Helper function to create test data
export const createTestGrade = async (overrides: any = {}) => {
  return await prisma.grade.create({
    data: {
      submissionId: `test-submission-${Date.now()}`,
      assessmentId: `test-assessment-${Date.now()}`,
      userId: `test-user-${Date.now()}`,
      totalScore: 85,
      maxScore: 100,
      percentage: 85,
      gradedAt: new Date(),
      isAutomated: true,
      ...overrides
    }
  });
};

export const createTestQuestionGrade = async (gradeId: string, overrides: any = {}) => {
  return await prisma.questionGrade.create({
    data: {
      gradeId,
      questionId: `test-question-${Date.now()}`,
      pointsEarned: 10,
      maxPoints: 10,
      isCorrect: true,
      studentAnswer: { answer: 'A' },
      correctAnswer: { answer: 'A' },
      ...overrides
    }
  });
};

export const createTestGradingConfig = async (overrides: any = {}) => {
  return await prisma.gradingConfig.create({
    data: {
      assessmentId: `test-assessment-${Date.now()}`,
      gradingMethod: 'AUTOMATED',
      allowPartialCredit: true,
      mcqScoringType: 'STANDARD',
      autoGradeOnSubmit: true,
      releaseGradesImmediately: false,
      showCorrectAnswers: false,
      showFeedback: true,
      createdBy: `test-user-${Date.now()}`,
      ...overrides
    }
  });
};

export { prisma };