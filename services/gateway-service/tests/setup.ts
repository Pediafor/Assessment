// Test setup file
import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PASETO_PUBLIC_KEY = 'test-public-key';
process.env.GATEWAY_SECRET = 'test-gateway-secret';

// Global test configuration
jest.setTimeout(10000);