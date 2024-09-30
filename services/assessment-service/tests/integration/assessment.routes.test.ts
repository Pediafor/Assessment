import { createMockPrisma } from '../helpers/mockPrisma';

// Mock Prisma - need to define this before imports that use prisma
const mockPrisma = createMockPrisma();
jest.mock('../../src/prismaClient', () => ({
  prisma: mockPrisma
}));

import request from 'supertest';
import { Express } from 'express';
import app from '../../src/server';

import { prisma } from '../../src/prismaClient';

// Cast the mock to the correct type for use in tests
const mockPrismaInstance = mockPrisma;

describe('Assessment Routes Integration Tests', () => {
  let testApp: Express;
  const teacherHeaders = {
    'x-user-id': 'teacher-123',
    'x-user-email': 'teacher@example.com',
    'x-user-role': 'TEACHER',
    'x-user-firstname': 'John',
    'x-user-lastname': 'Teacher',
  };

  const adminHeaders = {
    'x-user-id': 'admin-123',
    'x-user-email': 'admin@example.com',
    'x-user-role': 'ADMIN',
    'x-user-firstname': 'Admin',
    'x-user-lastname': 'User',
  };

  const studentHeaders = {
    'x-user-id': 'student-123',
    'x-user-email': 'student@example.com',
    'x-user-role': 'STUDENT',
    'x-user-firstname': 'Jane',
    'x-user-lastname': 'Student',
  };

  beforeAll(async () => {
    testApp = app;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up any resources if needed
  });

  describe('POST /assessments', () => {
    const validAssessmentPayload = {
      title: 'Test Assessment',
      description: 'Test Description',
      instructions: 'Test Instructions',
      settings: {
        duration: 60,
        maxAttempts: 3,
        showResults: true,
      },
    };

    it('should create assessment successfully with teacher credentials', async () => {
      const mockCreatedAssessment = (global as any).testUtils.createMockAssessment({
        ...validAssessmentPayload,
        createdBy: teacherHeaders['x-user-id'],
      });

      mockPrisma.assessment.create.mockResolvedValue(mockCreatedAssessment);

      const response = await request(testApp)
        .post('/assessments')
        .set(teacherHeaders)
        .send(validAssessmentPayload)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockCreatedAssessment,
        message: 'Assessment created successfully',
        timestamp: expect.any(String),
      });
    });

    it('should create assessment successfully with admin credentials', async () => {
      const mockCreatedAssessment = (global as any).testUtils.createMockAssessment({
        ...validAssessmentPayload,
        createdBy: adminHeaders['x-user-id'],
      });

      mockPrisma.assessment.create.mockResolvedValue(mockCreatedAssessment);

      const response = await request(testApp)
        .post('/assessments')
        .set(adminHeaders)
        .send(validAssessmentPayload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedAssessment);
    });

    it('should return 401 for student credentials', async () => {
      const response = await request(testApp)
        .post('/assessments')
        .set(studentHeaders)
        .send(validAssessmentPayload)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing title', async () => {
      const invalidPayload = { ...validAssessmentPayload, title: '' };

      const response = await request(testApp)
        .post('/assessments')
        .set(teacherHeaders)
        .send(invalidPayload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title must be between 3 and 200 characters');
    });

    it('should create assessment successfully without description', async () => {
      const { description, ...validPayloadWithoutDescription } = validAssessmentPayload;

      const response = await request(testApp)
        .post('/assessments')
        .set(teacherHeaders)
        .send(validPayloadWithoutDescription)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 401 when user context headers are missing', async () => {
      const response = await request(testApp)
        .post('/assessments')
        .send(validAssessmentPayload)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User ID not found');
    });

    it('should handle validation errors for invalid settings', async () => {
      const invalidPayload = {
        ...validAssessmentPayload,
        settings: {
          duration: -1, // Invalid duration
          maxAttempts: 0, // Invalid attempts
        },
      };

      const response = await request(testApp)
        .post('/assessments')
        .set(teacherHeaders)
        .send(invalidPayload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });
  });

  describe('GET /assessments', () => {
    it('should return paginated assessments', async () => {
      const mockAssessments = [
        (global as any).testUtils.createMockAssessment({ id: 'assessment-1' }),
        (global as any).testUtils.createMockAssessment({ id: 'assessment-2' }),
      ];

      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);
      mockPrisma.assessment.count.mockResolvedValue(2);

      const response = await request(testApp)
        .get('/assessments')
        .set(teacherHeaders)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          items: mockAssessments,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle pagination parameters', async () => {
      const mockAssessments = [(global as any).testUtils.createMockAssessment()];
      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);
      mockPrisma.assessment.count.mockResolvedValue(15);

      const response = await request(testApp)
        .get('/assessments?page=2&limit=5')
        .set(teacherHeaders)
        .expect(200);

      expect(response.body.data.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });

    it('should handle search parameter', async () => {
      const mockAssessments = [(global as any).testUtils.createMockAssessment()];
      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);
      mockPrisma.assessment.count.mockResolvedValue(1);

      const response = await request(testApp)
        .get('/assessments?search=Math')
        .set(teacherHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toEqual(mockAssessments);
    });

    it('should handle createdBy filter', async () => {
      const mockAssessments = [(global as any).testUtils.createMockAssessment()];
      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);
      mockPrisma.assessment.count.mockResolvedValue(1);

      const response = await request(testApp)
        .get(`/assessments?createdBy=${teacherHeaders['x-user-id']}`)
        .set(teacherHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle status filter', async () => {
      const mockAssessments = [(global as any).testUtils.createMockAssessment()];
      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);
      mockPrisma.assessment.count.mockResolvedValue(1);

      const response = await request(testApp)
        .get('/assessments?status=PUBLISHED')
        .set(teacherHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 when user context headers are missing', async () => {
      const response = await request(testApp)
        .get('/assessments')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /assessments/:id', () => {
    const assessmentId = 'assessment-123';

    it('should return assessment by ID', async () => {
      const mockAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(mockAssessment);

      const response = await request(testApp)
        .get(`/assessments/${assessmentId}`)
        .set(teacherHeaders)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockAssessment,
        timestamp: expect.any(String),
      });
    });

    it('should return 404 when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      const response = await request(testApp)
        .get(`/assessments/${assessmentId}`)
        .set(teacherHeaders)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Assessment not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(testApp)
        .get('/assessments/invalid-id')
        .set(teacherHeaders)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid assessment ID');
    });

    it('should return 401 when user context headers are missing', async () => {
      const response = await request(testApp)
        .get(`/assessments/${assessmentId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /assessments/:id', () => {
    const assessmentId = 'assessment-123';
    const updatePayload = {
      title: 'Updated Assessment',
      description: 'Updated Description',
    };

    it('should update assessment successfully when user is owner', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: teacherHeaders['x-user-id'],
      });

      const updatedAssessment = {
        ...existingAssessment,
        ...updatePayload,
      };

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.update.mockResolvedValue(updatedAssessment);

      const response = await request(testApp)
        .put(`/assessments/${assessmentId}`)
        .set(teacherHeaders)
        .send(updatePayload)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: updatedAssessment,
        message: 'Assessment updated successfully',
        timestamp: expect.any(String),
      });
    });

    it('should allow admin to update any assessment', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: 'other-teacher-id',
      });

      const updatedAssessment = {
        ...existingAssessment,
        ...updatePayload,
      };

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.update.mockResolvedValue(updatedAssessment);

      const response = await request(testApp)
        .put(`/assessments/${assessmentId}`)
        .set(adminHeaders)
        .send(updatePayload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 when teacher tries to update another teacher assessment', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: 'other-teacher-id',
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);

      const response = await request(testApp)
        .put(`/assessments/${assessmentId}`)
        .set(teacherHeaders)
        .send(updatePayload)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('You can only update your own assessments');
    });

    it('should return 401 for student', async () => {
      const response = await request(testApp)
        .put(`/assessments/${assessmentId}`)
        .set(studentHeaders)
        .send(updatePayload)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      const response = await request(testApp)
        .put(`/assessments/${assessmentId}`)
        .set(teacherHeaders)
        .send(updatePayload)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Assessment not found');
    });

    it('should return 400 for invalid update data', async () => {
      const invalidPayload = { title: '' }; // Empty title

      const response = await request(testApp)
        .put(`/assessments/${assessmentId}`)
        .set(teacherHeaders)
        .send(invalidPayload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });
  });

  describe('DELETE /assessments/:id', () => {
    const assessmentId = 'assessment-123';

    it('should delete assessment successfully when user is owner', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: teacherHeaders['x-user-id'],
      });

      const deletedAssessment = {
        ...existingAssessment,
        isActive: false,
      };

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.update.mockResolvedValue(deletedAssessment);

      const response = await request(testApp)
        .delete(`/assessments/${assessmentId}`)
        .set(teacherHeaders)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Assessment deleted successfully',
        timestamp: expect.any(String),
      });
    });

    it('should allow admin to delete any assessment', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: 'other-teacher-id',
      });

      const deletedAssessment = {
        ...existingAssessment,
        isActive: false,
      };

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.update.mockResolvedValue(deletedAssessment);

      const response = await request(testApp)
        .delete(`/assessments/${assessmentId}`)
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 when teacher tries to delete another teacher assessment', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: 'other-teacher-id',
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);

      const response = await request(testApp)
        .delete(`/assessments/${assessmentId}`)
        .set(teacherHeaders)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('You can only update your own assessments');
    });

    it('should return 401 for student', async () => {
      const response = await request(testApp)
        .delete(`/assessments/${assessmentId}`)
        .set(studentHeaders)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      const response = await request(testApp)
        .delete(`/assessments/${assessmentId}`)
        .set(teacherHeaders)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Assessment not found');
    });
  });

  describe('POST /assessments/:id/publish', () => {
    const assessmentId = 'assessment-123';

    it('should publish assessment successfully when user is owner', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: teacherHeaders['x-user-id'],
        status: 'DRAFT',
      });

      const publishedAssessment = {
        ...existingAssessment,
        status: 'PUBLISHED',
      };

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.update.mockResolvedValue(publishedAssessment);

      const response = await request(testApp)
        .post(`/assessments/${assessmentId}/publish`)
        .set(teacherHeaders)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: publishedAssessment,
        message: 'Assessment published successfully',
        timestamp: expect.any(String),
      });
    });

    it('should return 400 when assessment is already published', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: teacherHeaders['x-user-id'],
        status: 'PUBLISHED',
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);

      const response = await request(testApp)
        .post(`/assessments/${assessmentId}/publish`)
        .set(teacherHeaders)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already published');
    });

    it('should return 401 for student', async () => {
      const response = await request(testApp)
        .post(`/assessments/${assessmentId}/publish`)
        .set(studentHeaders)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /assessments/:id/duplicate', () => {
    const assessmentId = 'assessment-123';

    it('should duplicate assessment successfully', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        title: 'Original Assessment',
        createdBy: 'original-creator',
      });

      const duplicatedAssessment = (global as any).testUtils.createMockAssessment({
        id: 'new-assessment-id',
        title: 'Copy of Original Assessment',
        createdBy: teacherHeaders['x-user-id'],
        status: 'DRAFT',
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.create.mockResolvedValue(duplicatedAssessment);

      const response = await request(testApp)
        .post(`/assessments/${assessmentId}/duplicate`)
        .set(teacherHeaders)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: duplicatedAssessment,
        message: 'Assessment duplicated successfully',
        timestamp: expect.any(String),
      });
    });

    it('should return 401 for student', async () => {
      const response = await request(testApp)
        .post(`/assessments/${assessmentId}/duplicate`)
        .set(studentHeaders)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      const response = await request(testApp)
        .post(`/assessments/${assessmentId}/duplicate`)
        .set(teacherHeaders)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Assessment not found');
    });
  });
});

