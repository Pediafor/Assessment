import { SubmissionService } from '../src/services/submission.service';
import { UserContext } from '../src/types';
import prisma from '../src/prismaClient';

describe('SubmissionService', () => {
  let submissionService: SubmissionService;
  let mockStudent: UserContext;
  let mockTeacher: UserContext;
  let mockAdmin: UserContext;

  beforeAll(() => {
    submissionService = new SubmissionService();
    
    mockStudent = {
      id: 'student-123',
      email: 'student@test.com',
      role: 'STUDENT',
      firstName: 'John',
      lastName: 'Doe'
    };

    mockTeacher = {
      id: 'teacher-123',
      email: 'teacher@test.com',
      role: 'TEACHER',
      firstName: 'Jane',
      lastName: 'Smith'
    };

    mockAdmin = {
      id: 'admin-123',
      email: 'admin@test.com',
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User'
    };
  });

  describe('createSubmission', () => {
    it('should create a new submission for a student', async () => {
      const submissionData = {
        assessmentId: 'assessment-123',
        autoSave: false
      };

      const submission = await submissionService.createSubmission(submissionData, mockStudent);

      expect(submission).toBeDefined();
      expect(submission.assessmentId).toBe(submissionData.assessmentId);
      expect(submission.userId).toBe(mockStudent.id);
      expect(submission.status).toBe('DRAFT');
      expect(submission.answers).toBeNull();
    });

    it('should throw error if assessment ID is missing', async () => {
      const submissionData = {
        assessmentId: '',
        autoSave: false
      };

      await expect(
        submissionService.createSubmission(submissionData, mockStudent)
      ).rejects.toThrow('Assessment ID is required');
    });

    it('should throw error if student already has a submission for the assessment', async () => {
      const submissionData = {
        assessmentId: 'assessment-duplicate',
        autoSave: false
      };

      // Create first submission
      await submissionService.createSubmission(submissionData, mockStudent);

      // Try to create duplicate
      await expect(
        submissionService.createSubmission(submissionData, mockStudent)
      ).rejects.toThrow('Submission already exists for this assessment');
    });
  });

  describe('getSubmissionById', () => {
    let testSubmission: any;

    beforeEach(async () => {
      testSubmission = await submissionService.createSubmission({
        assessmentId: 'assessment-get-test',
        autoSave: false
      }, mockStudent);
    });

    it('should get submission by ID for the owner', async () => {
      const submission = await submissionService.getSubmissionById(
        testSubmission.id,
        mockStudent
      );

      expect(submission).toBeDefined();
      expect(submission.id).toBe(testSubmission.id);
      expect(submission.userId).toBe(mockStudent.id);
    });

    it('should get submission by ID for a teacher', async () => {
      const submission = await submissionService.getSubmissionById(
        testSubmission.id,
        mockTeacher
      );

      expect(submission).toBeDefined();
      expect(submission.id).toBe(testSubmission.id);
    });

    it('should get submission by ID for an admin', async () => {
      const submission = await submissionService.getSubmissionById(
        testSubmission.id,
        mockAdmin
      );

      expect(submission).toBeDefined();
      expect(submission.id).toBe(testSubmission.id);
    });

    it('should throw error when student tries to access another student submission', async () => {
      const anotherStudent: UserContext = {
        id: 'student-456',
        email: 'another@test.com',
        role: 'STUDENT',
        firstName: 'Another',
        lastName: 'Student'
      };

      await expect(
        submissionService.getSubmissionById(testSubmission.id, anotherStudent)
      ).rejects.toThrow('Access denied');
    });

    it('should throw error for non-existent submission', async () => {
      await expect(
        submissionService.getSubmissionById('non-existent-id', mockStudent)
      ).rejects.toThrow('Submission not found');
    });
  });

  describe('getSubmissionByAssessment', () => {
    let testSubmission: any;

    beforeEach(async () => {
      testSubmission = await submissionService.createSubmission({
        assessmentId: 'assessment-by-assessment-test',
        autoSave: false
      }, mockStudent);
    });

    it('should get submission by assessment ID for student', async () => {
      const submission = await submissionService.getSubmissionByAssessment(
        'assessment-by-assessment-test',
        undefined,
        mockStudent
      );

      expect(submission).toBeDefined();
      expect(submission!.assessmentId).toBe('assessment-by-assessment-test');
      expect(submission!.userId).toBe(mockStudent.id);
    });

    it('should get submission by assessment ID and student ID for teacher', async () => {
      const submission = await submissionService.getSubmissionByAssessment(
        'assessment-by-assessment-test',
        mockStudent.id,
        mockTeacher
      );

      expect(submission).toBeDefined();
      expect(submission!.assessmentId).toBe('assessment-by-assessment-test');
      expect(submission!.userId).toBe(mockStudent.id);
    });

    it('should return null if no submission exists', async () => {
      const submission = await submissionService.getSubmissionByAssessment(
        'non-existent-assessment',
        undefined,
        mockStudent
      );

      expect(submission).toBeNull();
    });
  });

  describe('saveAnswers', () => {
    let testSubmission: any;

    beforeEach(async () => {
      testSubmission = await submissionService.createSubmission({
        assessmentId: 'assessment-save-answers',
        autoSave: false
      }, mockStudent);
    });

    it('should save answers to submission', async () => {
      const answers = {
        question1: 'Answer 1',
        question2: 'Answer 2'
      };

      const updatedSubmission = await submissionService.saveAnswers(
        testSubmission.id,
        answers,
        mockStudent
      );

      expect(updatedSubmission.answers).toEqual(answers);
      expect(updatedSubmission.updatedAt).toBeDefined();
    });

    it('should throw error when trying to save answers to submitted submission', async () => {
      // Submit the submission first
      await submissionService.submitSubmission(testSubmission.id, mockStudent);

      const answers = { question1: 'Answer 1' };

      await expect(
        submissionService.saveAnswers(testSubmission.id, answers, mockStudent)
      ).rejects.toThrow('Cannot modify a submitted submission');
    });

    it('should throw error when student tries to save answers to another student submission', async () => {
      const anotherStudent: UserContext = {
        id: 'student-789',
        email: 'other@test.com',
        role: 'STUDENT',
        firstName: 'Other',
        lastName: 'Student'
      };

      const answers = { question1: 'Answer 1' };

      await expect(
        submissionService.saveAnswers(testSubmission.id, answers, anotherStudent)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('submitSubmission', () => {
    let testSubmission: any;

    beforeEach(async () => {
      testSubmission = await submissionService.createSubmission({
        assessmentId: 'assessment-submit-test',
        autoSave: false
      }, mockStudent);
    });

    it('should submit a draft submission', async () => {
      const submittedSubmission = await submissionService.submitSubmission(
        testSubmission.id,
        mockStudent
      );

      expect(submittedSubmission.status).toBe('SUBMITTED');
      expect(submittedSubmission.submittedAt).toBeDefined();
    });

    it('should throw error when trying to submit already submitted submission', async () => {
      // Submit once
      await submissionService.submitSubmission(testSubmission.id, mockStudent);

      // Try to submit again
      await expect(
        submissionService.submitSubmission(testSubmission.id, mockStudent)
      ).rejects.toThrow('Submission has already been submitted');
    });

    it('should throw error when student tries to submit another student submission', async () => {
      const anotherStudent: UserContext = {
        id: 'student-999',
        email: 'yet-another@test.com',
        role: 'STUDENT',
        firstName: 'Yet Another',
        lastName: 'Student'
      };

      await expect(
        submissionService.submitSubmission(testSubmission.id, anotherStudent)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('updateSubmission', () => {
    let testSubmission: any;

    beforeEach(async () => {
      testSubmission = await submissionService.createSubmission({
        assessmentId: 'assessment-update-test',
        autoSave: false
      }, mockStudent);
    });

    it('should allow teacher to update submission status', async () => {
      const updateData = {
        status: 'GRADING' as const
      };

      const updatedSubmission = await submissionService.updateSubmission(
        testSubmission.id,
        updateData,
        mockTeacher
      );

      expect(updatedSubmission.status).toBe('GRADING');
    });

    it('should allow teacher to add score', async () => {
      const updateData = {
        score: 85,
        maxScore: 100
      };

      const updatedSubmission = await submissionService.updateSubmission(
        testSubmission.id,
        updateData,
        mockTeacher
      );

      expect(updatedSubmission.score).toBe(85);
      expect(updatedSubmission.maxScore).toBe(100);
    });

    it('should prevent student from updating submission status', async () => {
      const updateData = {
        status: 'GRADED' as const
      };

      await expect(
        submissionService.updateSubmission(testSubmission.id, updateData, mockStudent)
      ).rejects.toThrow('Students can only update their own draft submissions');
    });
  });

  describe('getSubmissions', () => {
    beforeEach(async () => {
      // Create multiple submissions for testing
      await submissionService.createSubmission({
        assessmentId: 'assessment-list-1',
        autoSave: false
      }, mockStudent);

      await submissionService.createSubmission({
        assessmentId: 'assessment-list-2', 
        autoSave: false
      }, mockStudent);
    });

    it('should get submissions for student (own submissions only)', async () => {
      const result = await submissionService.getSubmissions({
        page: 1,
        limit: 10
      }, mockStudent);

      expect(result.submissions).toBeDefined();
      expect(result.submissions.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.total).toBeGreaterThanOrEqual(2);
      
      // All submissions should belong to the student
      result.submissions.forEach(submission => {
        expect(submission.userId).toBe(mockStudent.id);
      });
    });

    it('should get all submissions for teacher', async () => {
      const result = await submissionService.getSubmissions({
        page: 1,
        limit: 10
      }, mockTeacher);

      expect(result.submissions).toBeDefined();
      expect(result.meta.total).toBeGreaterThanOrEqual(2);
    });

    it('should filter submissions by assessment ID', async () => {
      const result = await submissionService.getSubmissions({
        assessmentId: 'assessment-list-1',
        page: 1,
        limit: 10
      }, mockTeacher);

      expect(result.submissions.length).toBe(1);
      expect(result.submissions[0].assessmentId).toBe('assessment-list-1');
    });

    it('should paginate results correctly', async () => {
      const result = await submissionService.getSubmissions({
        page: 1,
        limit: 1
      }, mockTeacher);

      expect(result.submissions.length).toBe(1);
      expect(result.meta.limit).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('getSubmissionStats', () => {
    let assessmentId: string;

    beforeEach(async () => {
      assessmentId = 'assessment-stats-test';
      
      // Create submissions with different statuses
      const submission1 = await submissionService.createSubmission({
        assessmentId,
        autoSave: false
      }, mockStudent);

      const anotherStudent: UserContext = {
        id: 'student-stats-2',
        email: 'stats2@test.com',
        role: 'STUDENT',
        firstName: 'Stats',
        lastName: 'Student2'
      };

      const submission2 = await submissionService.createSubmission({
        assessmentId,
        autoSave: false
      }, anotherStudent);

      // Submit one of them
      await submissionService.submitSubmission(submission1.id, mockStudent);
    });

    it('should get submission statistics for teacher', async () => {
      const stats = await submissionService.getSubmissionStats(
        assessmentId,
        mockTeacher
      );

      expect(stats).toBeDefined();
      expect(stats.totalSubmissions).toBe(2);
      expect(stats.statusBreakdown.DRAFT).toBe(1);
      expect(stats.statusBreakdown.SUBMITTED).toBe(1);
    });

    it('should throw error when student tries to get stats', async () => {
      await expect(
        submissionService.getSubmissionStats(assessmentId, mockStudent)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('deleteSubmission', () => {
    let testSubmission: any;

    beforeEach(async () => {
      testSubmission = await submissionService.createSubmission({
        assessmentId: 'assessment-delete-test',
        autoSave: false
      }, mockStudent);
    });

    it('should allow admin to delete submission', async () => {
      const result = await submissionService.deleteSubmission(
        testSubmission.id,
        mockAdmin
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');

      // Verify submission is deleted
      await expect(
        submissionService.getSubmissionById(testSubmission.id, mockStudent)
      ).rejects.toThrow('Submission not found');
    });

    it('should throw error when non-admin tries to delete submission', async () => {
      await expect(
        submissionService.deleteSubmission(testSubmission.id, mockStudent)
      ).rejects.toThrow('Admin access required');
    });

    it('should throw error when trying to delete non-existent submission', async () => {
      await expect(
        submissionService.deleteSubmission('non-existent-id', mockAdmin)
      ).rejects.toThrow('Submission not found');
    });
  });
});