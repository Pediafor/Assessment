import amqp from 'amqplib';

class RabbitMQConnection {
  private connection: any = null;
  private channel: any = null;
  private url: string;
  private exchanges: Map<string, boolean> = new Map();
  private queues: Map<string, boolean> = new Map();

  constructor() {
    this.url = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672/';
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      // Handle connection events
      this.connection.on('error', (err: Error) => {
        console.error('RabbitMQ connection error:', err);
        this.reconnect();
      });

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.connection = null;
        this.channel = null;
      });

      // Setup exchanges and queues
      await this.setupInfrastructure();

      console.log('✅ RabbitMQ connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  private async reconnect(): Promise<void> {
    try {
      console.log('🔄 Attempting to reconnect to RabbitMQ...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      await this.connect();
    } catch (error) {
      console.error('❌ Reconnection failed:', error);
    }
  }

  private async setupInfrastructure(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    // Assessment Events Exchange (Topic Exchange for flexibility)
    await this.assertExchange('assessment.events', 'topic');
    
    // Direct exchanges for specific services
    await this.assertExchange('submission.events', 'topic');
    await this.assertExchange('grading.events', 'topic');

    // Dead Letter Exchange for failed messages
    await this.assertExchange('dead.letter', 'direct');

    // Setup queues for different services
    await this.assertQueue('assessment.created', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dead.letter',
        'x-dead-letter-routing-key': 'failed.assessment.created'
      }
    });

    await this.assertQueue('assessment.updated', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dead.letter',
        'x-dead-letter-routing-key': 'failed.assessment.updated'
      }
    });

    await this.assertQueue('assessment.deleted', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dead.letter',
        'x-dead-letter-routing-key': 'failed.assessment.deleted'
      }
    });

    // Bind queues to exchanges
    await this.bindQueue('assessment.created', 'assessment.events', 'assessment.created');
    await this.bindQueue('assessment.updated', 'assessment.events', 'assessment.updated');
    await this.bindQueue('assessment.deleted', 'assessment.events', 'assessment.deleted');

    console.log('🔧 RabbitMQ infrastructure setup completed');
  }

  private async assertExchange(name: string, type: string): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    if (!this.exchanges.has(name)) {
      await this.channel.assertExchange(name, type, { durable: true });
      this.exchanges.set(name, true);
    }
  }

  private async assertQueue(name: string, options: any = {}): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    if (!this.queues.has(name)) {
      await this.channel.assertQueue(name, { durable: true, ...options });
      this.queues.set(name, true);
    }
  }

  private async bindQueue(queueName: string, exchangeName: string, routingKey: string): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    await this.channel.bindQueue(queueName, exchangeName, routingKey);
  }

  async publish(exchange: string, routingKey: string, message: any): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ not connected');
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    return this.channel.publish(exchange, routingKey, messageBuffer, {
      persistent: true, // Make message persistent
      timestamp: Date.now(),
      contentType: 'application/json',
      messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        // For amqplib, connections don't have a close method
        // They close automatically when channels are closed
        this.connection = null;
      }

      console.log('🔐 RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  getChannel(): any {
    return this.channel;
  }
}

// Singleton instance
let rabbitMQInstance: RabbitMQConnection | null = null;

export const getRabbitMQConnection = (): RabbitMQConnection => {
  if (!rabbitMQInstance) {
    rabbitMQInstance = new RabbitMQConnection();
  }
  return rabbitMQInstance;
};

export { RabbitMQConnection };