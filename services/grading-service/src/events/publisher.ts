import { getRabbitMQConnection } from '../config/rabbitmq';
import { createGradingEvent, GradingEventData, EventMetadata } from './types';

class GradingEventPublisher {
  private rabbitMQ = getRabbitMQConnection();

  async publishGradingCompleted(
    gradingData: GradingEventData,
    metadata?: Partial<EventMetadata>
  ): Promise<void> {
    try {
      const event = createGradingEvent('grading.completed', gradingData, metadata);
      
      await this.rabbitMQ.publish('grading.events', 'grading.completed', event);
      
      console.log(`📤 Published grading.completed event for submission ${gradingData.submissionId}`);
    } catch (error) {
      console.error('❌ Failed to publish grading.completed event:', error);
      throw error;
    }
  }

  async publishGradingFailed(
    gradingData: GradingEventData & { errorMessage: string; retryable: boolean },
    metadata?: Partial<EventMetadata>
  ): Promise<void> {
    try {
      const event = createGradingEvent('grading.failed', gradingData, metadata);
      
      await this.rabbitMQ.publish('grading.events', 'grading.failed', event);
      
      console.log(`📤 Published grading.failed event for submission ${gradingData.submissionId}`);
    } catch (error) {
      console.error('❌ Failed to publish grading.failed event:', error);
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
let publisherInstance: GradingEventPublisher | null = null;

export const getGradingEventPublisher = (): GradingEventPublisher => {
  if (!publisherInstance) {
    publisherInstance = new GradingEventPublisher();
  }
  return publisherInstance;
};

export default GradingEventPublisher;