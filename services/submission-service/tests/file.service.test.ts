import { FileService } from '../src/services/file.service';
import prisma from '../src/prismaClient';
import fs from 'fs';
import path from 'path';

const fileService = new FileService();

// Mock user contexts
const mockStudent = {
  id: 'student-123',
  email: 'student@test.com',
  role: 'STUDENT' as const,
  firstName: 'John',
  lastName: 'Doe'
};

const mockTeacher = {
  id: 'teacher-456',
  email: 'teacher@test.com',
  role: 'TEACHER' as const,
  firstName: 'Jane',
  lastName: 'Smith'
};

const mockAdmin = {
  id: 'admin-789',
  email: 'admin@test.com',
  role: 'ADMIN' as const,
  firstName: 'Admin',
  lastName: 'User'
};

describe('FileService', () => {
  const testFilePath = path.join(__dirname, 'fixtures', 'test-service-file.txt');

  // Helper function to create a test submission and file
  const createTestSubmissionAndFile = async (userId: string = mockStudent.id, user: any = mockStudent) => {
    // Create test submission first with unique assessment ID
    const uniqueAssessmentId = `test-assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const submission = await prisma.submission.create({
      data: {
        assessmentId: uniqueAssessmentId,
        userId: userId,
        answers: {},
        status: 'DRAFT'
      }
    });

    const fileData = {
      submissionId: submission.id,
      originalName: 'test-service-file.txt',
      fileName: 'test-service-file-123.txt',
      filePath: testFilePath,
      mimeType: 'text/plain',
      fileSize: 1024,
      description: 'Test file for service'
    };
    const file = await fileService.createSubmissionFile(fileData, user);
    return { submission, file };
  };

  // Helper function to create just a submission
  const createTestSubmission = async (userId: string = mockStudent.id, status: 'DRAFT' | 'SUBMITTED' = 'DRAFT') => {
    // Use unique assessment ID for each submission
    const uniqueAssessmentId = `test-assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return await prisma.submission.create({
      data: {
        assessmentId: uniqueAssessmentId,
        userId: userId,
        answers: {},
        status: status
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
    fs.writeFileSync(testFilePath, 'This is a test file for file service tests.');
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

  describe('createSubmissionFile', () => {
    it('should create a new file for a submission', async () => {
      const submission = await createTestSubmission();
      
      const fileData = {
        submissionId: submission.id,
        originalName: 'test-service-file.txt',
        fileName: 'test-service-file-123.txt',
        filePath: testFilePath,
        mimeType: 'text/plain',
        fileSize: 1024,
        description: 'Test file for service'
      };

      const result = await fileService.createSubmissionFile(fileData, mockStudent);

      expect(result).toHaveProperty('id');
      expect(result.submissionId).toBe(submission.id);
      expect(result.originalName).toBe('test-service-file.txt');
      expect(result.mimeType).toBe('text/plain');
      expect(result.fileSize).toBe(1024);
    });

    it('should throw error for non-existent submission', async () => {
      const fileData = {
        submissionId: 'non-existent-submission',
        originalName: 'test.txt',
        fileName: 'test-123.txt',
        filePath: testFilePath,
        mimeType: 'text/plain',
        fileSize: 1024
      };

      await expect(
        fileService.createSubmissionFile(fileData, mockStudent)
      ).rejects.toThrow('Submission not found');
    });

    it('should throw error when student tries to add file to another student submission', async () => {
      // Create submission for another student
      const anotherSubmission = await prisma.submission.create({
        data: {
          assessmentId: 'test-assessment-456',
          userId: 'another-student-456',
          answers: {},
          status: 'DRAFT'
        }
      });

      const anotherStudent = {
        id: 'student-456',
        email: 'another@test.com',
        role: 'STUDENT' as const,
        firstName: 'Another',
        lastName: 'Student'
      };

      const fileData = {
        submissionId: anotherSubmission.id,
        originalName: 'test.txt',
        fileName: 'test-123.txt',
        filePath: testFilePath,
        mimeType: 'text/plain',
        fileSize: 1024
      };

      await expect(
        fileService.createSubmissionFile(fileData, anotherStudent)
      ).rejects.toThrow('Access denied');
    });

    it('should allow teacher to add file to any submission', async () => {
      const submission = await createTestSubmission();
      
      const fileData = {
        submissionId: submission.id,
        originalName: 'teacher-file.txt',
        fileName: 'teacher-file-123.txt',
        filePath: testFilePath,
        mimeType: 'text/plain',
        fileSize: 512
      };

      const result = await fileService.createSubmissionFile(fileData, mockTeacher);

      expect(result).toHaveProperty('id');
      expect(result.submissionId).toBe(submission.id);
      expect(result.originalName).toBe('teacher-file.txt');
    });
  });

  describe('getSubmissionFiles', () => {
    it('should get files for submission owner', async () => {
      const { submission } = await createTestSubmissionAndFile();

      const files = await fileService.getSubmissionFiles(submission.id, mockStudent);

      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should allow teacher to get files for any submission', async () => {
      const { submission } = await createTestSubmissionAndFile();

      const files = await fileService.getSubmissionFiles(submission.id, mockTeacher);

      expect(Array.isArray(files)).toBe(true);
    });

    it('should throw error when student tries to access another student files', async () => {
      const { submission } = await createTestSubmissionAndFile();
      
      const anotherStudent = {
        id: 'student-999',
        email: 'another@test.com',
        role: 'STUDENT' as const,
        firstName: 'Another',
        lastName: 'Student'
      };

      await expect(
        fileService.getSubmissionFiles(submission.id, anotherStudent)
      ).rejects.toThrow('Access denied');
    });

    it('should throw error for non-existent submission', async () => {
      await expect(
        fileService.getSubmissionFiles('non-existent-id', mockStudent)
      ).rejects.toThrow('Submission not found');
    });
  });

  describe('getFileById', () => {
    it('should get file by ID for owner', async () => {
      const { file } = await createTestSubmissionAndFile();

      const result = await fileService.getFileById(file.id, mockStudent);

      expect(result).toHaveProperty('id');
      expect(result.id).toBe(file.id);
    });

    it('should allow teacher to get any file', async () => {
      const { file } = await createTestSubmissionAndFile();

      const result = await fileService.getFileById(file.id, mockTeacher);

      expect(result).toHaveProperty('id');
      expect(result.id).toBe(file.id);
    });

    it('should throw error when student tries to access another student file', async () => {
      const { file } = await createTestSubmissionAndFile();
      
      const anotherStudent = {
        id: 'student-999',
        email: 'another@test.com',
        role: 'STUDENT' as const,
        firstName: 'Another',
        lastName: 'Student'
      };

      await expect(
        fileService.getFileById(file.id, anotherStudent)
      ).rejects.toThrow('Access denied');
    });

    it('should throw error for non-existent file', async () => {
      await expect(
        fileService.getFileById('non-existent-id', mockStudent)
      ).rejects.toThrow('File not found');
    });
  });

  describe('getFileStats', () => {
    it('should get file statistics for submission', async () => {
      const { submission } = await createTestSubmissionAndFile();

      const stats = await fileService.getFileStats(submission.id, mockStudent);

      expect(stats).toHaveProperty('totalFiles');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('fileTypes');
      expect(stats.totalFiles).toBeGreaterThan(0);
    });

    it('should calculate file types correctly', async () => {
      const { submission } = await createTestSubmissionAndFile();

      const stats = await fileService.getFileStats(submission.id, mockStudent);

      expect(stats.fileTypes).toBeDefined();
      expect(Object.keys(stats.fileTypes)).toContain('.txt');
      expect(stats.fileTypes['.txt']).toBeGreaterThan(0);
    });
  });

  describe('downloadFile', () => {
    it('should return download info for file owner', async () => {
      const { file } = await createTestSubmissionAndFile();

      const downloadInfo = await fileService.downloadFile(file.id, mockStudent);

      expect(downloadInfo).toHaveProperty('filePath');
      expect(downloadInfo).toHaveProperty('originalName');
      expect(downloadInfo).toHaveProperty('mimeType');
    });

    it('should throw error if physical file not found', async () => {
      const submission = await createTestSubmission();
      
      // Create a file record but without the physical file
      const fileData = {
        submissionId: submission.id,
        originalName: 'missing-file.txt',
        fileName: 'missing-file-123.txt',
        filePath: '/non/existent/path/file.txt',
        mimeType: 'text/plain',
        fileSize: 1024
      };

      const result = await fileService.createSubmissionFile(fileData, mockStudent);

      await expect(
        fileService.downloadFile(result.id, mockStudent)
      ).rejects.toThrow('Physical file not found');
    });
  });

  describe('deleteFile', () => {
    it('should allow admin to delete any file', async () => {
      const { file } = await createTestSubmissionAndFile();

      const result = await fileService.deleteFile(file.id, mockAdmin);

      expect(result.success).toBe(true);
      expect(result.message).toBe('File deleted successfully');
    });

    it('should throw error when student tries to delete another student file', async () => {
      // Create a file for a different student
      const anotherSubmission = await prisma.submission.create({
        data: {
          assessmentId: 'test-assessment-456',
          userId: 'another-student-789',
          answers: {},
          status: 'DRAFT'
        }
      });

      const fileData = {
        submissionId: anotherSubmission.id,
        originalName: 'another-student-file.txt',
        fileName: 'another-student-file-123.txt',
        filePath: testFilePath,
        mimeType: 'text/plain',
        fileSize: 1024
      };

      const result = await fileService.createSubmissionFile(fileData, mockAdmin);
      
      const anotherStudent = {
        id: 'student-999',
        email: 'another@test.com',
        role: 'STUDENT' as const,
        firstName: 'Another',
        lastName: 'Student'
      };

      await expect(
        fileService.deleteFile(result.id, anotherStudent)
      ).rejects.toThrow('Access denied');
    });

    it('should throw error for non-existent file', async () => {
      await expect(
        fileService.deleteFile('non-existent-id', mockAdmin)
      ).rejects.toThrow('File not found');
    });
  });
});