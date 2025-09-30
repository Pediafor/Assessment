import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import userRoutes from '../../src/routes/user.routes';

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.PASETO_PRIVATE_KEY = 'MC4CAQAwBQYDK2VwBCIEIDEp8VZfRw1P2vDEzO2Y1a+LLQ1NKYF6OiC+vLXY8RZN';
process.env.PASETO_PUBLIC_KEY = 'MCowBQYDK2VwAyEAMSnxVl9HDU/a8MTM7ZjVr4stDU0pgXo6IL68tdjxFk0=';

export function createTestApp(): Express {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Routes
  app.use('/', userRoutes);
  
  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'UserService OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  
  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Test app error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  });
  
  return app;
}

export async function setupTestDatabase(): Promise<PrismaClient> {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
      }
    }
  });
  
  // Connect to database
  await prisma.$connect();
  
  return prisma;
}

export async function cleanupTestDatabase(prisma: PrismaClient): Promise<void> {
  // Clean up test data
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
}

export const testData = {
  validUser: {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  },
  
  adminUser: {
    email: 'admin@example.com',
    password: 'adminpass123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  },
  
  teacherUser: {
    email: 'teacher@example.com',
    password: 'teacherpass123',
    firstName: 'Teacher',
    lastName: 'User',
    role: 'TEACHER'
  },
  
  invalidUser: {
    email: 'invalid-email',
    password: '123', // Too short
    firstName: '',
    lastName: ''
  }
};