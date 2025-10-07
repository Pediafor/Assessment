import prisma from '../src/prismaClient';

declare global {
  var testPrisma: typeof prisma;
}

beforeAll(async () => {
  // Clean up database before all tests  
  await prisma.attemptLog.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.submissionFile.deleteMany({});
  await prisma.submission.deleteMany({});
});

afterAll(async () => {
  // Clean up database after all tests
  await prisma.attemptLog.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.submissionFile.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.$disconnect();
});

// Don't do automatic cleanup between tests
// Each test should be responsible for its own data management

// Make prisma available globally for tests
global.testPrisma = prisma;