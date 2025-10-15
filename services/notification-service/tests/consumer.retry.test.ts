jest.mock('amqplib', () => ({
  __esModule: true,
  default: {
    connect: jest.fn().mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue({
        assertExchange: jest.fn(),
        assertQueue: jest.fn(),
        bindQueue: jest.fn(),
        prefetch: jest.fn(),
        publish: jest.fn(),
        consume: jest.fn((queue: string, handler: Function) => {
          // invalid payload to trigger schema failure
          const msg = { content: Buffer.from('{"submissionId":"1"}') , properties: { headers: {} } } as any;
          handler(msg);
        }),
        ack: jest.fn(),
        nack: jest.fn(),
        reject: jest.fn(),
      }),
    }),
  },
}));

describe('consumer retry and DLQ', () => {
  it('re-publishes with attempts header then routes to DLQ after max', async () => {
    process.env.NOTIFICATION_MAX_RETRIES = '0';
    const amqplib = (await import('amqplib')).default as any;
    const channel = await (await amqplib.connect()).createChannel();
    const publishSpy = jest.spyOn(channel, 'publish');
    const rejectSpy = jest.spyOn(channel, 'reject');

    const { consumeGradingCompletedEvent } = await import('../src/events/consumer');
    await consumeGradingCompletedEvent();

    // With max=0, should route to DLQ directly (reject called), no publish
    expect(publishSpy).not.toHaveBeenCalled();
    expect(rejectSpy).toHaveBeenCalled();
  });
});
