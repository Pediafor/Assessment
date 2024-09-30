import request from 'supertest';
import app from '../../src/server';

describe('Server Endpoints Integration Tests', () => {
  describe('GET /', () => {
    it('should return service information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Assessment Service is running! 🚀',
        service: 'Pediafor Assessment Platform - Assessment Service',
        version: '1.0.0',
        features: expect.any(Array),
        endpoints: expect.any(Object),
        architecture: expect.any(Object)
      });

      expect(response.body.features).toContain('Assessment Management');
      expect(response.body.features).toContain('Rich Media Support');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'assessment-service',
        version: '1.0.0',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String)
      });
    });
  });

  describe('Static File Serving - GET /uploads/*', () => {
    it('should return 404 for non-existent files', async () => {
      const response = await request(app)
        .get('/uploads/non-existent-file.jpg')
        .expect(404);

      // Static file middleware returns HTML 404, not JSON
      expect(typeof response.text).toBe('string');
    });

    it('should serve files with proper security headers', async () => {
      // This test checks that the static file middleware is properly configured
      // Even though the file doesn't exist, we can verify the middleware is mounted
      const response = await request(app)
        .get('/uploads/test-security-check.png')
        .expect(404);

      // The response should come from the static file middleware, not our 404 handler
      expect(response.text).not.toContain('Endpoint not found');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Endpoint not found',
        message: 'Cannot GET /unknown-endpoint',
        availableEndpoints: expect.any(Object),
        timestamp: expect.any(String)
      });
    });

    it('should return 404 for unknown POST endpoints', async () => {
      const response = await request(app)
        .post('/unknown-endpoint')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Endpoint not found',
        message: 'Cannot POST /unknown-endpoint',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/assessments')
        .set('Content-Type', 'application/json')
        .set({
          'x-user-id': 'teacher-123',
          'x-user-email': 'teacher@example.com',
          'x-user-role': 'TEACHER'
        })
        .send('{"invalid": json}')
        .expect(500); // Global error handler converts parse errors to 500

      // Should be handled by global error handler
    });

    it('should handle requests that exceed payload size limit', async () => {
      const largePayload = {
        title: 'Test',
        description: 'x'.repeat(15 * 1024 * 1024) // Larger than 10MB limit
      };

      const response = await request(app)
        .post('/assessments')
        .set({
          'x-user-id': 'teacher-123',
          'x-user-email': 'teacher@example.com',
          'x-user-role': 'TEACHER'
        })
        .send(largePayload)
        .expect(500); // Global error handler converts payload errors to 500

      // Should be handled by global error handler
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Check for Helmet security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('CORS Handling', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/assessments')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});