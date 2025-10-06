// Base event interface
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  serviceId: string;
  version: string;
}

// Assessment Event Types
export interface AssessmentCreatedEvent extends BaseEvent {
  eventType: 'assessment.created';
  data: {
    assessmentId: string;
    title: string;
    description: string;
    type: 'mcq' | 'essay' | 'mixed';
    createdBy: string;
    timeLimit?: number;
    totalMarks: number;
    status: 'draft' | 'published' | 'archived';
    organizationId?: string;
  };
}

export interface AssessmentUpdatedEvent extends BaseEvent {
  eventType: 'assessment.updated';
  data: {
    assessmentId: string;
    title?: string;
    description?: string;
    type?: 'mcq' | 'essay' | 'mixed';
    timeLimit?: number;
    totalMarks?: number;
    status?: 'draft' | 'published' | 'archived';
    updatedBy: string;
    changes: string[]; // Array of field names that were changed
  };
}

export interface AssessmentDeletedEvent extends BaseEvent {
  eventType: 'assessment.deleted';
  data: {
    assessmentId: string;
    title: string;
    deletedBy: string;
    reason?: string;
  };
}

export interface AssessmentPublishedEvent extends BaseEvent {
  eventType: 'assessment.published';
  data: {
    assessmentId: string;
    title: string;
    publishedBy: string;
    totalQuestions: number;
    totalMarks: number;
    timeLimit?: number;
  };
}

export interface AssessmentArchivedEvent extends BaseEvent {
  eventType: 'assessment.archived';
  data: {
    assessmentId: string;
    title: string;
    archivedBy: string;
    reason?: string;
  };
}

// Question Event Types (for future use)
export interface QuestionAddedEvent extends BaseEvent {
  eventType: 'question.added';
  data: {
    assessmentId: string;
    questionId: string;
    questionType: 'mcq' | 'essay' | 'short-answer';
    marks: number;
    addedBy: string;
  };
}

export interface QuestionUpdatedEvent extends BaseEvent {
  eventType: 'question.updated';
  data: {
    assessmentId: string;
    questionId: string;
    marks?: number;
    updatedBy: string;
    changes: string[];
  };
}

export interface QuestionDeletedEvent extends BaseEvent {
  eventType: 'question.deleted';
  data: {
    assessmentId: string;
    questionId: string;
    deletedBy: string;
  };
}

// Union type for all assessment events
export type AssessmentEvent = 
  | AssessmentCreatedEvent
  | AssessmentUpdatedEvent
  | AssessmentDeletedEvent
  | AssessmentPublishedEvent
  | AssessmentArchivedEvent
  | QuestionAddedEvent
  | QuestionUpdatedEvent
  | QuestionDeletedEvent;

// Event metadata for message headers
export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
}

// Message envelope for RabbitMQ
export interface MessageEnvelope<T extends BaseEvent> {
  event: T;
  metadata: EventMetadata;
  publishedAt: Date;
  retryCount?: number;
}

// Event routing keys for RabbitMQ
export const ROUTING_KEYS = {
  ASSESSMENT_CREATED: 'assessment.created',
  ASSESSMENT_UPDATED: 'assessment.updated',
  ASSESSMENT_DELETED: 'assessment.deleted',
  ASSESSMENT_PUBLISHED: 'assessment.published',
  ASSESSMENT_ARCHIVED: 'assessment.archived',
  QUESTION_ADDED: 'question.added',
  QUESTION_UPDATED: 'question.updated',
  QUESTION_DELETED: 'question.deleted',
} as const;

// Exchange names
export const EXCHANGES = {
  ASSESSMENT_EVENTS: 'assessment.events',
  SUBMISSION_EVENTS: 'submission.events',
  GRADING_EVENTS: 'grading.events',
  DEAD_LETTER: 'dead.letter',
} as const;

// Queue names
export const QUEUES = {
  ASSESSMENT_CREATED: 'assessment.created',
  ASSESSMENT_UPDATED: 'assessment.updated',
  ASSESSMENT_DELETED: 'assessment.deleted',
  ASSESSMENT_PUBLISHED: 'assessment.published',
  ASSESSMENT_ARCHIVED: 'assessment.archived',
  QUESTION_ADDED: 'question.added',
  QUESTION_UPDATED: 'question.updated',
  QUESTION_DELETED: 'question.deleted',
} as const;