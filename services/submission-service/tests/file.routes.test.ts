import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../src/server';
import prisma from '../src/prismaClient';

// Mock user contexts
const mockStudentHeaders = {
  'x-user-id': 'student-123',
  'x-user-email': 'student@test.com',
  'x-user-role': 'STUDENT',
  'x-user-first-name': 'John',
  'x-user-last-name': 'Doe'
};

const mockTeacherHeaders = {
  'x-user-id': 'teacher-456',
  'x-user-email': 'teacher@test.com',
  'x-user-role': 'TEACHER',
  'x-user-first-name': 'Jane',
  'x-user-last-name': 'Smith'
};

const mockAdminHeaders = {
  'x-user-id': 'admin-789',
  'x-user-email': 'admin@test.com',
  'x-user-role': 'ADMIN',
  'x-user-first-name': 'Admin',
  'x-user-last-name': 'User'
};

describe('File Routes', () => {
  const testFilePath = path.join(__dirname, 'fixtures', 'test-routes-file.txt');

  // Helper function to create a test submission
  const createTestSubmission = async (userId = mockStudentHeaders['x-user-id']) => {
    return await prisma.submission.create({
      data: {
        assessmentId: 'test-assessment-456',
        userId,
        answers: {},
        status: 'DRAFT'
      }
    });
  };

  beforeAll(async () => {
    // Create test fixtures directory
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads', 'submissions');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create a test file
    fs.writeFileSync(testFilePath, 'This is a test file content for testing file upload routes.');
  });

  afterAll(async () => {
    // Clean up test files
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    const fixturesDir = path.join(__dirname, 'fixtures');
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    }

    // Clean up uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads', 'submissions');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  describe('POST /api/submissions/:submissionId/files', () => {
    it('should upload a file to submission', async () => {
      const submission = await createTestSubmission();

      const response = await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', testFilePath)
        .field('description', 'Test file upload');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.originalName).toBe('test-routes-file.txt');
      expect(response.body.data.description).toBe('Test file upload');
    });

    it('should return 400 for missing file', async () => {
      const submission = await createTestSubmission();

      const response = await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it.skip('should return 401 for missing user context', async () => {
      const submission = await createTestSubmission();

      const response = await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .attach('file', testFilePath);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent submission', async () => {
      const response = await request(app)
        .post('/api/submissions/non-existent-id/files')
        .set(mockStudentHeaders)
        .attach('file', testFilePath);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/submissions/:submissionId/files', () => {
    it('should get all files for submission', async () => {
      const submission = await createTestSubmission();
      
      // Upload a file first
      await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', testFilePath)
        .field('description', 'Test file for get all');

      const response = await request(app)
        .get(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should allow teacher to get files for any submission', async () => {
      const submission = await createTestSubmission();
      
      // Upload a file first
      await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', testFilePath)
        .field('description', 'Test file for teacher');

      const response = await request(app)
        .get(`/api/submissions/${submission.id}/files`)
        .set(mockTeacherHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/submissions/:submissionId/files/stats', () => {
    it('should get file statistics for submission', async () => {
      const submission = await createTestSubmission();
      
      // Upload a file first
      await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', testFilePath)
        .field('description', 'Test file for stats');

      const response = await request(app)
        .get(`/api/submissions/${submission.id}/files/stats`)
        .set(mockStudentHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalFiles');
      expect(response.body.data).toHaveProperty('totalSize');
      expect(response.body.data).toHaveProperty('fileTypes');
    });
  });

  describe('GET /api/files/:fileId', () => {
    it('should get file details', async () => {
      const submission = await createTestSubmission();
      
      // Upload a file first
      const uploadResponse = await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', testFilePath)
        .field('description', 'Test file for details');

      const fileId = uploadResponse.body.data.id;

      const response = await request(app)
        .get(`/api/files/${fileId}`)
        .set(mockStudentHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(fileId);
    });

    it('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/api/files/non-existent-id')
        .set(mockStudentHeaders);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/files/:fileId/download', () => {
    it('should download file', async () => {
      const submission = await createTestSubmission();
      
      // Upload a file first
      const uploadResponse = await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', testFilePath)
        .field('description', 'Test file for download');

      const fileId = uploadResponse.body.data.id;

      const response = await request(app)
        .get(`/api/files/${fileId}/download`)
        .set(mockStudentHeaders);

      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('DELETE /api/files/:fileId', () => {
    it('should allow admin to delete file', async () => {
      const submission = await createTestSubmission();
      
      // Upload a file first
      const uploadResponse = await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', testFilePath)
        .field('description', 'Test file for admin delete');

      const fileId = uploadResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/files/${fileId}`)
        .set(mockAdminHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('File deleted successfully');
    });

    it('should allow students to delete their own files from draft submissions', async () => {
      const submission = await createTestSubmission();
      
      // Upload a file first
      const uploadResponse = await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', testFilePath)
        .field('description', 'Test file for student delete');

      const fileId = uploadResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/files/${fileId}`)
        .set(mockStudentHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('File deleted successfully');
    });
  });

  describe('File Upload Validations', () => {
    it('should accept valid file types', async () => {
      const submission = await createTestSubmission();

      // Create a text file which should be accepted
      const validFilePath = path.join(__dirname, 'fixtures', 'valid-file.txt');
      fs.writeFileSync(validFilePath, 'Valid file content');

      const response = await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', validFilePath)
        .field('description', 'Valid file type');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Clean up
      if (fs.existsSync(validFilePath)) {
        fs.unlinkSync(validFilePath);
      }
    });

    it('should reject files that are too large', async () => {
      const submission = await createTestSubmission();

      // Create a large file (simulate by creating a file with lots of content)
      const largeFilePath = path.join(__dirname, 'fixtures', 'large-file.txt');
      const largeContent = 'x'.repeat(12 * 1024 * 1024); // 12MB file (larger than 10MB limit)
      fs.writeFileSync(largeFilePath, largeContent);

      const response = await request(app)
        .post(`/api/submissions/${submission.id}/files`)
        .set(mockStudentHeaders)
        .attach('file', largeFilePath)
        .field('description', 'Large file');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      // Clean up
      if (fs.existsSync(largeFilePath)) {
        fs.unlinkSync(largeFilePath);
      }
    });
  });
});