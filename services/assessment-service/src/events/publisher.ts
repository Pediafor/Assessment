import { v4 as uuidv4 } from 'uuid';
import { getRabbitMQConnection } from '../config/rabbitmq';
import {
  AssessmentEvent,
  BaseEvent,
  EventMetadata,
  MessageEnvelope,
  EXCHANGES,
  ROUTING_KEYS,
  AssessmentCreatedEvent,
  AssessmentUpdatedEvent,
  AssessmentDeletedEvent,
  AssessmentPublishedEvent,
  AssessmentArchivedEvent
} from './types';

class EventPublisher {
  private rabbitMQ = getRabbitMQConnection();

  /**
   * Publish an assessment created event
   */
  async publishAssessmentCreated(data: {
    assessmentId: string;
    title: string;
    description: string;
    type: 'mcq' | 'essay' | 'mixed';
    createdBy: string;
    timeLimit?: number;
    totalMarks: number;
    status: 'draft' | 'published' | 'archived';
    organizationId?: string;
  }, metadata: EventMetadata = {}): Promise<void> {
    const event: AssessmentCreatedEvent = {
      eventId: uuidv4(),
      eventType: 'assessment.created',
      timestamp: new Date(),
      serviceId: 'assessment-service',
      version: '1.0.0',
      data
    };

    await this.publishEvent(event, ROUTING_KEYS.ASSESSMENT_CREATED, metadata);
  }

  /**
   * Publish an assessment updated event
   */
  async publishAssessmentUpdated(data: {
    assessmentId: string;
    title?: string;
    description?: string;
    type?: 'mcq' | 'essay' | 'mixed';
    timeLimit?: number;
    totalMarks?: number;
    status?: 'draft' | 'published' | 'archived';
    updatedBy: string;
    changes: string[];
  }, metadata: EventMetadata = {}): Promise<void> {
    const event: AssessmentUpdatedEvent = {
      eventId: uuidv4(),
      eventType: 'assessment.updated',
      timestamp: new Date(),
      serviceId: 'assessment-service',
      version: '1.0.0',
      data
    };

    await this.publishEvent(event, ROUTING_KEYS.ASSESSMENT_UPDATED, metadata);
  }

  /**
   * Publish an assessment deleted event
   */
  async publishAssessmentDeleted(data: {
    assessmentId: string;
    title: string;
    deletedBy: string;
    reason?: string;
  }, metadata: EventMetadata = {}): Promise<void> {
    const event: AssessmentDeletedEvent = {
      eventId: uuidv4(),
      eventType: 'assessment.deleted',
      timestamp: new Date(),
      serviceId: 'assessment-service',
      version: '1.0.0',
      data
    };

    await this.publishEvent(event, ROUTING_KEYS.ASSESSMENT_DELETED, metadata);
  }

  /**
   * Publish an assessment published event
   */
  async publishAssessmentPublished(data: {
    assessmentId: string;
    title: string;
    publishedBy: string;
    totalQuestions: number;
    totalMarks: number;
    timeLimit?: number;
  }, metadata: EventMetadata = {}): Promise<void> {
    const event: AssessmentPublishedEvent = {
      eventId: uuidv4(),
      eventType: 'assessment.published',
      timestamp: new Date(),
      serviceId: 'assessment-service',
      version: '1.0.0',
      data
    };

    await this.publishEvent(event, ROUTING_KEYS.ASSESSMENT_PUBLISHED, metadata);
  }

  /**
   * Publish an assessment archived event
   */
  async publishAssessmentArchived(data: {
    assessmentId: string;
    title: string;
    archivedBy: string;
    reason?: string;
  }, metadata: EventMetadata = {}): Promise<void> {
    const event: AssessmentArchivedEvent = {
      eventId: uuidv4(),
      eventType: 'assessment.archived',
      timestamp: new Date(),
      serviceId: 'assessment-service',
      version: '1.0.0',
      data
    };

    await this.publishEvent(event, ROUTING_KEYS.ASSESSMENT_ARCHIVED, metadata);
  }

  /**
   * Generic method to publish any assessment event
   */
  private async publishEvent<T extends BaseEvent>(
    event: T,
    routingKey: string,
    metadata: EventMetadata
  ): Promise<void> {
    try {
      if (!this.rabbitMQ.isConnected()) {
        throw new Error('RabbitMQ is not connected');
      }

      const envelope: MessageEnvelope<T> = {
        event,
        metadata: {
          correlationId: metadata.correlationId || uuidv4(),
          causationId: metadata.causationId,
          userId: metadata.userId,
          sessionId: metadata.sessionId,
          requestId: metadata.requestId,
          traceId: metadata.traceId || uuidv4(),
        },
        publishedAt: new Date(),
        retryCount: 0
      };

      const success = await this.rabbitMQ.publish(
        EXCHANGES.ASSESSMENT_EVENTS,
        routingKey,
        envelope
      );

      if (!success) {
        throw new Error(`Failed to publish event: ${event.eventType}`);
      }

      console.log(`📤 Published event: ${event.eventType} with ID: ${event.eventId}`);
    } catch (error) {
      console.error(`❌ Failed to publish event: ${event.eventType}`, error);
      
      // In a production environment, you might want to:
      // 1. Store failed events in a database for retry
      // 2. Send to a dead letter queue
      // 3. Alert monitoring systems
      
      throw error;
    }
  }

  /**
   * Health check method to verify RabbitMQ connection
   */
  isHealthy(): boolean {
    return this.rabbitMQ.isConnected();
  }
}

// Singleton instance
let eventPublisherInstance: EventPublisher | null = null;

export const getEventPublisher = (): EventPublisher => {
  if (!eventPublisherInstance) {
    eventPublisherInstance = new EventPublisher();
  }
  return eventPublisherInstance;
};

export { EventPublisher };