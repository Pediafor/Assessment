import { getRabbitMQConnection } from '../config/rabbitmq';
import { createSubmissionEvent, SubmissionEventData, EventMetadata } from './types';

class SubmissionEventPublisher {
  private rabbitMQ = getRabbitMQConnection();

  async publishSubmissionSubmitted(
    submissionData: SubmissionEventData,
    metadata?: Partial<EventMetadata>
  ): Promise<void> {
    try {
      const event = createSubmissionEvent('submission.submitted', submissionData, metadata);
      
      await this.rabbitMQ.publish('submission.events', 'submission.submitted', event);
      
      console.log(`📤 Published submission.submitted event for submission ${submissionData.submissionId}`);
    } catch (error) {
      console.error('❌ Failed to publish submission.submitted event:', error);
      throw error;
    }
  }

  async publishSubmissionUpdated(
    submissionData: SubmissionEventData & { previousStatus?: string; updatedFields?: string[] },
    metadata?: Partial<EventMetadata>
  ): Promise<void> {
    try {
      const event = createSubmissionEvent('submission.updated', submissionData, metadata);
      
      await this.rabbitMQ.publish('submission.events', 'submission.updated', event);
      
      console.log(`📤 Published submission.updated event for submission ${submissionData.submissionId}`);
    } catch (error) {
      console.error('❌ Failed to publish submission.updated event:', error);
      throw error;
    }
  }

  async publishSubmissionGraded(
    submissionData: SubmissionEventData & {
      calculatedMarks: number;
      percentage: number;
      gradedAt: string;
      gradedBy?: string;
    },
    metadata?: Partial<EventMetadata>
  ): Promise<void> {
    try {
      const event = createSubmissionEvent('submission.graded', submissionData, metadata);
      
      await this.rabbitMQ.publish('submission.events', 'submission.graded', event);
      
      console.log(`📤 Published submission.graded event for submission ${submissionData.submissionId}`);
    } catch (error) {
      console.error('❌ Failed to publish submission.graded event:', error);
      throw error;
    }
  }

  async ensureConnection(): Promise<void> {
    if (!this.rabbitMQ.isConnected()) {
      await this.rabbitMQ.connect();
    }
  }
}

// Singleton instance
let publisherInstance: SubmissionEventPublisher | null = null;

export const getSubmissionEventPublisher = (): SubmissionEventPublisher => {
  if (!publisherInstance) {
    publisherInstance = new SubmissionEventPublisher();
  }
  return publisherInstance;
};

export default SubmissionEventPublisher;