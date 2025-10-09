// Event types for the Submission Service

export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  serviceId: string;
  version: string;
}

export interface EventMetadata {
  correlationId?: string;
  userId?: string;
  traceId?: string;
  source: string;
}

export interface SubmissionEventData {
  submissionId: string;
  assessmentId: string;
  studentId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'GRADING' | 'GRADED' | 'PUBLISHED' | 'ARCHIVED';
  totalMarks?: number;
  submittedAt?: string;
  answers?: any[];
  files?: string[];
}

export interface SubmissionSubmittedEvent {
  event: BaseEvent & {
    eventType: 'submission.submitted';
    data: SubmissionEventData;
  };
  metadata: EventMetadata;
  publishedAt: string;
}

export interface SubmissionUpdatedEvent {
  event: BaseEvent & {
    eventType: 'submission.updated';
    data: SubmissionEventData & {
      previousStatus?: string;
      updatedFields?: string[];
    };
  };
  metadata: EventMetadata;
  publishedAt: string;
}

export interface SubmissionGradedEvent {
  event: BaseEvent & {
    eventType: 'submission.graded';
    data: SubmissionEventData & {
      calculatedMarks: number;
      percentage: number;
      gradedAt: string;
      gradedBy?: string;
    };
  };
  metadata: EventMetadata;
  publishedAt: string;
}

// Union type for all submission events
export type SubmissionEvent = SubmissionSubmittedEvent | SubmissionUpdatedEvent | SubmissionGradedEvent;

// Helper function to create event structure
export const createSubmissionEvent = (
  eventType: string,
  data: SubmissionEventData,
  metadata: Partial<EventMetadata> = {}
): any => {
  const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  return {
    event: {
      eventId,
      eventType,
      timestamp,
      serviceId: 'submission-service',
      version: '1.0.0',
      data
    },
    metadata: {
      correlationId: eventId,
      source: 'submission-service',
      ...metadata
    },
    publishedAt: timestamp
  };
};