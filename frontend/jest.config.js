/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: './tsconfig.jest.json', useESM: false }
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  testRegex: '(/tests/.*\\.(test|spec))\\.(ts|tsx)$',
};
