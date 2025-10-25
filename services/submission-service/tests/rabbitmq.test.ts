import amqp from 'amqplib';
import { getRabbitMQConnection, setRabbitMQMock, resetRabbitMQConnection } from '../src/config/rabbitmq';
import { getSubmissionEventPublisher, resetSubmissionEventPublisher } from '../src/events/publisher';
import { createSubmissionEvent } from '../src/events/types';

let connectSpy: jest.SpyInstance;

describe('RabbitMQ Configuration', () => {
  let mockChannel: any;
  let mockConnection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    setRabbitMQMock(false);
    resetRabbitMQConnection();
    resetSubmissionEventPublisher();

    mockChannel = {
      assertExchange: jest.fn(),
      assertQueue: jest.fn(),
      bindQueue: jest.fn(),
      publish: jest.fn().mockReturnValue(true),
      consume: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn()
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      on: jest.fn(),
      close: jest.fn()
    };

    // Mock amqplib connect
    connectSpy = jest.spyOn(amqp, 'connect').mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    resetRabbitMQConnection();
    setRabbitMQMock(true);
    if (connectSpy) {
      connectSpy.mockRestore();
    }
  });

  describe('RabbitMQ Connection', () => {
    it('should establish connection and setup infrastructure', async () => {
      const rabbitMQ = getRabbitMQConnection();
      
      await rabbitMQ.connect();

      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'submission.events',
        'topic',
        { durable: true }
      );
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        'submission.submitted',
        expect.objectContaining({
          durable: true,
          arguments: {
            'x-dead-letter-exchange': 'dead.letter',
            'x-dead-letter-routing-key': 'failed.submission.submitted'
          }
        })
      );
    });

    it('should handle connection errors gracefully', async () => {
      const amqp = require('amqplib');
      amqp.connect.mockRejectedValue(new Error('Connection failed'));

      const rabbitMQ = getRabbitMQConnection();
      
      await expect(rabbitMQ.connect()).rejects.toThrow('Connection failed');
    });

    it('should setup event listeners for connection management', async () => {
      const rabbitMQ = getRabbitMQConnection();
      
      await rabbitMQ.connect();

      expect(mockConnection.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockConnection.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('should report connection status correctly', async () => {
      const rabbitMQ = getRabbitMQConnection();
      
      expect(rabbitMQ.isConnected()).toBe(false);
      
      await rabbitMQ.connect();
      
      expect(rabbitMQ.isConnected()).toBe(true);
    });

    it('should close connection properly', async () => {
      const rabbitMQ = getRabbitMQConnection();
      await rabbitMQ.connect();
      
      await rabbitMQ.close();
      
      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });

  describe('Message Publishing', () => {
    it('should publish messages with correct format', async () => {
      const rabbitMQ = getRabbitMQConnection();
      await rabbitMQ.connect();

      const testMessage = { test: 'data', timestamp: new Date().toISOString() };
      
      const result = await rabbitMQ.publish(
        'submission.events',
        'submission.submitted',
        testMessage
      );

      expect(result).toBe(true);
      expect(mockChannel.publish).toHaveBeenCalledWith(
        'submission.events',
        'submission.submitted',
        expect.any(Buffer),
        expect.objectContaining({
          persistent: true,
          timestamp: expect.any(Number),
          messageId: expect.any(String)
        })
      );

      // Verify message content
      const publishCall = mockChannel.publish.mock.calls[0];
      const messageBuffer = publishCall[2];
      const messageContent = JSON.parse(messageBuffer.toString());
      expect(messageContent).toEqual(testMessage);
    });

    it('should handle publishing errors', async () => {
      const rabbitMQ = getRabbitMQConnection();
      await rabbitMQ.connect();

      mockChannel.publish.mockImplementation(() => {
        throw new Error('Publishing failed');
      });

      await expect(
        rabbitMQ.publish('submission.events', 'submission.submitted', {})
      ).rejects.toThrow('Publishing failed');
    });

    it('should throw error when not connected', async () => {
      const rabbitMQ = getRabbitMQConnection();
      
      await expect(
        rabbitMQ.publish('submission.events', 'submission.submitted', {})
      ).rejects.toThrow('RabbitMQ not connected');
    });
  });

  describe('Message Subscription', () => {
    it('should setup message consumer correctly', async () => {
      const rabbitMQ = getRabbitMQConnection();
      await rabbitMQ.connect();

      const mockCallback = jest.fn().mockResolvedValue(undefined);
      
      await rabbitMQ.subscribe('test.queue', mockCallback);

      expect(mockChannel.consume).toHaveBeenCalledWith(
        'test.queue',
        expect.any(Function)
      );
    });

    it('should process messages and acknowledge them', async () => {
      const rabbitMQ = getRabbitMQConnection();
      await rabbitMQ.connect();

      const mockCallback = jest.fn().mockResolvedValue(undefined);
      const testMessage = { test: 'data' };
      const mockMsg = {
        content: Buffer.from(JSON.stringify(testMessage))
      };

      await rabbitMQ.subscribe('test.queue', mockCallback);

      // Simulate message consumption
      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      await consumeCallback(mockMsg);

      expect(mockCallback).toHaveBeenCalledWith(testMessage);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
    });

    it('should handle message processing errors', async () => {
      const rabbitMQ = getRabbitMQConnection();
      await rabbitMQ.connect();

      const mockCallback = jest.fn().mockRejectedValue(new Error('Processing failed'));
      const mockMsg = {
        content: Buffer.from(JSON.stringify({ test: 'data' }))
      };

      await rabbitMQ.subscribe('test.queue', mockCallback);

      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      await consumeCallback(mockMsg);

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg, false, false);
    });
  });
});

describe('Submission Event Publisher', () => {
  let mockRabbitMQ: any;
  let eventPublisher: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRabbitMQ = {
      isConnected: jest.fn().mockReturnValue(true),
      connect: jest.fn(),
      publish: jest.fn().mockResolvedValue(true)
    };

    resetRabbitMQConnection();
    setRabbitMQMock(mockRabbitMQ);
    resetSubmissionEventPublisher();
    eventPublisher = getSubmissionEventPublisher();
  });

  afterEach(() => {
    setRabbitMQMock(true);
    resetRabbitMQConnection();
    resetSubmissionEventPublisher();
  });

  describe('Event Publishing Methods', () => {
    it('should publish submission.submitted event with correct structure', async () => {
      const submissionData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const,
        submittedAt: new Date().toISOString(),
        answers: [{ questionId: 'q1', answer: 'answer1' }]
      };

      const metadata = {
        userId: 'student-789',
        correlationId: 'test-correlation-123'
      };

      await eventPublisher.publishSubmissionSubmitted(submissionData, metadata);

      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'submission.events',
        'submission.submitted',
        expect.objectContaining({
          event: expect.objectContaining({
            eventType: 'submission.submitted',
            serviceId: 'submission-service',
            data: submissionData
          }),
          metadata: expect.objectContaining(metadata),
          publishedAt: expect.any(String)
        })
      );
    });

    it('should publish submission.updated event with previous status', async () => {
      const submissionData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'DRAFT' as const,
        previousStatus: 'DRAFT',
        updatedFields: ['answers']
      };

      await eventPublisher.publishSubmissionUpdated(submissionData);

      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'submission.events',
        'submission.updated',
        expect.objectContaining({
          event: expect.objectContaining({
            eventType: 'submission.updated',
            data: expect.objectContaining(submissionData)
          })
        })
      );
    });

    it('should ensure connection before publishing', async () => {
      mockRabbitMQ.isConnected.mockReturnValue(false);

      const submissionData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      };

      await eventPublisher.ensureConnection();

      expect(mockRabbitMQ.connect).toHaveBeenCalled();
    });

    it('should handle publishing errors', async () => {
      mockRabbitMQ.publish.mockRejectedValue(new Error('Publishing failed'));

      const submissionData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      };

      await expect(
        eventPublisher.publishSubmissionSubmitted(submissionData)
      ).rejects.toThrow('Publishing failed');
    });
  });
});

describe('Event Types and Helpers', () => {
  describe('createSubmissionEvent', () => {
    it('should create properly structured events', () => {
      const eventData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      };

      const metadata = {
        userId: 'student-789'
      };

      const event = createSubmissionEvent('submission.submitted', eventData, metadata);

      expect(event).toMatchObject({
        event: {
          eventId: expect.any(String),
          eventType: 'submission.submitted',
          timestamp: expect.any(String),
          serviceId: 'submission-service',
          version: '1.0.0',
          data: eventData
        },
        metadata: {
          correlationId: expect.any(String),
          source: 'submission-service',
          ...metadata
        },
        publishedAt: expect.any(String)
      });
    });

    it('should generate unique event IDs', () => {
      const eventData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456', 
        studentId: 'student-789',
        status: 'SUBMITTED' as const
      };

      const event1 = createSubmissionEvent('submission.submitted', eventData);
      const event2 = createSubmissionEvent('submission.submitted', eventData);

      expect(event1.event.eventId).not.toBe(event2.event.eventId);
    });

    it('should use provided correlation ID or generate one', () => {
      const eventData = {
        submissionId: 'sub-123',
        assessmentId: 'assess-456',
        studentId: 'student-789', 
        status: 'SUBMITTED' as const
      };

      const customCorrelationId = 'custom-correlation-123';
      const eventWithCustomId = createSubmissionEvent(
        'submission.submitted',
        eventData,
        { correlationId: customCorrelationId }
      );

      expect(eventWithCustomId.metadata.correlationId).toBe(customCorrelationId);

      const eventWithGeneratedId = createSubmissionEvent('submission.submitted', eventData);
      expect(eventWithGeneratedId.metadata.correlationId).toBeDefined();
      expect(eventWithGeneratedId.metadata.correlationId).not.toBe(customCorrelationId);
    });
  });
});