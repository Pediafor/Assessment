import request from 'supertest';
import express from 'express';
import { authenticateGateway } from '../src/middleware/auth.middleware';

describe('Gateway Authentication Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Test route
    app.get('/api/test', authenticateGateway, (req, res) => {
      res.json({ 
        message: 'Authenticated!', 
        user: req.user,
        headers: {
          userId: req.headers['x-user-id'],
          userRole: req.headers['x-user-role'],
          authenticated: req.headers['x-authenticated']
        }
      });
    });
    
    // Public test routes - apply middleware individually to test the logic
    app.post('/api/auth/login', authenticateGateway, (req, res) => {
      res.json({ message: 'Public route' });
    });
    
    app.post('/api/users/register', authenticateGateway, (req, res) => {
      res.json({ message: 'Registration route' });
    });
  });

  describe('Public Routes', () => {
    test('should allow access to /api/auth/login without token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Public route');
    });

    test('should allow access to /api/users/register without token', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Registration route');
    });
  });

  describe('Protected Routes', () => {
    test('should reject requests without Authorization header', async () => {
      const response = await request(app)
        .get('/api/test');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    test('should reject requests with invalid Bearer token format', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    test('should reject requests with malformed PASETO token', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Authorization', 'Bearer invalid-token-format');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication failed');
    });
  });

  describe('Token Validation', () => {
    test('should handle expired tokens', async () => {
      // This would need a properly formatted but expired PASETO token
      // For now, we test the error handling path
      const invalidToken = 'v4.public.invalid';
      
      const response = await request(app)
        .get('/api/test')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Environment Configuration', () => {
    test('should fail gracefully when PASETO_PUBLIC_KEY is not set', () => {
      const originalKey = process.env.PASETO_PUBLIC_KEY;
      delete process.env.PASETO_PUBLIC_KEY;

      // Test that middleware handles missing key gracefully
      expect(() => {
        require('../src/middleware/auth.middleware');
      }).not.toThrow();

      // Restore original key
      if (originalKey) {
        process.env.PASETO_PUBLIC_KEY = originalKey;
      }
    });
  });
});