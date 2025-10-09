import { getSubmissionEventPublisher } from '../src/events/publisher';
import { getRabbitMQConnection } from '../src/config/rabbitmq';

// Mock dependencies
jest.mock('../src/config/rabbitmq');

describe('Event Integration Tests', () => {
  let mockRabbitMQ: any;
  let eventPublisher: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRabbitMQ = {
      isConnected: jest.fn().mockReturnValue(true),
      connect: jest.fn(),
      publish: jest.fn().mockResolvedValue(true),
      subscribe: jest.fn(),
      close: jest.fn()
    };

    // Mock the getRabbitMQConnection
    const getRabbitMQConnectionMock = getRabbitMQConnection as jest.MockedFunction<typeof getRabbitMQConnection>;
    getRabbitMQConnectionMock.mockReturnValue(mockRabbitMQ);

    eventPublisher = getSubmissionEventPublisher();
  });

  describe('End-to-End Event Flow', () => {
    it('should handle complete submission workflow with proper correlation', async () => {
      const correlationId = 'test-correlation-123';
      const submissionData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const,
        submittedAt: new Date().toISOString(),
        answers: [
          { questionId: 'q1', answer: 'answer1' },
          { questionId: 'q2', answer: 'answer2' }
        ]
      };

      // Publish submission.submitted event
      await eventPublisher.publishSubmissionSubmitted(
        submissionData,
        { 
          correlationId,
          userId: submissionData.studentId 
        }
      );

      // Verify event was published with correct correlation
      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'submission.events',
        'submission.submitted',
        expect.objectContaining({
          event: expect.objectContaining({
            eventType: 'submission.submitted',
            data: submissionData
          }),
          metadata: expect.objectContaining({
            correlationId,
            userId: submissionData.studentId,
            source: 'submission-service'
          })
        })
      );
    });

    it('should maintain event ordering and correlation across services', async () => {
      const baseCorrelationId = 'workflow-456';
      
      // First event: submission created
      await eventPublisher.publishSubmissionUpdated({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'DRAFT' as const,
        previousStatus: undefined,
        updatedFields: ['answers']
      }, {
        correlationId: baseCorrelationId
      });

      // Second event: submission submitted
      await eventPublisher.publishSubmissionSubmitted({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const,
        submittedAt: new Date().toISOString(),
        answers: [{ questionId: 'q1', answer: 'answer1' }]
      }, {
        correlationId: baseCorrelationId
      });

      // Verify both events use same correlation ID
      expect(mockRabbitMQ.publish).toHaveBeenCalledTimes(2);
      
      const firstCall = mockRabbitMQ.publish.mock.calls[0];
      const secondCall = mockRabbitMQ.publish.mock.calls[1];
      
      const firstEvent = JSON.parse(JSON.stringify(firstCall[2]));
      const secondEvent = JSON.parse(JSON.stringify(secondCall[2]));
      
      expect(firstEvent.metadata.correlationId).toBe(baseCorrelationId);
      expect(secondEvent.metadata.correlationId).toBe(baseCorrelationId);
    });

    it('should handle event publishing failures gracefully', async () => {
      mockRabbitMQ.publish.mockRejectedValueOnce(new Error('Connection lost'));

      const submissionData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      };

      await expect(
        eventPublisher.publishSubmissionSubmitted(submissionData)
      ).rejects.toThrow('Connection lost');

      // Should have attempted to publish
      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'submission.events',
        'submission.submitted',
        expect.any(Object)
      );
    });

    it('should ensure connection before publishing multiple events', async () => {
      mockRabbitMQ.isConnected.mockReturnValue(false);

      const submissionData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      };

      // Publish multiple events
      await eventPublisher.publishSubmissionSubmitted(submissionData);
      await eventPublisher.publishSubmissionUpdated({
        ...submissionData,
        status: 'DRAFT' as const,
        previousStatus: 'DRAFT',
        updatedFields: ['answers']
      });

      // Should have connected before each publish attempt
      expect(mockRabbitMQ.connect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Data Validation', () => {
    it('should publish events with valid timestamps', async () => {
      const beforeTime = new Date().getTime();
      
      await eventPublisher.publishSubmissionSubmitted({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      });

      const afterTime = new Date().getTime();
      
      const publishCall = mockRabbitMQ.publish.mock.calls[0];
      const eventData = publishCall[2];
      
      const eventTimestamp = new Date(eventData.event.timestamp).getTime();
      const publishTimestamp = new Date(eventData.publishedAt).getTime();
      
      expect(eventTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(eventTimestamp).toBeLessThanOrEqual(afterTime);
      expect(publishTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(publishTimestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should generate unique event IDs for concurrent events', async () => {
      const submissionData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      };

      // Publish multiple events concurrently
      await Promise.all([
        eventPublisher.publishSubmissionSubmitted(submissionData),
        eventPublisher.publishSubmissionSubmitted({ ...submissionData, submissionId: 'sub-124' }),
        eventPublisher.publishSubmissionSubmitted({ ...submissionData, submissionId: 'sub-125' })
      ]);

      expect(mockRabbitMQ.publish).toHaveBeenCalledTimes(3);
      
      const eventIds = mockRabbitMQ.publish.mock.calls.map((call: any) => call[2].event.eventId);
      const uniqueEventIds = new Set(eventIds);
      
      expect(uniqueEventIds.size).toBe(3); // All event IDs should be unique
    });

    it('should include proper service identification in events', async () => {
      await eventPublisher.publishSubmissionSubmitted({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      });

      const publishCall = mockRabbitMQ.publish.mock.calls[0];
      const eventData = publishCall[2];
      
      expect(eventData.event.serviceId).toBe('submission-service');
      expect(eventData.event.version).toBe('1.0.0');
      expect(eventData.metadata.source).toBe('submission-service');
    });
  });

  describe('Event Metadata Handling', () => {
    it('should preserve user context across events', async () => {
      const userContext = {
        userId: 'student-789',
        correlationId: 'user-session-123'
      };

      await eventPublisher.publishSubmissionSubmitted({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      }, userContext);

      const publishCall = mockRabbitMQ.publish.mock.calls[0];
      const eventData = publishCall[2];
      
      expect(eventData.metadata.userId).toBe(userContext.userId);
      expect(eventData.metadata.correlationId).toBe(userContext.correlationId);
    });

    it('should generate correlation ID when not provided', async () => {
      await eventPublisher.publishSubmissionSubmitted({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      });

      const publishCall = mockRabbitMQ.publish.mock.calls[0];
      const eventData = publishCall[2];
      
      expect(eventData.metadata.correlationId).toBeDefined();
      expect(typeof eventData.metadata.correlationId).toBe('string');
      expect(eventData.metadata.correlationId.length).toBeGreaterThan(0);
    });

    it('should handle metadata merging correctly', async () => {
      const customMetadata = {
        userId: 'student-789',
        traceId: 'trace-123'
      };

      await eventPublisher.publishSubmissionSubmitted({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      }, customMetadata);

      const publishCall = mockRabbitMQ.publish.mock.calls[0];
      const eventData = publishCall[2];
      
      expect(eventData.metadata.userId).toBe(customMetadata.userId);
      expect(eventData.metadata.traceId).toBe(customMetadata.traceId);
      expect(eventData.metadata.source).toBe('submission-service'); // Should be set automatically
      expect(eventData.metadata.correlationId).toBeDefined(); // Should be generated
    });
  });

  describe('Connection Management', () => {
    it('should handle connection recovery', async () => {
      mockRabbitMQ.isConnected.mockReturnValueOnce(false);
      mockRabbitMQ.connect.mockResolvedValueOnce(undefined);

      await eventPublisher.ensureConnection();

      expect(mockRabbitMQ.connect).toHaveBeenCalledTimes(1);
    });

    it('should not reconnect if already connected', async () => {
      mockRabbitMQ.isConnected.mockReturnValue(true);

      await eventPublisher.ensureConnection();

      expect(mockRabbitMQ.connect).not.toHaveBeenCalled();
    });

    it('should handle connection errors during ensure connection', async () => {
      mockRabbitMQ.isConnected.mockReturnValue(false);
      mockRabbitMQ.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(eventPublisher.ensureConnection()).rejects.toThrow('Connection failed');
    });
  });

  describe('Event Publishing Performance', () => {
    it('should handle rapid sequential publishing', async () => {
      const startTime = Date.now();
      
      // Publish 10 events rapidly
      const publishPromises = Array.from({ length: 10 }, (_, i) =>
        eventPublisher.publishSubmissionSubmitted({
          submissionId: `sub-${i}`,
          assessmentId: 'assess-456',
          studentId: 'student-789',
          status: 'SUBMITTED' as const
        })
      );

      await Promise.all(publishPromises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(mockRabbitMQ.publish).toHaveBeenCalledTimes(10);
      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large event payloads', async () => {
      const largeAnswers = Array.from({ length: 100 }, (_, i) => ({
        questionId: `question-${i}`,
        answer: `This is a long answer for question ${i} with lots of content to test payload size handling`
      }));

      await eventPublisher.publishSubmissionSubmitted({
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const,
        answers: largeAnswers
      });

      expect(mockRabbitMQ.publish).toHaveBeenCalledTimes(1);
      
      const publishCall = mockRabbitMQ.publish.mock.calls[0];
      const eventData = publishCall[2];
      
      expect(eventData.event.data.answers).toHaveLength(100);
    });
  });
});