import request from 'supertest';
import express from 'express';
import submissionRoutes from '../src/routes/submission.routes';
import { errorHandler } from '../src/middleware/errorHandler';
import prisma from '../src/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/submissions', submissionRoutes);
app.use(errorHandler);

describe('Submission Routes', () => {
  const mockStudentHeaders = {
    'x-user-id': 'student-123',
    'x-user-email': 'student@test.com',
    'x-user-role': 'STUDENT',
    'x-user-first-name': 'John',
    'x-user-last-name': 'Doe'
  };

  const mockTeacherHeaders = {
    'x-user-id': 'teacher-123',
    'x-user-email': 'teacher@test.com',
    'x-user-role': 'TEACHER',
    'x-user-first-name': 'Jane',
    'x-user-last-name': 'Smith'
  };

  const mockAdminHeaders = {
    'x-user-id': 'admin-123',
    'x-user-email': 'admin@test.com',
    'x-user-role': 'ADMIN',
    'x-user-first-name': 'Admin',
    'x-user-last-name': 'User'
  };

  const generateAssessmentId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  describe('POST /api/submissions', () => {
    it('should create a new submission for student', async () => {
      const submissionData = {
        assessmentId: generateAssessmentId('assessment-route-test'),
        autoSave: false
      };

      const response = await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send(submissionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessmentId).toBe(submissionData.assessmentId);
      expect(response.body.data.userId).toBe(mockStudentHeaders['x-user-id']);
      expect(response.body.data.status).toBe('DRAFT');
    });

    it('should return 400 for missing assessment ID', async () => {
      const submissionData = {
        autoSave: false
      };

      const response = await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send(submissionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing user context', async () => {
      const submissionData = {
        assessmentId: 'assessment-test',
        autoSave: false
      };

      await request(app)
        .post('/api/submissions')
        .send(submissionData)
        .expect(401);
    });

    it('should return 401 when non-student tries to create submission', async () => {
      const submissionData = {
        assessmentId: 'assessment-test',
        autoSave: false
      };

      await request(app)
        .post('/api/submissions')
        .set(mockTeacherHeaders)
        .send(submissionData)
        .expect(401);
    });
  });

  describe('GET /api/submissions/:id', () => {
    let testSubmissionId: string;

    beforeEach(async () => {
      // Create a test submission
      const assessmentId = generateAssessmentId('assessment-get-route-test');
      const response = await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send({
          assessmentId,
          autoSave: false
        })
        .expect(201);

      testSubmissionId = response.body.data.id;
    });

    it('should get submission by ID for owner', async () => {
      const response = await request(app)
        .get(`/api/submissions/${testSubmissionId}`)
        .set(mockStudentHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testSubmissionId);
      expect(response.body.data.userId).toBe(mockStudentHeaders['x-user-id']);
    });

    it('should get submission by ID for teacher', async () => {
      const response = await request(app)
        .get(`/api/submissions/${testSubmissionId}`)
        .set(mockTeacherHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testSubmissionId);
    });

    it('should return 404 for non-existent submission', async () => {
      await request(app)
        .get('/api/submissions/non-existent-id')
        .set(mockStudentHeaders)
        .expect(404);
    });

    it('should return 401 for unauthorized access', async () => {
      const anotherStudentHeaders = {
        'x-user-id': 'student-456',
        'x-user-email': 'another@test.com',
        'x-user-role': 'STUDENT',
        'x-user-first-name': 'Another',
        'x-user-last-name': 'Student'
      };

      await request(app)
        .get(`/api/submissions/${testSubmissionId}`)
        .set(anotherStudentHeaders)
        .expect(401);
    });
  });

  describe('GET /api/submissions', () => {
    let listAssessmentId1: string;
    let listAssessmentId2: string;

    beforeEach(async () => {
      // Create multiple test submissions
      listAssessmentId1 = generateAssessmentId('assessment-list-route-1');
      listAssessmentId2 = generateAssessmentId('assessment-list-route-2');

      await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send({
          assessmentId: listAssessmentId1,
          autoSave: false
        })
        .expect(201);

      await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send({
          assessmentId: listAssessmentId2,
          autoSave: false
        })
        .expect(201);
    });

    it('should get submissions for student', async () => {
      const response = await request(app)
        .get('/api/submissions')
        .set(mockStudentHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThanOrEqual(2);
    });

    it('should get submissions for teacher', async () => {
      const response = await request(app)
        .get('/api/submissions')
        .set(mockTeacherHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/submissions?page=1&limit=1')
        .set(mockTeacherHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(1);
    });

    it('should filter by assessment ID', async () => {
      const response = await request(app)
        .get(`/api/submissions?assessmentId=${listAssessmentId1}`)
        .set(mockTeacherHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((submission: any) => {
        expect(submission.assessmentId).toBe(listAssessmentId1);
      });
    });

    it('should return 400 for invalid page parameter', async () => {
      await request(app)
        .get('/api/submissions?page=0')
        .set(mockStudentHeaders)
        .expect(400);
    });

    it('should return 400 for invalid limit parameter', async () => {
      await request(app)
        .get('/api/submissions?limit=101')
        .set(mockStudentHeaders)
        .expect(400);
    });
  });

  describe('POST /api/submissions/:id/answers', () => {
    let testSubmissionId: string;

    beforeEach(async () => {
      const assessmentId = generateAssessmentId('assessment-answers-test');
      const response = await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send({
          assessmentId,
          autoSave: false
        })
        .expect(201);

      testSubmissionId = response.body.data.id;
    });

    it('should save answers to submission', async () => {
      const answers = {
        question1: 'Answer 1',
        question2: 'Answer 2'
      };

      const response = await request(app)
        .post(`/api/submissions/${testSubmissionId}/answers`)
        .set(mockStudentHeaders)
        .send({ answers })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.answers).toEqual(answers);
      expect(response.body.message).toBe('Answers saved successfully');
    });

    it('should return 400 for missing answers', async () => {
      await request(app)
        .post(`/api/submissions/${testSubmissionId}/answers`)
        .set(mockStudentHeaders)
        .send({})
        .expect(400);
    });

    it('should return 401 when non-student tries to save answers', async () => {
      const answers = { question1: 'Answer 1' };

      await request(app)
        .post(`/api/submissions/${testSubmissionId}/answers`)
        .set(mockTeacherHeaders)
        .send({ answers })
        .expect(401);
    });
  });

  describe('POST /api/submissions/:id/submit', () => {
    let testSubmissionId: string;

    beforeEach(async () => {
      const assessmentId = generateAssessmentId('assessment-submit-test');
      const response = await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send({
          assessmentId,
          autoSave: false
        })
        .expect(201);

      testSubmissionId = response.body.data.id;
    });

    it('should submit a draft submission', async () => {
      const response = await request(app)
        .post(`/api/submissions/${testSubmissionId}/submit`)
        .set(mockStudentHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SUBMITTED');
      expect(response.body.data.submittedAt).toBeDefined();
      expect(response.body.message).toBe('Submission submitted successfully');
    });

    it('should return 400 when trying to submit already submitted submission', async () => {
      // Submit once
      await request(app)
        .post(`/api/submissions/${testSubmissionId}/submit`)
        .set(mockStudentHeaders)
        .expect(200);

      // Try to submit again
      await request(app)
        .post(`/api/submissions/${testSubmissionId}/submit`)
        .set(mockStudentHeaders)
        .expect(400);
    });

    it('should return 401 when non-student tries to submit', async () => {
      await request(app)
        .post(`/api/submissions/${testSubmissionId}/submit`)
        .set(mockTeacherHeaders)
        .expect(401);
    });
  });

  describe('PUT /api/submissions/:id', () => {
    let testSubmissionId: string;

    beforeEach(async () => {
      const assessmentId = generateAssessmentId('assessment-update-test');
      const response = await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send({
          assessmentId,
          autoSave: false
        })
        .expect(201);

      testSubmissionId = response.body.data.id;
    });

    it('should allow teacher to update submission status', async () => {
      const updateData = {
        status: 'GRADING'
      };

      const response = await request(app)
        .put(`/api/submissions/${testSubmissionId}`)
        .set(mockTeacherHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('GRADING');
      expect(response.body.message).toBe('Submission updated successfully');
    });

    it('should allow teacher to add score', async () => {
      const updateData = {
        score: 85,
        maxScore: 100
      };

      const response = await request(app)
        .put(`/api/submissions/${testSubmissionId}`)
        .set(mockTeacherHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(85);
      expect(response.body.data.maxScore).toBe(100);
    });

    it('should return 400 for invalid status', async () => {
      const updateData = {
        status: 'INVALID_STATUS'
      };

      await request(app)
        .put(`/api/submissions/${testSubmissionId}`)
        .set(mockTeacherHeaders)
        .send(updateData)
        .expect(400);
    });

    it('should return 400 for negative score', async () => {
      const updateData = {
        score: -10
      };

      await request(app)
        .put(`/api/submissions/${testSubmissionId}`)
        .set(mockTeacherHeaders)
        .send(updateData)
        .expect(400);
    });
  });

  describe('GET /api/submissions/stats/:assessmentId', () => {
    let statsAssessmentId: string;

    beforeEach(async () => {
      // Create submissions for stats testing
      statsAssessmentId = generateAssessmentId('assessment-stats-route-test');
      const response1 = await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send({
          assessmentId: statsAssessmentId,
          autoSave: false
        })
        .expect(201);

      const anotherStudentHeaders = {
        'x-user-id': 'student-stats-2',
        'x-user-email': 'stats2@test.com',
        'x-user-role': 'STUDENT',
        'x-user-first-name': 'Stats',
        'x-user-last-name': 'Student2'
      };

      await request(app)
        .post('/api/submissions')
        .set(anotherStudentHeaders)
        .send({
          assessmentId: statsAssessmentId,
          autoSave: false
        })
        .expect(201);

      // Submit one submission
      await request(app)
        .post(`/api/submissions/${response1.body.data.id}/submit`)
        .set(mockStudentHeaders);
    });

    it('should get submission statistics for teacher', async () => {
      const response = await request(app)
        .get(`/api/submissions/stats/${statsAssessmentId}`)
        .set(mockTeacherHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessmentId).toBe(statsAssessmentId);
      expect(response.body.data.totalSubmissions).toBe(2);
      expect(response.body.data.statusBreakdown.DRAFT).toBe(1);
      expect(response.body.data.statusBreakdown.SUBMITTED).toBe(1);
    });

    it('should return 401 when student tries to get stats', async () => {
      await request(app)
        .get(`/api/submissions/stats/${statsAssessmentId}`)
        .set(mockStudentHeaders)
        .expect(401);
    });
  });

  describe('DELETE /api/submissions/:id', () => {
    let testSubmissionId: string;

    beforeEach(async () => {
      const assessmentId = generateAssessmentId('assessment-delete-route-test');
      const response = await request(app)
        .post('/api/submissions')
        .set(mockStudentHeaders)
        .send({
          assessmentId,
          autoSave: false
        })
        .expect(201);

      testSubmissionId = response.body.data.id;
    });

    it('should allow admin to delete submission', async () => {
      const response = await request(app)
        .delete(`/api/submissions/${testSubmissionId}`)
        .set(mockAdminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify submission is deleted
      await request(app)
        .get(`/api/submissions/${testSubmissionId}`)
        .set(mockStudentHeaders)
        .expect(404);
    });

    it('should return 401 when non-admin tries to delete submission', async () => {
      await request(app)
        .delete(`/api/submissions/${testSubmissionId}`)
        .set(mockStudentHeaders)
        .expect(401);
    });

    it('should return 404 when trying to delete non-existent submission', async () => {
      await request(app)
        .delete('/api/submissions/non-existent-id')
        .set(mockAdminHeaders)
        .expect(404);
    });
  });
});