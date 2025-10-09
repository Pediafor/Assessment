import { getRabbitMQConnection } from '../config/rabbitmq';
import { getGradingEventPublisher } from './publisher';
import { SubmissionSubmittedEvent } from './types';
import { GradingService } from '../services/gradingService';

class GradingEventSubscriber {
  private rabbitMQ = getRabbitMQConnection();
  private gradingService = new GradingService();
  private eventPublisher = getGradingEventPublisher();

  async initialize(): Promise<void> {
    try {
      // Ensure RabbitMQ connection
      if (!this.rabbitMQ.isConnected()) {
        await this.rabbitMQ.connect();
      }

      // Subscribe to submission submitted events
      await this.rabbitMQ.subscribe('grading.submission.submitted', this.handleSubmissionSubmitted.bind(this));
      
      console.log('🎧 Grading event subscriber initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize grading event subscriber:', error);
      throw error;
    }
  }

  private async handleSubmissionSubmitted(eventMessage: SubmissionSubmittedEvent): Promise<void> {
    console.log(`🎯 Processing submission.submitted event for submission ${eventMessage.event.data.submissionId}`);
    
    try {
      const { submissionId, assessmentId, studentId } = eventMessage.event.data;

      // Start grading process
      console.log(`⚡ Starting automatic grading for submission ${submissionId}`);
      
      // Call the grading service to grade the submission
      const gradingResult = await this.gradingService.gradeSubmission({
        submissionId,
        assessmentId,
        userId: studentId,
        forceRegrade: false
      });

      if (!gradingResult.success || !gradingResult.grade) {
        throw new Error(gradingResult.error || 'Grading failed');
      }

      // Publish grading completed event
      const gradingEventData = {
        submissionId,
        assessmentId,
        studentId,
        totalMarks: gradingResult.grade.maxScore,
        calculatedMarks: gradingResult.grade.totalScore,
        percentage: gradingResult.grade.percentage,
        gradedAt: gradingResult.grade.gradedAt.toISOString(),
        gradingStatus: 'SUCCESS' as const,
        questionsGraded: gradingResult.grade.questionGrades.length,
        totalQuestions: gradingResult.grade.questionGrades.length
      };

      const metadata = {
        correlationId: eventMessage.metadata.correlationId || `grading-${submissionId}-${Date.now()}`,
        userId: studentId,
        source: 'grading-service'
      };

      await this.eventPublisher.publishGradingCompleted(gradingEventData, metadata);
      
      console.log(`✅ Successfully graded submission ${submissionId} automatically`);
      
    } catch (error) {
      console.error(`❌ Failed to grade submission ${eventMessage.event.data.submissionId}:`, error);
      
      // Publish grading failed event
      try {
        const { submissionId, assessmentId, studentId } = eventMessage.event.data;
        
        const gradingEventData = {
          submissionId,
          assessmentId,
          studentId,
          totalMarks: 0,
          calculatedMarks: 0,
          percentage: 0,
          gradedAt: new Date().toISOString(),
          gradingStatus: 'FAILED' as const,
          errorMessage: error instanceof Error ? error.message : 'Unknown grading error',
          retryable: true,
          questionsGraded: 0,
          totalQuestions: 0
        };

        const metadata = {
          correlationId: eventMessage.metadata.correlationId || `grading-failed-${submissionId}-${Date.now()}`,
          userId: studentId,
          source: 'grading-service'
        };

        await this.eventPublisher.publishGradingFailed(gradingEventData, metadata);
        
      } catch (publishError) {
        console.error('❌ Failed to publish grading failed event:', publishError);
      }
      
      // Re-throw to trigger message retry/dead letter handling
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.rabbitMQ.close();
      console.log('🔌 Grading event subscriber closed');
    } catch (error) {
      console.error('❌ Error closing grading event subscriber:', error);
    }
  }
}

// Singleton instance
let subscriberInstance: GradingEventSubscriber | null = null;

export const getGradingEventSubscriber = (): GradingEventSubscriber => {
  if (!subscriberInstance) {
    subscriberInstance = new GradingEventSubscriber();
  }
  return subscriberInstance;
};

export default GradingEventSubscriber;