import prisma from '../src/prismaClient';

declare global {
  var testPrisma: typeof prisma;
}

beforeAll(async () => {
  // Clean up database before all tests  
  await prisma.grade.deleteMany({});
  await prisma.submissionFile.deleteMany({});
  await prisma.submission.deleteMany({});
});

afterAll(async () => {
  // Clean up database after all tests
  await prisma.grade.deleteMany({});
  await prisma.submissionFile.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up before each test
  await prisma.grade.deleteMany({});
  await prisma.submissionFile.deleteMany({});
  await prisma.submission.deleteMany({});
});

// Make prisma available globally for tests
global.testPrisma = prisma;