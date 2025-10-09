module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 10000,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testMatch: ['**/tests/**(rabbitmq|integration)**.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
  ],
};