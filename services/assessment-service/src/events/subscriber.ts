import { getRabbitMQConnection } from '../config/rabbitmq';
import { getAssessmentEventPublisher } from './publisher';
import { 
  SubmissionSubmittedEvent, 
  SubmissionGradedEvent,
  GradingCompletedEvent,
  UserRegisteredEvent 
} from './types';
import { AssessmentService } from '../services/assessment.service';

class AssessmentEventSubscriber {
  private rabbitMQ = getRabbitMQConnection();
  private assessmentService = new AssessmentService();
  private eventPublisher = getAssessmentEventPublisher();

  async initialize(): Promise<void> {
    try {
      // Ensure RabbitMQ connection
      if (!this.rabbitMQ.isConnected()) {
        await this.rabbitMQ.connect();
      }

      // Subscribe to submission events
      await this.rabbitMQ.subscribe(
        'submission.events', 
        'submission.submitted',
        this.handleSubmissionSubmitted.bind(this)
      );
      
      await this.rabbitMQ.subscribe(
        'submission.events', 
        'submission.graded',
        this.handleSubmissionGraded.bind(this)
      );

      // Subscribe to grading completed events
      await this.rabbitMQ.subscribe(
        'grading.events', 
        'grading.completed',
        this.handleGradingCompleted.bind(this)
      );

      // Subscribe to user events for analytics
      await this.rabbitMQ.subscribe(
        'user.events', 
        'user.registered',
        this.handleUserRegistered.bind(this)
      );
      
      console.log('🎧 Assessment event subscriber initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize assessment event subscriber:', error);
      throw error;
    }
  }

  /**
   * Handle submission submitted events
   * Updates assessment statistics and tracks submission counts
   */
  private async handleSubmissionSubmitted(eventMessage: SubmissionSubmittedEvent): Promise<void> {
    console.log(`📝 Processing submission.submitted event for assessment ${eventMessage.event.data.assessmentId}`);
    
    try {
      const { submissionId, assessmentId, studentId, status } = eventMessage.event.data;

      // Update assessment submission statistics
      await this.assessmentService.updateAssessmentStats(assessmentId, {
        totalSubmissions: 1, // This would be incremented properly
        lastSubmissionAt: new Date()
      });

      // Check if this assessment should be automatically processed
      const assessment = await this.assessmentService.getAssessmentByIdInternal(assessmentId);
      
      if (assessment && assessment.settings && (assessment.settings as any).autoGrade && status === 'SUBMITTED') {
        console.log(`⚡ Auto-grading enabled for assessment ${assessmentId}, submission ${submissionId}`);
        // The grading service will handle this via its own event subscription
      }

      console.log(`✅ Successfully processed submission.submitted event for assessment ${assessmentId}`);
    } catch (error) {
      console.error(`❌ Failed to process submission.submitted event:`, error);
      // Don't throw - allow other events to continue processing
    }
  }

  /**
   * Handle submission graded events
   * Updates assessment completion statistics and analytics
   */
  private async handleSubmissionGraded(eventMessage: SubmissionGradedEvent): Promise<void> {
    console.log(`📊 Processing submission.graded event for assessment ${eventMessage.event.data.assessmentId}`);
    
    try {
      const { submissionId, assessmentId, studentId, score, totalMarks } = eventMessage.event.data;

      // Update assessment grading statistics
      await this.assessmentService.updateAssessmentStats(assessmentId, {
        completedSubmissions: 1,
        averageScore: score || 0,
        lastSubmissionAt: new Date()
      });

      // Calculate and update assessment analytics
      const analytics = await this.assessmentService.calculateAssessmentAnalytics(assessmentId);
      
      console.log(`📈 Updated analytics for assessment ${assessmentId}:`, {
        averageScore: analytics.averageScore,
        completionRate: analytics.completionRate,
        totalSubmissions: analytics.totalSubmissions
      });

      console.log(`✅ Successfully processed submission.graded event for assessment ${assessmentId}`);
    } catch (error) {
      console.error(`❌ Failed to process submission.graded event:`, error);
    }
  }

  /**
   * Handle grading completed events
   * Finalizes assessment grading process and triggers notifications
   */
  private async handleGradingCompleted(eventMessage: GradingCompletedEvent): Promise<void> {
    console.log(`🏁 Processing grading.completed event for assessment ${eventMessage.event.data.assessmentId}`);
    
    try {
      const { submissionId, assessmentId, gradingId, finalScore, feedback } = eventMessage.event.data;

      // Mark assessment as having completed grading for this submission
      await this.assessmentService.markSubmissionGradingComplete(assessmentId, submissionId, {
        score: finalScore,
        feedback,
        gradedAt: new Date()
      });

      // Check if all submissions for this assessment are graded
      const allSubmissionsGraded = await this.assessmentService.checkAllSubmissionsGraded(assessmentId);
      
      if (allSubmissionsGraded) {
        // Publish assessment fully graded event
        await this.eventPublisher.publishAssessmentFullyGraded({
          assessmentId,
          totalSubmissions: 0, // This would come from the service response
          gradedAt: new Date().toISOString(),
          analytics: {
            averageScore: 0,
            completionRate: 0,
            totalSubmissions: 0,
            highestScore: 0,
            lowestScore: 0
          }
        });
        
        console.log(`🎯 Assessment ${assessmentId} is now fully graded - published assessment.fully_graded event`);
      }

      console.log(`✅ Successfully processed grading.completed event for assessment ${assessmentId}`);
    } catch (error) {
      console.error(`❌ Failed to process grading.completed event:`, error);
    }
  }

  /**
   * Handle user registered events
   * Updates assessment enrollment statistics
   */
  private async handleUserRegistered(eventMessage: UserRegisteredEvent): Promise<void> {
    console.log(`👤 Processing user.registered event for user ${eventMessage.event.data.userId}`);
    
    try {
      const { userId, role, organizationId } = eventMessage.event.data;

      if (role === 'STUDENT' && organizationId) {
        // Update organization-based assessment enrollment statistics
        await this.assessmentService.updateOrganizationStats(organizationId, {
          totalUsers: 1, // This would be incremented
          activeUsers: 1,
          lastActivityAt: new Date()
        });
        
        console.log(`📊 Updated organization stats for new student: ${userId}`);
      }

      console.log(`✅ Successfully processed user.registered event for user ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to process user.registered event:`, error);
    }
  }

  /**
   * Gracefully shutdown the event subscriber
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down assessment event subscriber...');
      // Add cleanup logic here if needed
      console.log('✅ Assessment event subscriber shutdown complete');
    } catch (error) {
      console.error('❌ Error during assessment event subscriber shutdown:', error);
    }
  }
}

// Singleton instance
let assessmentEventSubscriber: AssessmentEventSubscriber | null = null;

export function getAssessmentEventSubscriber(): AssessmentEventSubscriber {
  if (!assessmentEventSubscriber) {
    assessmentEventSubscriber = new AssessmentEventSubscriber();
  }
  return assessmentEventSubscriber;
}

export { AssessmentEventSubscriber };