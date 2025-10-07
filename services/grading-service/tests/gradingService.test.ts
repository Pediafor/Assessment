import { GradingService } from '../src/services/gradingService';
import { createTestGrade, createTestQuestionGrade, createTestGradingConfig, prisma } from './setup';

// Mock the external service calls
jest.mock('../src/services/gradingService', () => {
  const originalModule = jest.requireActual('../src/services/gradingService');
  
  return {
    ...originalModule,
    GradingService: class MockGradingService extends originalModule.GradingService {
      async fetchSubmissionData(submissionId: string) {
        return {
          id: submissionId,
          userId: 'test-user-123',
          assessmentId: 'test-assessment-123',
          answers: {
            'q1': 'A',
            'q2': 'B',
            'q3': true
          },
          status: 'submitted',
          submittedAt: new Date()
        };
      }

      async fetchAssessmentData(assessmentId: string) {
        return {
          id: assessmentId,
          title: 'Test Assessment',
          questions: [
            {
              id: 'q1',
              type: 'multiple_choice' as const,
              content: 'What is 2 + 2?',
              options: ['A) 3', 'B) 4', 'C) 5'],
              correctAnswer: 'B',
              points: 10
            },
            {
              id: 'q2',
              type: 'multiple_choice' as const,
              content: 'What is 3 + 3?',
              options: ['A) 5', 'B) 6', 'C) 7'],
              correctAnswer: 'B',
              points: 10
            },
            {
              id: 'q3',
              type: 'true_false' as const,
              content: 'The sky is blue.',
              correctAnswer: true,
              points: 5
            }
          ],
          totalPoints: 25
        };
      }
    }
  };
});

describe('GradingService', () => {
  let gradingService: GradingService;

  beforeEach(() => {
    gradingService = new GradingService();
  });

  afterEach(async () => {
    await gradingService.disconnect();
  });

  describe('gradeSubmission', () => {
    test('should grade a submission successfully', async () => {
      const submissionId = 'test-submission-123';
      
      const result = await gradingService.gradeSubmission({
        submissionId
      });

      expect(result.success).toBe(true);
      expect(result.grade).toBeDefined();
      expect(result.grade?.submissionId).toBe(submissionId);
      expect(result.grade?.totalScore).toBeGreaterThan(0);
      expect(result.grade?.questionGrades).toHaveLength(3);
    });

    test('should not regrade existing submission without forceRegrade', async () => {
      const submissionId = 'test-submission-existing';
      
      // Create an existing grade
      const existingGrade = await createTestGrade({
        submissionId,
        assessmentId: 'test-assessment-123',
        userId: 'test-user-123'
      });

      const result = await gradingService.gradeSubmission({
        submissionId
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('already graded');
      expect(result.grade?.totalScore).toBe(85); // From existing grade
    });

    test('should regrade when forceRegrade is true', async () => {
      const submissionId = 'test-submission-force';
      
      // Create an existing grade
      await createTestGrade({
        submissionId,
        assessmentId: 'test-assessment-123',
        userId: 'test-user-123',
        totalScore: 50 // Different score
      });

      const result = await gradingService.gradeSubmission({
        submissionId,
        forceRegrade: true
      });

      expect(result.success).toBe(true);
      expect(result.grade?.totalScore).not.toBe(50); // Should be newly calculated
    });

    test('should handle missing submission', async () => {
      // Mock fetchSubmissionData to return null
      jest.spyOn(gradingService as any, 'fetchSubmissionData').mockResolvedValueOnce(null);

      const result = await gradingService.gradeSubmission({
        submissionId: 'nonexistent-submission'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Submission not found');
    });

    test('should handle missing assessment', async () => {
      // Mock fetchAssessmentData to return null
      jest.spyOn(gradingService as any, 'fetchAssessmentData').mockResolvedValueOnce(null);

      const result = await gradingService.gradeSubmission({
        submissionId: 'test-submission-no-assessment'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Assessment not found');
    });
  });

  describe('getGradeBySubmissionId', () => {
    test('should retrieve existing grade', async () => {
      const submissionId = 'test-submission-retrieve';
      const testGrade = await createTestGrade({
        submissionId,
        assessmentId: 'test-assessment-123',
        userId: 'test-user-123'
      });

      await createTestQuestionGrade(testGrade.id, {
        questionId: 'q1',
        pointsEarned: 10,
        maxPoints: 10,
        isCorrect: true
      });

      const result = await gradingService.getGradeBySubmissionId(submissionId);

      expect(result).toBeDefined();
      expect(result?.submissionId).toBe(submissionId);
      expect(result?.questionGrades).toHaveLength(1);
    });

    test('should return null for nonexistent grade', async () => {
      const result = await gradingService.getGradeBySubmissionId('nonexistent-submission');

      expect(result).toBeNull();
    });
  });

  describe('getGradesByUserId', () => {
    test('should retrieve all grades for a user', async () => {
      const userId = 'test-user-grades';
      
      // Create multiple grades for the user
      await createTestGrade({
        submissionId: 'sub1',
        assessmentId: 'assessment1',
        userId,
        totalScore: 85
      });

      await createTestGrade({
        submissionId: 'sub2',
        assessmentId: 'assessment2',
        userId,
        totalScore: 92
      });

      const result = await gradingService.getGradesByUserId(userId);

      expect(result).toHaveLength(2);
      expect(result.every(grade => grade.userId === userId)).toBe(true);
    });

    test('should return empty array for user with no grades', async () => {
      const result = await gradingService.getGradesByUserId('user-no-grades');

      expect(result).toHaveLength(0);
    });
  });

  describe('getGradesByAssessmentId', () => {
    test('should retrieve all grades for an assessment', async () => {
      const assessmentId = 'test-assessment-grades';
      
      // Create multiple grades for the assessment
      await createTestGrade({
        submissionId: 'sub1',
        assessmentId,
        userId: 'user1',
        totalScore: 85
      });

      await createTestGrade({
        submissionId: 'sub2',
        assessmentId,
        userId: 'user2',
        totalScore: 92
      });

      const result = await gradingService.getGradesByAssessmentId(assessmentId);

      expect(result).toHaveLength(2);
      expect(result.every(grade => grade.assessmentId === assessmentId)).toBe(true);
    });
  });

  describe('grading configuration', () => {
    test('should use custom grading config when available', async () => {
      const assessmentId = 'test-assessment-config';
      
      // Create custom grading config
      await createTestGradingConfig({
        assessmentId,
        allowPartialCredit: false,
        showFeedback: false,
        mcqScoringType: 'NEGATIVE_MARKING',
        penaltyPerWrongAnswer: 2
      });

      // The grading would use this config (tested via integration)
      const config = await (gradingService as any).getGradingConfig(assessmentId);
      
      expect(config.allowPartialCredit).toBe(false);
      expect(config.showFeedback).toBe(false);
      expect(config.mcqScoringType).toBe('negative_marking');
      expect(config.penaltyPerWrongAnswer).toBe(2);
    });

    test('should use default config when none exists', async () => {
      const config = await (gradingService as any).getGradingConfig('nonexistent-assessment');
      
      expect(config.gradingMethod).toBe('automated');
      expect(config.allowPartialCredit).toBe(true);
      expect(config.mcqScoringType).toBe('standard');
    });
  });

  describe('overall feedback generation', () => {
    test('should generate excellent feedback for 90%+', () => {
      const feedback = (gradingService as any).generateOverallFeedback(95, 95, 100);
      
      expect(feedback).toContain('Excellent');
      expect(feedback).toContain('95/100');
      expect(feedback).toContain('95.0%');
    });

    test('should generate good feedback for 80-89%', () => {
      const feedback = (gradingService as any).generateOverallFeedback(85, 85, 100);
      
      expect(feedback).toContain('Great job');
      expect(feedback).toContain('85/100');
    });

    test('should generate improvement feedback for <60%', () => {
      const feedback = (gradingService as any).generateOverallFeedback(45, 45, 100);
      
      expect(feedback).toContain('review the material');
      expect(feedback).toContain('45/100');
    });
  });
});