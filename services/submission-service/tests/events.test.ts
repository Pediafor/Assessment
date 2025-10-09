import { SubmissionService } from '../src/services/submission.service';
import { getSubmissionEventPublisher } from '../src/events/publisher';
import { getRabbitMQConnection } from '../src/config/rabbitmq';
import { UserContext } from '../src/types';
import prisma from '../src/prismaClient';

// Mock RabbitMQ and event publisher
jest.mock('../src/config/rabbitmq');
jest.mock('../src/events/publisher');

describe('SubmissionService Event Publishing', () => {
  let submissionService: SubmissionService;
  let mockEventPublisher: any;
  let mockRabbitMQ: any;
  let mockStudent: UserContext;

  const generateUniqueAssessmentId = (prefix: string = 'event-test') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  beforeAll(async () => {
    submissionService = new SubmissionService();
    
    mockStudent = {
      id: 'student-event-123',
      email: 'student-event@test.com',
      role: 'STUDENT',
      firstName: 'John',
      lastName: 'Event'
    };

    // Setup mocks
    mockEventPublisher = {
      publishSubmissionSubmitted: jest.fn(),
      publishSubmissionUpdated: jest.fn(),
      ensureConnection: jest.fn()
    };

    mockRabbitMQ = {
      connect: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
      publish: jest.fn(),
      close: jest.fn()
    };

    (getSubmissionEventPublisher as jest.Mock).mockReturnValue(mockEventPublisher);
    (getRabbitMQConnection as jest.Mock).mockReturnValue(mockRabbitMQ);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.submission.deleteMany({
      where: {
        userId: mockStudent.id
      }
    });
  });

  describe('Event Publishing on Status Changes', () => {
    it('should publish submission.submitted event when status changes to SUBMITTED', async () => {
      const assessmentId = generateUniqueAssessmentId('submit-event');
      
      // Create a draft submission
      const submission = await submissionService.createSubmission(
        { assessmentId, autoSave: false },
        mockStudent
      );

      // Mock the event publisher methods
      mockEventPublisher.ensureConnection.mockResolvedValue(undefined);
      mockEventPublisher.publishSubmissionSubmitted.mockResolvedValue(undefined);

      // Update submission to submitted status
      await submissionService.updateSubmission(
        submission.id,
        { status: 'SUBMITTED' },
        mockStudent
      );

      // Verify event publisher was called
      expect(mockEventPublisher.ensureConnection).toHaveBeenCalled();
      expect(mockEventPublisher.publishSubmissionSubmitted).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionId: submission.id,
          assessmentId: assessmentId,
          studentId: mockStudent.id,
          status: 'SUBMITTED'
        }),
        expect.objectContaining({
          userId: mockStudent.id,
          correlationId: expect.stringContaining(`submission-update-${submission.id}`)
        })
      );
    });

    it('should publish submission.updated event when other fields change', async () => {
      const assessmentId = generateUniqueAssessmentId('update-event');
      
      // Create a draft submission
      const submission = await submissionService.createSubmission(
        { assessmentId, autoSave: false },
        mockStudent
      );

      // Mock the event publisher methods
      mockEventPublisher.ensureConnection.mockResolvedValue(undefined);
      mockEventPublisher.publishSubmissionUpdated.mockResolvedValue(undefined);

      // Update submission answers
      await submissionService.updateSubmission(
        submission.id,
        { 
          answers: { question1: 'answer1', question2: 'answer2' } 
        },
        mockStudent
      );

      // Verify event publisher was called
      expect(mockEventPublisher.ensureConnection).toHaveBeenCalled();
      expect(mockEventPublisher.publishSubmissionUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionId: submission.id,
          assessmentId: assessmentId,
          studentId: mockStudent.id,
          status: 'DRAFT',
          previousStatus: 'DRAFT',
          updatedFields: ['answers']
        }),
        expect.objectContaining({
          userId: mockStudent.id
        })
      );
    });

    it('should handle event publishing errors gracefully', async () => {
      const assessmentId = generateUniqueAssessmentId('error-event');
      
      // Create a draft submission
      const submission = await submissionService.createSubmission(
        { assessmentId, autoSave: false },
        mockStudent
      );

      // Mock event publisher to throw error
      mockEventPublisher.ensureConnection.mockResolvedValue(undefined);
      mockEventPublisher.publishSubmissionSubmitted.mockRejectedValue(
        new Error('RabbitMQ connection failed')
      );

      // Update should still succeed even if event publishing fails
      const updatedSubmission = await submissionService.updateSubmission(
        submission.id,
        { status: 'SUBMITTED' },
        mockStudent
      );

      expect(updatedSubmission.status).toBe('SUBMITTED');
      expect(mockEventPublisher.publishSubmissionSubmitted).toHaveBeenCalled();
    });

    it('should not publish events when status remains the same', async () => {
      const assessmentId = generateUniqueAssessmentId('no-event');
      
      // Create a draft submission
      const submission = await submissionService.createSubmission(
        { assessmentId, autoSave: false },
        mockStudent
      );

      // Update submission without changing status
      await submissionService.updateSubmission(
        submission.id,
        { answers: { question1: 'updated answer' } },
        mockStudent
      );

      // Verify no status change events were published
      expect(mockEventPublisher.publishSubmissionSubmitted).not.toHaveBeenCalled();
    });
  });

  describe('submitSubmission method event publishing', () => {
    it('should publish submission.submitted event when using submitSubmission method', async () => {
      const assessmentId = generateUniqueAssessmentId('submit-method');
      
      // Create a draft submission
      const submission = await submissionService.createSubmission(
        { assessmentId, autoSave: false },
        mockStudent
      );

      // Mock the event publisher methods
      mockEventPublisher.ensureConnection.mockResolvedValue(undefined);
      mockEventPublisher.publishSubmissionSubmitted.mockResolvedValue(undefined);

      // Submit the submission
      await submissionService.submitSubmission(submission.id, mockStudent);

      // Verify event was published
      expect(mockEventPublisher.publishSubmissionSubmitted).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionId: submission.id,
          assessmentId: assessmentId,
          studentId: mockStudent.id,
          status: 'SUBMITTED'
        }),
        expect.any(Object)
      );
    });
  });

  describe('Event Data Validation', () => {
    it('should publish events with correct data structure', async () => {
      const assessmentId = generateUniqueAssessmentId('data-validation');
      
      // Create submission with specific data
      const submission = await submissionService.createSubmission(
        { assessmentId, autoSave: false },
        mockStudent
      );

      // Add answers
      await submissionService.updateSubmission(
        submission.id,
        { 
          answers: { q1: 'answer1', q2: ['option1', 'option2'] },
          maxScore: 100
        },
        mockStudent
      );

      // Mock the event publisher
      mockEventPublisher.ensureConnection.mockResolvedValue(undefined);
      mockEventPublisher.publishSubmissionSubmitted.mockResolvedValue(undefined);

      // Submit with specific timestamp
      await submissionService.submitSubmission(submission.id, mockStudent);

      // Verify the event data structure
      expect(mockEventPublisher.publishSubmissionSubmitted).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionId: submission.id,
          assessmentId: assessmentId,
          studentId: mockStudent.id,
          status: 'SUBMITTED',
          totalMarks: 100,
          submittedAt: expect.any(String),
          answers: expect.arrayContaining([])
        }),
        expect.objectContaining({
          userId: mockStudent.id,
          correlationId: expect.stringMatching(/submission-update-.*-\d+/)
        })
      );
    });
  });

  describe('RabbitMQ Connection Management', () => {
    it('should ensure RabbitMQ connection before publishing events', async () => {
      const assessmentId = generateUniqueAssessmentId('connection-test');
      
      const submission = await submissionService.createSubmission(
        { assessmentId, autoSave: false },
        mockStudent
      );

      // Mock connection check
      mockEventPublisher.ensureConnection.mockResolvedValue(undefined);
      mockEventPublisher.publishSubmissionSubmitted.mockResolvedValue(undefined);

      await submissionService.submitSubmission(submission.id, mockStudent);

      // Verify connection was ensured before publishing
      expect(mockEventPublisher.ensureConnection).toHaveBeenCalled();
      expect(mockEventPublisher.publishSubmissionSubmitted).toHaveBeenCalled();
    });

    it('should handle connection failures gracefully', async () => {
      const assessmentId = generateUniqueAssessmentId('connection-fail');
      
      const submission = await submissionService.createSubmission(
        { assessmentId, autoSave: false },
        mockStudent
      );

      // Mock connection failure
      mockEventPublisher.ensureConnection.mockRejectedValue(
        new Error('Failed to connect to RabbitMQ')
      );

      // Should not throw error even if connection fails
      await expect(
        submissionService.submitSubmission(submission.id, mockStudent)
      ).resolves.not.toThrow();
    });
  });
});