// Event types for the Grading Service

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

export interface GradingEventData {
  submissionId: string;
  assessmentId: string;
  studentId: string;
  totalMarks: number;
  calculatedMarks: number;
  percentage: number;
  gradedAt: string;
  gradingStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  errorMessage?: string;
  questionsGraded?: number;
  totalQuestions?: number;
}

export interface GradingCompletedEvent {
  event: BaseEvent & {
    eventType: 'grading.completed';
    data: GradingEventData;
  };
  metadata: EventMetadata;
  publishedAt: string;
}

export interface GradingFailedEvent {
  event: BaseEvent & {
    eventType: 'grading.failed';
    data: GradingEventData & {
      errorMessage: string;
      retryable: boolean;
    };
  };
  metadata: EventMetadata;
  publishedAt: string;
}

// Incoming event types from Submission Service
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

// Union type for all grading events
export type GradingEvent = GradingCompletedEvent | GradingFailedEvent;

// Helper function to create event structure
export const createGradingEvent = (
  eventType: string,
  data: GradingEventData,
  metadata: Partial<EventMetadata> = {}
): any => {
  const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  return {
    event: {
      eventId,
      eventType,
      timestamp,
      serviceId: 'grading-service',
      version: '1.0.0',
      data
    },
    metadata: {
      correlationId: eventId,
      source: 'grading-service',
      ...metadata
    },
    publishedAt: timestamp
  };
};