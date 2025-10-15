import * as emailSvc from '../src/services/email.service';
import * as userSvc from '../src/services/user.service';

jest.mock('amqplib', () => ({
  __esModule: true,
  default: {
    connect: jest.fn().mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue({
        assertExchange: jest.fn(),
        assertQueue: jest.fn(),
        bindQueue: jest.fn(),
        prefetch: jest.fn(),
        consume: jest.fn((queue: string, handler: Function) => {
          // simulate one message
          const event = {
            submissionId: 'sub1',
            assessmentId: 'ass1',
            studentId: 'stu1',
            calculatedMarks: 85,
            totalMarks: 100,
            percentage: 85,
          };
          const msg = { content: Buffer.from(JSON.stringify(event)) } as any;
          handler(msg);
        }),
        ack: jest.fn(),
        nack: jest.fn(),
      }),
    }),
  },
}));

describe('consumer', () => {
  it('processes grading.completed and sends email', async () => {
    jest.spyOn(userSvc, 'getUserById').mockResolvedValue({ id: 'stu1', email: 's@example.com' });
    const sendSpy = jest.spyOn(emailSvc, 'sendEmail').mockResolvedValue({} as any);
    const { consumeGradingCompletedEvent } = await import('../src/events/consumer');
    await consumeGradingCompletedEvent();
    expect(sendSpy).toHaveBeenCalled();
  });
});
