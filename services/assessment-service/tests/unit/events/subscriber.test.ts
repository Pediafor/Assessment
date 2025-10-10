import { AssessmentEventSubscriber } from '../../../src/events/subscriber';
import { AssessmentService } from '../../../src/services/assessment.service';
import { getRabbitMQConnection } from '../../../src/config/rabbitmq';
import { getAssessmentEventPublisher } from '../../../src/events/publisher';
import {
  SubmissionSubmittedEvent,
  SubmissionGradedEvent,
  GradingCompletedEvent,
  UserRegisteredEvent
} from '../../../src/types';

// Mock dependencies
jest.mock('../../../src/config/rabbitmq');
jest.mock('../../../src/events/publisher');
jest.mock('../../../src/services/assessment.service');

describe('AssessmentEventSubscriber', () => {
  let subscriber: AssessmentEventSubscriber;
  let mockRabbitMQ: any;
  let mockEventPublisher: any;
  let mockAssessmentService: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock RabbitMQ connection
    mockRabbitMQ = {
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(true),
      close: jest.fn().mockResolvedValue(undefined)
    };
    (getRabbitMQConnection as jest.Mock).mockReturnValue(mockRabbitMQ);

    // Mock event publisher
    mockEventPublisher = {
      publishAssessmentFullyGraded: jest.fn().mockResolvedValue(undefined)
    };
    (getAssessmentEventPublisher as jest.Mock).mockReturnValue(mockEventPublisher);

    // Mock assessment service
    mockAssessmentService = {
      updateAssessmentStats: jest.fn().mockResolvedValue(undefined),
      getAssessmentByIdInternal: jest.fn().mockResolvedValue({
        id: 'test-assessment-id',
        settings: { autoGrade: true }
      }),
      calculateAssessmentAnalytics: jest.fn().mockResolvedValue({
        averageScore: 85,
        completionRate: 90,
        totalSubmissions: 10
      }),
      markSubmissionGradingComplete: jest.fn().mockResolvedValue(undefined),
      checkAllSubmissionsGraded: jest.fn().mockResolvedValue(false),
      updateOrganizationStats: jest.fn().mockResolvedValue(undefined)
    };

    subscriber = new AssessmentEventSubscriber();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await subscriber.initialize();

      expect(mockRabbitMQ.connect).toHaveBeenCalled();
      expect(mockRabbitMQ.subscribe).toHaveBeenCalledTimes(4);
      
      // Verify all event subscriptions
      expect(mockRabbitMQ.subscribe).toHaveBeenCalledWith(
        'submission.events', 
        'submission.submitted',
        expect.any(Function)
      );
      expect(mockRabbitMQ.subscribe).toHaveBeenCalledWith(
        'submission.events', 
        'submission.graded',
        expect.any(Function)
      );
      expect(mockRabbitMQ.subscribe).toHaveBeenCalledWith(
        'grading.events', 
        'grading.completed',
        expect.any(Function)
      );
      expect(mockRabbitMQ.subscribe).toHaveBeenCalledWith(
        'user.events', 
        'user.registered',
        expect.any(Function)
      );
    });

    it('should handle RabbitMQ connection failure', async () => {
      mockRabbitMQ.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(subscriber.initialize()).rejects.toThrow('Connection failed');
    });
  });

  describe('submission.submitted event handling', () => {
    it('should handle submission submitted event correctly', async () => {
      const mockEvent: SubmissionSubmittedEvent = {
        event: {
          id: 'event-id',
          type: 'submission.submitted',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assessment-456',
            studentId: 'student-789',
            status: 'SUBMITTED'
          },
          metadata: {
            timestamp: '2023-01-01T00:00:00Z',
            source: 'submission-service',
            correlationId: 'corr-123'
          }
        }
      };

      // Call the handler directly
      await (subscriber as any).handleSubmissionSubmitted(mockEvent);

      expect(mockAssessmentService.updateAssessmentStats).toHaveBeenCalledWith(
        'assessment-456',
        {
          totalSubmissions: 1,
          lastSubmissionAt: expect.any(Date)
        }
      );

      expect(mockAssessmentService.getAssessmentByIdInternal).toHaveBeenCalledWith('assessment-456');
    });

    it('should handle auto-grading when enabled', async () => {
      const mockEvent: SubmissionSubmittedEvent = {
        event: {
          id: 'event-id',
          type: 'submission.submitted',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assessment-456',
            studentId: 'student-789',
            status: 'SUBMITTED'
          },
          metadata: {
            timestamp: '2023-01-01T00:00:00Z',
            source: 'submission-service',
            correlationId: 'corr-123'
          }
        }
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await (subscriber as any).handleSubmissionSubmitted(mockEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-grading enabled for assessment assessment-456, submission sub-123')
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      mockAssessmentService.updateAssessmentStats.mockRejectedValue(new Error('Database error'));

      const mockEvent: SubmissionSubmittedEvent = {
        event: {
          id: 'event-id',
          type: 'submission.submitted',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assessment-456',
            studentId: 'student-789',
            status: 'SUBMITTED'
          },
          metadata: {
            timestamp: '2023-01-01T00:00:00Z',
            source: 'submission-service',
            correlationId: 'corr-123'
          }
        }
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw - errors are handled gracefully
      await expect((subscriber as any).handleSubmissionSubmitted(mockEvent)).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process submission.submitted event'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('submission.graded event handling', () => {
    it('should handle submission graded event correctly', async () => {
      const mockEvent: SubmissionGradedEvent = {
        event: {
          id: 'event-id',
          type: 'submission.graded',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assessment-456',
            studentId: 'student-789',
            score: 85,
            totalMarks: 100
          },
          metadata: {
            timestamp: '2023-01-01T00:00:00Z',
            source: 'grading-service',
            correlationId: 'corr-123'
          }
        }
      };

      await (subscriber as any).handleSubmissionGraded(mockEvent);

      expect(mockAssessmentService.updateAssessmentStats).toHaveBeenCalledWith(
        'assessment-456',
        {
          completedSubmissions: 1,
          averageScore: 85,
          lastSubmissionAt: expect.any(Date)
        }
      );

      expect(mockAssessmentService.calculateAssessmentAnalytics).toHaveBeenCalledWith('assessment-456');
    });
  });

  describe('grading.completed event handling', () => {
    it('should handle grading completed event correctly', async () => {
      const mockEvent: GradingCompletedEvent = {
        event: {
          id: 'event-id',
          type: 'grading.completed',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assessment-456',
            gradingId: 'grade-789',
            finalScore: 88,
            feedback: 'Good work!'
          },
          metadata: {
            timestamp: '2023-01-01T00:00:00Z',
            source: 'grading-service',
            correlationId: 'corr-123'
          }
        }
      };

      await (subscriber as any).handleGradingCompleted(mockEvent);

      expect(mockAssessmentService.markSubmissionGradingComplete).toHaveBeenCalledWith(
        'assessment-456',
        'sub-123',
        {
          score: 88,
          feedback: 'Good work!',
          gradedAt: expect.any(Date)
        }
      );

      expect(mockAssessmentService.checkAllSubmissionsGraded).toHaveBeenCalledWith('assessment-456');
    });

    it('should publish assessment fully graded event when all submissions are graded', async () => {
      mockAssessmentService.checkAllSubmissionsGraded.mockResolvedValue(true);

      const mockEvent: GradingCompletedEvent = {
        event: {
          id: 'event-id',
          type: 'grading.completed',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assessment-456',
            gradingId: 'grade-789',
            finalScore: 88,
            feedback: 'Good work!'
          },
          metadata: {
            timestamp: '2023-01-01T00:00:00Z',
            source: 'grading-service',
            correlationId: 'corr-123'
          }
        }
      };

      await (subscriber as any).handleGradingCompleted(mockEvent);

      expect(mockEventPublisher.publishAssessmentFullyGraded).toHaveBeenCalledWith({
        assessmentId: 'assessment-456',
        totalSubmissions: 0,
        gradedAt: expect.any(String),
        analytics: {
          averageScore: 0,
          completionRate: 0,
          totalSubmissions: 0,
          highestScore: 0,
          lowestScore: 0
        }
      });
    });
  });

  describe('user.registered event handling', () => {
    it('should handle user registered event for students', async () => {
      const mockEvent: UserRegisteredEvent = {
        event: {
          id: 'event-id',
          type: 'user.registered',
          version: '1.0.0',
          data: {
            userId: 'user-123',
            role: 'STUDENT',
            organizationId: 'org-456'
          },
          metadata: {
            timestamp: '2023-01-01T00:00:00Z',
            source: 'user-service',
            correlationId: 'corr-123'
          }
        }
      };

      await (subscriber as any).handleUserRegistered(mockEvent);

      expect(mockAssessmentService.updateOrganizationStats).toHaveBeenCalledWith(
        'org-456',
        {
          totalUsers: 1,
          activeUsers: 1,
          lastActivityAt: expect.any(Date)
        }
      );
    });

    it('should not update stats for non-student roles', async () => {
      const mockEvent: UserRegisteredEvent = {
        event: {
          id: 'event-id',
          type: 'user.registered',
          version: '1.0.0',
          data: {
            userId: 'user-123',
            role: 'ADMIN',
            organizationId: 'org-456'
          },
          metadata: {
            timestamp: '2023-01-01T00:00:00Z',
            source: 'user-service',
            correlationId: 'corr-123'
          }
        }
      };

      await (subscriber as any).handleUserRegistered(mockEvent);

      expect(mockAssessmentService.updateOrganizationStats).not.toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should shutdown gracefully', async () => {
      await subscriber.shutdown();

      expect(mockRabbitMQ.close).toHaveBeenCalled();
    });

    it('should handle shutdown errors gracefully', async () => {
      mockRabbitMQ.close.mockRejectedValue(new Error('Close failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await subscriber.shutdown();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error shutting down assessment event subscriber:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});