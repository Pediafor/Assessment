import { getGradingEventSubscriber } from '../src/events/subscriber';
import { getGradingEventPublisher } from '../src/events/publisher';
import { SubmissionSubmittedEvent } from '../src/events/types';
import { GradingService } from '../src/services/gradingService';
import { GradingRequest, GradingResponse, GradeResult } from '../src/types';

// Mock dependencies
jest.mock('../src/config/rabbitmq');
jest.mock('../src/services/gradingService');

describe('Grading Event System', () => {
  let mockRabbitMQ: any;
  let mockGradingService: jest.Mocked<GradingService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRabbitMQ = {
      isConnected: jest.fn().mockReturnValue(true),
      connect: jest.fn(),
      subscribe: jest.fn(),
      publish: jest.fn().mockResolvedValue(true),
      close: jest.fn()
    };

    mockGradingService = {
      gradeSubmission: jest.fn(),
      getGradingResult: jest.fn(),
      updateGradingStatus: jest.fn()
    } as any;

    // Mock the getRabbitMQConnection
    const { getRabbitMQConnection } = require('../src/config/rabbitmq');
    getRabbitMQConnection.mockReturnValue(mockRabbitMQ);
  });

  describe('Event Subscriber', () => {
    it('should initialize subscriber and setup queue subscriptions', async () => {
      const subscriber = getGradingEventSubscriber();
      
      await subscriber.initialize();

      expect(mockRabbitMQ.connect).toHaveBeenCalled();
      expect(mockRabbitMQ.subscribe).toHaveBeenCalledWith(
        'grading.submission.submitted',
        expect.any(Function)
      );
    });

    it('should handle connection errors during startup', async () => {
      mockRabbitMQ.connect.mockRejectedValue(new Error('Connection failed'));

      const subscriber = getGradingEventSubscriber();
      
      await expect(subscriber.initialize()).rejects.toThrow('Connection failed');
    });

    it('should process valid submission.submitted events', async () => {
      const validEvent: SubmissionSubmittedEvent = {
        event: {
          eventId: 'event-123',
          eventType: 'submission.submitted',
          timestamp: new Date().toISOString(),
          serviceId: 'submission-service',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assess-456',
            studentId: 'student-789',
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            answers: [
              { questionId: 'q1', answer: 'answer1' },
              { questionId: 'q2', answer: 'answer2' }
            ]
          }
        },
        metadata: {
          correlationId: 'corr-123',
          source: 'submission-service',
          userId: 'student-789'
        },
        publishedAt: new Date().toISOString()
      };

      const mockGradeResult: GradeResult = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        userId: 'student-789',
        totalScore: 85,
        maxScore: 100,
        percentage: 85,
        questionGrades: [],
        gradedAt: new Date(),
        isAutomated: true
      };

      const mockGradingResponse: GradingResponse = {
        success: true,
        grade: mockGradeResult
      };

      mockGradingService.gradeSubmission.mockResolvedValue(mockGradingResponse);

      const subscriber = getGradingEventSubscriber();
      await subscriber.initialize();

      // Get the handler function from the subscribe call
      const subscribeCall = mockRabbitMQ.subscribe.mock.calls.find(
        (call: any) => call[0] === 'grading.submission.submitted'
      );
      const handler = subscribeCall[1];

      await handler(validEvent);

      expect(mockGradingService.gradeSubmission).toHaveBeenCalledWith({
        submissionId: validEvent.event.data.submissionId,
        assessmentId: validEvent.event.data.assessmentId,
        userId: validEvent.event.data.studentId
      });
    });

    it('should handle events with missing required fields', async () => {
      const invalidEvent = {
        event: {
          eventId: 'event-123',
          eventType: 'submission.submitted',
          data: {
            submissionId: 'sub-123'
            // Missing assessmentId, studentId, etc.
          }
        }
      };

      const subscriber = getGradingEventSubscriber();
      await subscriber.initialize();

      const subscribeCall = mockRabbitMQ.subscribe.mock.calls.find(
        (call: any) => call[0] === 'grading.submission.submitted'
      );
      const handler = subscribeCall[1];

      // Should not throw, but should not call grading service
      await handler(invalidEvent as any);

      expect(mockGradingService.gradeSubmission).not.toHaveBeenCalled();
    });

    it('should handle grading service errors gracefully', async () => {
      const validEvent: SubmissionSubmittedEvent = {
        event: {
          eventId: 'event-123',
          eventType: 'submission.submitted',
          timestamp: new Date().toISOString(),
          serviceId: 'submission-service',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assess-456',
            studentId: 'student-789',
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            answers: []
          }
        },
        metadata: {
          correlationId: 'corr-123',
          source: 'submission-service'
        },
        publishedAt: new Date().toISOString()
      };

      mockGradingService.gradeSubmission.mockRejectedValue(
        new Error('Grading failed')
      );

      const subscriber = getGradingEventSubscriber();
      await subscriber.initialize();

      const subscribeCall = mockRabbitMQ.subscribe.mock.calls.find(
        (call: any) => call[0] === 'grading.submission.submitted'
      );
      const handler = subscribeCall[1];

      // Should not throw - errors should be handled internally
      await expect(handler(validEvent)).resolves.not.toThrow();
    });

    it('should process events only for SUBMITTED status', async () => {
      const draftEvent: SubmissionSubmittedEvent = {
        event: {
          eventId: 'event-123',
          eventType: 'submission.submitted',
          timestamp: new Date().toISOString(),
          serviceId: 'submission-service',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assess-456',
            studentId: 'student-789',
            status: 'DRAFT', // Not SUBMITTED
            submittedAt: new Date().toISOString(),
            answers: []
          }
        },
        metadata: {
          correlationId: 'corr-123',
          source: 'submission-service'
        },
        publishedAt: new Date().toISOString()
      };

      const subscriber = getGradingEventSubscriber();
      await subscriber.initialize();

      const subscribeCall = mockRabbitMQ.subscribe.mock.calls.find(
        (call: any) => call[0] === 'grading.submission.submitted'
      );
      const handler = subscribeCall[1];

      await handler(draftEvent);

      expect(mockGradingService.gradeSubmission).not.toHaveBeenCalled();
    });
  });

  describe('Event Publisher', () => {
    it('should publish grading.completed events with correct structure', async () => {
      const gradingData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        totalMarks: 100,
        calculatedMarks: 85,
        percentage: 85,
        gradedAt: new Date().toISOString(),
        gradingStatus: 'SUCCESS' as const,
        questionsGraded: 2,
        totalQuestions: 2
      };

      const metadata = {
        correlationId: 'corr-123',
        userId: 'student-789'
      };

      const publisher = getGradingEventPublisher();
      await publisher.publishGradingCompleted(gradingData, metadata);

      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'grading.events',
        'grading.completed',
        expect.objectContaining({
          event: expect.objectContaining({
            eventType: 'grading.completed',
            serviceId: 'grading-service',
            data: gradingData
          }),
          metadata: expect.objectContaining(metadata)
        })
      );
    });

    it('should publish grading.failed events for failed grading attempts', async () => {
      const failureData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        totalMarks: 100,
        calculatedMarks: 0,
        percentage: 0,
        gradedAt: new Date().toISOString(),
        gradingStatus: 'FAILED' as const,
        errorMessage: 'Assessment configuration not found',
        retryable: false
      };

      const publisher = getGradingEventPublisher();
      await publisher.publishGradingFailed(failureData);

      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'grading.events',
        'grading.failed',
        expect.objectContaining({
          event: expect.objectContaining({
            eventType: 'grading.failed',
            data: failureData
          })
        })
      );
    });

    it('should handle publishing errors', async () => {
      mockRabbitMQ.publish.mockRejectedValue(new Error('Publishing failed'));

      const gradingData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        totalMarks: 100,
        calculatedMarks: 85,
        percentage: 85,
        gradedAt: new Date().toISOString(),
        gradingStatus: 'SUCCESS' as const
      };

      const publisher = getGradingEventPublisher();
      
      await expect(
        publisher.publishGradingCompleted(gradingData)
      ).rejects.toThrow('Publishing failed');
    });
  });

  describe('Integration Flow', () => {
    it('should handle complete submission-to-grading flow', async () => {
      // Setup subscriber and publisher
      const subscriber = getGradingEventSubscriber();
      const publisher = getGradingEventPublisher();
      
      await subscriber.initialize();

      // Mock successful grading
      const mockGradeResult: GradeResult = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        userId: 'student-789',
        totalScore: 85,
        maxScore: 100,
        percentage: 85,
        questionGrades: [
          {
            questionId: 'q1',
            pointsEarned: 40,
            maxPoints: 50,
            isCorrect: true,
            studentAnswer: 'answer1',
            correctAnswer: 'answer1'
          },
          {
            questionId: 'q2',
            pointsEarned: 45,
            maxPoints: 50,
            isCorrect: true,
            studentAnswer: 'answer2',
            correctAnswer: 'answer2'
          }
        ],
        gradedAt: new Date(),
        isAutomated: true
      };

      const mockGradingResponse: GradingResponse = {
        success: true,
        grade: mockGradeResult
      };

      mockGradingService.gradeSubmission.mockResolvedValue(mockGradingResponse);

      // Create submission event
      const submissionEvent: SubmissionSubmittedEvent = {
        event: {
          eventId: 'event-123',
          eventType: 'submission.submitted',
          timestamp: new Date().toISOString(),
          serviceId: 'submission-service',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assess-456',
            studentId: 'student-789',
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            answers: [
              { questionId: 'q1', answer: 'answer1' },
              { questionId: 'q2', answer: 'answer2' }
            ]
          }
        },
        metadata: {
          correlationId: 'corr-123',
          source: 'submission-service',
          userId: 'student-789'
        },
        publishedAt: new Date().toISOString()
      };

      // Process submission event
      const subscribeCall = mockRabbitMQ.subscribe.mock.calls.find(
        (call: any) => call[0] === 'grading.submission.submitted'
      );
      const handler = subscribeCall[1];

      await handler(submissionEvent);

      // Verify grading was triggered
      expect(mockGradingService.gradeSubmission).toHaveBeenCalledWith({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        userId: 'student-789'
      });

      // Simulate publishing grading completion event
      await publisher.publishGradingCompleted({
        submissionId: mockGradeResult.submissionId,
        assessmentId: mockGradeResult.assessmentId,
        studentId: mockGradeResult.userId,
        totalMarks: mockGradeResult.maxScore,
        calculatedMarks: mockGradeResult.totalScore,
        percentage: mockGradeResult.percentage,
        gradedAt: mockGradeResult.gradedAt.toISOString(),
        gradingStatus: 'SUCCESS' as const,
        questionsGraded: mockGradeResult.questionGrades.length,
        totalQuestions: mockGradeResult.questionGrades.length
      }, {
        correlationId: 'corr-123',
        userId: 'student-789'
      });

      // Verify grading completion was published
      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'grading.events',
        'grading.completed',
        expect.objectContaining({
          event: expect.objectContaining({
            eventType: 'grading.completed'
          }),
          metadata: expect.objectContaining({
            correlationId: 'corr-123'
          })
        })
      );
    });

    it('should handle grading failure scenarios', async () => {
      const subscriber = getGradingEventSubscriber();
      const publisher = getGradingEventPublisher();
      
      await subscriber.initialize();

      const gradingError = new Error('Assessment not found');
      mockGradingService.gradeSubmission.mockRejectedValue(gradingError);

      const submissionEvent: SubmissionSubmittedEvent = {
        event: {
          eventId: 'event-123',
          eventType: 'submission.submitted',
          timestamp: new Date().toISOString(),
          serviceId: 'submission-service',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assess-456',
            studentId: 'student-789',
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            answers: []
          }
        },
        metadata: {
          correlationId: 'corr-123',
          source: 'submission-service'
        },
        publishedAt: new Date().toISOString()
      };

      const subscribeCall = mockRabbitMQ.subscribe.mock.calls.find(
        (call: any) => call[0] === 'grading.submission.submitted'
      );
      const handler = subscribeCall[1];

      // Process event - should handle error gracefully
      await handler(submissionEvent);

      expect(mockGradingService.gradeSubmission).toHaveBeenCalled();
      
      // Should be able to publish failure event
      await publisher.publishGradingFailed({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        totalMarks: 100,
        calculatedMarks: 0,
        percentage: 0,
        gradedAt: new Date().toISOString(),
        gradingStatus: 'FAILED' as const,
        errorMessage: gradingError.message,
        retryable: false
      });

      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'grading.events',
        'grading.failed',
        expect.objectContaining({
          event: expect.objectContaining({
            eventType: 'grading.failed'
          })
        })
      );
    });
  });

  describe('Event Processing Logging', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log successful event processing', async () => {
      const validEvent: SubmissionSubmittedEvent = {
        event: {
          eventId: 'event-123',
          eventType: 'submission.submitted',
          timestamp: new Date().toISOString(),
          serviceId: 'submission-service',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assess-456',
            studentId: 'student-789',
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            answers: []
          }
        },
        metadata: {
          correlationId: 'corr-123',
          source: 'submission-service'
        },
        publishedAt: new Date().toISOString()
      };

      const mockGradingResponse: GradingResponse = {
        success: true,
        grade: {
          submissionId: 'sub-123',
          assessmentId: 'assess-456',
          userId: 'student-789',
          totalScore: 85,
          maxScore: 100,
          percentage: 85,
          questionGrades: [],
          gradedAt: new Date(),
          isAutomated: true
        }
      };

      mockGradingService.gradeSubmission.mockResolvedValue(mockGradingResponse);

      const subscriber = getGradingEventSubscriber();
      await subscriber.initialize();

      const subscribeCall = mockRabbitMQ.subscribe.mock.calls.find(
        (call: any) => call[0] === 'grading.submission.submitted'
      );
      const handler = subscribeCall[1];

      await handler(validEvent);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing submission.submitted event')
      );
    });

    it('should log errors during event processing', async () => {
      const validEvent: SubmissionSubmittedEvent = {
        event: {
          eventId: 'event-123',
          eventType: 'submission.submitted',
          timestamp: new Date().toISOString(),
          serviceId: 'submission-service',
          version: '1.0.0',
          data: {
            submissionId: 'sub-123',
            assessmentId: 'assess-456',
            studentId: 'student-789',
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            answers: []
          }
        },
        metadata: {
          correlationId: 'corr-123',
          source: 'submission-service'
        },
        publishedAt: new Date().toISOString()
      };

      const gradingError = new Error('Grading failed');
      mockGradingService.gradeSubmission.mockRejectedValue(gradingError);

      const subscriber = getGradingEventSubscriber();
      await subscriber.initialize();

      const subscribeCall = mockRabbitMQ.subscribe.mock.calls.find(
        (call: any) => call[0] === 'grading.submission.submitted'
      );
      const handler = subscribeCall[1];

      await handler(validEvent);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error processing submission.submitted event'),
        expect.objectContaining({
          submissionId: 'sub-123',
          error: gradingError.message
        })
      );
    });
  });
});