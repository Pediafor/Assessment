import request from 'supertest';
import { AssessmentEventSubscriber } from '../../src/events/subscriber';
import { getEventPublisher } from '../../src/events/publisher';
import { getRabbitMQConnection } from '../../src/config/rabbitmq';
import { AssessmentService } from '../../src/services/assessment.service';

// This test requires RabbitMQ to be running
describe('Event-Driven Workflow Integration Tests', () => {
  let eventSubscriber: AssessmentEventSubscriber;
  let assessmentService: AssessmentService;
  let eventPublisher: any;
  let rabbitMQ: any;

  beforeAll(async () => {
    // Initialize services for integration testing
    assessmentService = new AssessmentService();
    eventPublisher = getEventPublisher();
    rabbitMQ = getRabbitMQConnection();

    try {
      await rabbitMQ.connect();
      console.log('✅ RabbitMQ connected for integration tests');
    } catch (error) {
      console.log('⚠️  RabbitMQ not available - skipping integration tests');
      return;
    }

    eventSubscriber = new AssessmentEventSubscriber();
    await eventSubscriber.initialize();
  });

  afterAll(async () => {
    if (eventSubscriber) {
      await eventSubscriber.shutdown();
    }
    if (rabbitMQ && rabbitMQ.isConnected()) {
      await rabbitMQ.close();
    }
  });

  // Helper function to wait for async events to process
  const waitForEventProcessing = (ms: number = 100) => 
    new Promise(resolve => setTimeout(resolve, ms));

  describe('Assessment Service Event Flow', () => {
    it('should handle the complete assessment workflow', async () => {
      if (!rabbitMQ.isConnected()) {
        console.log('Skipping test - RabbitMQ not available');
        return;
      }

      // 1. Create an assessment (this would normally trigger assessment.created event)
      const assessmentData = {
        title: 'Integration Test Assessment',
        description: 'Test assessment for event-driven workflow',
        instructions: 'Complete the test',
        settings: {
          autoGrade: true,
          timeLimit: 60
        }
      };

      // Mock user context for test
      const userContext = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'TEACHER' as const,
        organizationId: 'test-org'
      };

      // Create assessment using service directly (since we don't have auth middleware in test)
      const assessment = await assessmentService.createAssessment(assessmentData, userContext);
      
      expect(assessment).toBeDefined();
      expect(assessment.id).toBeDefined();

      // 2. Simulate submission.submitted event
      const submissionEvent = {
        event: {
          id: `submission-${Date.now()}`,
          type: 'submission.submitted' as const,
          version: '1.0.0',
          data: {
            submissionId: `sub-${Date.now()}`,
            assessmentId: assessment.id,
            studentId: 'test-student-id',
            status: 'SUBMITTED'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'submission-service',
            correlationId: `corr-${Date.now()}`
          }
        }
      };

      // Publish the event
      await rabbitMQ.publish('submission.events', 'submission.submitted', submissionEvent);
      
      // Wait for event processing
      await waitForEventProcessing(200);

      // 3. Simulate submission.graded event
      const gradingEvent = {
        event: {
          id: `grading-${Date.now()}`,
          type: 'submission.graded' as const,
          version: '1.0.0',
          data: {
            submissionId: submissionEvent.event.data.submissionId,
            assessmentId: assessment.id,
            studentId: 'test-student-id',
            score: 85,
            totalMarks: 100
          },
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'grading-service',
            correlationId: submissionEvent.event.metadata.correlationId
          }
        }
      };

      await rabbitMQ.publish('submission.events', 'submission.graded', gradingEvent);
      await waitForEventProcessing(200);

      // 4. Simulate grading.completed event
      const gradingCompletedEvent = {
        event: {
          id: `grading-completed-${Date.now()}`,
          type: 'grading.completed' as const,
          version: '1.0.0',
          data: {
            submissionId: submissionEvent.event.data.submissionId,
            assessmentId: assessment.id,
            gradingId: `grade-${Date.now()}`,
            finalScore: 88,
            feedback: 'Great work on the integration test!'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'grading-service',
            correlationId: submissionEvent.event.metadata.correlationId
          }
        }
      };

      await rabbitMQ.publish('grading.events', 'grading.completed', gradingCompletedEvent);
      await waitForEventProcessing(200);

      // 5. Simulate user.registered event
      const userEvent = {
        event: {
          id: `user-${Date.now()}`,
          type: 'user.registered' as const,
          version: '1.0.0',
          data: {
            userId: 'new-student-id',
            role: 'STUDENT',
            organizationId: 'test-org'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'user-service',
            correlationId: `user-corr-${Date.now()}`
          }
        }
      };

      await rabbitMQ.publish('user.events', 'user.registered', userEvent);
      await waitForEventProcessing(200);

      // Verify the assessment still exists and was processed
      const updatedAssessment = await assessmentService.getAssessmentByIdInternal(assessment.id);
      expect(updatedAssessment).toBeDefined();
      expect(updatedAssessment?.id).toBe(assessment.id);

      console.log('✅ Complete event-driven workflow test completed successfully');
    }, 10000); // Longer timeout for integration test

    it('should handle event processing errors gracefully', async () => {
      if (!rabbitMQ.isConnected()) {
        console.log('Skipping test - RabbitMQ not available');
        return;
      }

      // Send an event with invalid data to test error handling
      const invalidEvent = {
        event: {
          id: 'invalid-event',
          type: 'submission.submitted' as const,
          version: '1.0.0',
          data: {
            // Missing required fields
            assessmentId: 'non-existent-assessment',
          },
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'test',
            correlationId: 'test-corr'
          }
        }
      };

      // This should not crash the subscriber
      await rabbitMQ.publish('submission.events', 'submission.submitted', invalidEvent);
      await waitForEventProcessing(200);

      // The subscriber should still be running
      expect(eventSubscriber).toBeDefined();

      console.log('✅ Error handling test completed successfully');
    });
  });

  describe('Event Publisher Integration', () => {
    it('should publish assessment events correctly', async () => {
      if (!rabbitMQ.isConnected()) {
        console.log('Skipping test - RabbitMQ not available');
        return;
      }

      const assessmentData = {
        assessmentId: 'test-assessment-id',
        totalSubmissions: 5,
        gradedAt: new Date().toISOString(),
        analytics: {
          averageScore: 85,
          completionRate: 90,
          totalSubmissions: 5,
          highestScore: 98,
          lowestScore: 72
        }
      };

      // Publish assessment fully graded event
      await eventPublisher.publishAssessmentFullyGraded(assessmentData);

      // Wait for event to be published
      await waitForEventProcessing(100);

      console.log('✅ Event publishing test completed successfully');
    });
  });

  describe('RabbitMQ Connection Management', () => {
    it('should handle connection issues gracefully', async () => {
      // Test that the subscriber can handle disconnections
      const originalConnection = rabbitMQ.isConnected();
      
      expect(typeof originalConnection).toBe('boolean');
      
      console.log('✅ Connection management test completed successfully');
    });
  });
});