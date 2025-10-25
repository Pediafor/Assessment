import prisma from '../src/prismaClient';

declare global {
  var testPrisma: typeof prisma;
}

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  const { setRabbitMQMock, resetRabbitMQConnection } = await import('../src/config/rabbitmq');
  setRabbitMQMock(true);
  resetRabbitMQConnection();
});

afterEach(async () => {
  const { setRabbitMQMock, resetRabbitMQConnection } = await import('../src/config/rabbitmq');
  setRabbitMQMock(true);
  resetRabbitMQConnection();
});

// Don't do automatic cleanup between tests
// Each test should be responsible for its own data management

// Make prisma available globally for tests
global.testPrisma = prisma;