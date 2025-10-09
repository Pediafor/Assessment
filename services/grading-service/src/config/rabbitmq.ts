import amqp from 'amqplib';

class RabbitMQConnection {
  private connection: any = null;
  private channel: any = null;
  private url: string;
  private exchanges: Map<string, boolean> = new Map();
  private queues: Map<string, boolean> = new Map();

  constructor() {
    this.url = process.env.RABBITMQ_URL || 'amqp://admin:pediafor2024@localhost:5672/pediafor';
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

    // Subscribe to submission events
    await this.assertExchange('submission.events', 'topic');
    
    // Grading Events Exchange (for publishing grading results)
    await this.assertExchange('grading.events', 'topic');
    
    // Dead Letter Exchange for failed messages
    await this.assertExchange('dead.letter', 'direct');

    // Setup queue for incoming submission events
    await this.assertQueue('grading.submission.submitted', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dead.letter',
        'x-dead-letter-routing-key': 'failed.grading.submission.submitted'
      }
    });

    // Setup queues for outgoing grading events
    await this.assertQueue('grading.completed', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dead.letter',
        'x-dead-letter-routing-key': 'failed.grading.completed'
      }
    });

    await this.assertQueue('grading.failed', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dead.letter',
        'x-dead-letter-routing-key': 'failed.grading.failed'
      }
    });

    // Bind queues to exchanges
    await this.bindQueue('grading.submission.submitted', 'submission.events', 'submission.submitted');
    await this.bindQueue('grading.completed', 'grading.events', 'grading.completed');
    await this.bindQueue('grading.failed', 'grading.events', 'grading.failed');

    console.log('🔧 RabbitMQ infrastructure setup completed');
  }

  private async assertExchange(name: string, type: string): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    if (!this.exchanges.has(name)) {
      await this.channel.assertExchange(name, type, { durable: true });
      this.exchanges.set(name, true);
      console.log(`📡 Exchange '${name}' (${type}) created/verified`);
    }
  }

  private async assertQueue(name: string, options?: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    if (!this.queues.has(name)) {
      await this.channel.assertQueue(name, { durable: true, ...options });
      this.queues.set(name, true);
      console.log(`📥 Queue '${name}' created/verified`);
    }
  }

  private async bindQueue(queueName: string, exchangeName: string, routingKey: string): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    await this.channel.bindQueue(queueName, exchangeName, routingKey);
    console.log(`🔗 Queue '${queueName}' bound to exchange '${exchangeName}' with routing key '${routingKey}'`);
  }

  async publish(exchange: string, routingKey: string, message: any): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ not connected');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      const result = this.channel.publish(exchange, routingKey, messageBuffer, {
        persistent: true,
        timestamp: Date.now(),
        messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });

      console.log(`📤 Published message to exchange '${exchange}' with routing key '${routingKey}'`);
      return result;
    } catch (error) {
      console.error('❌ Failed to publish message:', error);
      throw error;
    }
  }

  async subscribe(queueName: string, callback: (message: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ not connected');
    }

    try {
      await this.channel.consume(queueName, async (msg: any) => {
        if (msg !== null) {
          try {
            const messageContent = JSON.parse(msg.content.toString());
            console.log(`📨 Received message from queue '${queueName}'`);
            
            await callback(messageContent);
            
            // Acknowledge the message
            this.channel.ack(msg);
            console.log(`✅ Message processed successfully from queue '${queueName}'`);
          } catch (error) {
            console.error(`❌ Error processing message from queue '${queueName}':`, error);
            // Reject and requeue the message (it will go to dead letter if configured)
            this.channel.nack(msg, false, false);
          }
        }
      });

      console.log(`👂 Subscribed to queue '${queueName}'`);
    } catch (error) {
      console.error(`❌ Failed to subscribe to queue '${queueName}':`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('🔌 RabbitMQ connection closed');
    } catch (error) {
      console.error('❌ Error closing RabbitMQ connection:', error);
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
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

export default RabbitMQConnection;