import { PrismaClient } from '@prisma/client';

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.PASETO_PRIVATE_KEY = process.env.PASETO_PRIVATE_KEY || 'MC4CAQAwBQYDK2VwBCIEIDEp8VZfRw1P2vDEzO2Y1a+LLQ1NKYF6OiC+vLXY8RZN';
process.env.PASETO_PUBLIC_KEY = process.env.PASETO_PUBLIC_KEY || 'MCowBQYDK2VwAyEAMSnxVl9HDU/a8MTM7ZjVr4stDU0pgXo6IL68tdjxFk0=';

// Use localhost for tests instead of Docker hostname
process.env.TEST_DATABASE_URL = 'postgresql://userservice:userpass123@localhost:5432/user_service_db';

// Global test setup
let prisma: PrismaClient;

beforeAll(async () => {
  // Setup test database connection
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
      }
    }
  });
});

afterAll(async () => {
  // Cleanup
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Global test utilities
global.testUtils = {
  async cleanDatabase() {
    if (prisma) {
      // Clean test data in correct order due to foreign key constraints
      await prisma.user.deleteMany({});
    }
  },
  
  async createTestUser(overrides = {}) {
    const defaultUser = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$test', // Mock hash
      role: 'STUDENT' as any,
      isActive: true,
      ...overrides
    };
    
    return await prisma.user.create({
      data: defaultUser
    });
  }
};

// Extend global namespace for TypeScript
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        cleanDatabase(): Promise<void>;
        createTestUser(overrides?: any): Promise<any>;
      };
    }
  }
  
  var testUtils: {
    cleanDatabase(): Promise<void>;
    createTestUser(overrides?: any): Promise<any>;
  };
}