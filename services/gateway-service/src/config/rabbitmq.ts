import * as amqp from 'amqplib';

export interface EventHandler {
  (eventData: unknown): void | Promise<void>;
}

export interface RabbitMQConfig {
  url: string;
  exchange: string;
  exchangeType: 'topic' | 'direct' | 'fanout' | 'headers';
  durable: boolean;
  autoDelete: boolean;
}

export class EventSubscriber {
  private connection: any = null;
  private channel: any = null;
  private config: RabbitMQConfig;
  private subscriptions = new Map<string, EventHandler[]>();

  constructor(config?: Partial<RabbitMQConfig>) {
    this.config = {
      url: process.env.RABBITMQ_URL || 'amqp://admin:pediafor2024@localhost:5672/pediafor',
      exchange: process.env.RABBITMQ_EXCHANGE || 'assessment_events',
      exchangeType: 'topic',
      durable: true,
      autoDelete: false,
      ...config
    };
  }

  async connect(): Promise<void> {
    try {
      console.log('🔌 Connecting to RabbitMQ...');
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange(
        this.config.exchange,
        this.config.exchangeType,
        {
          durable: this.config.durable,
          autoDelete: this.config.autoDelete
        }
      );

      console.log(`✅ Connected to RabbitMQ exchange: ${this.config.exchange}`);

      // Handle connection errors
      this.connection.on('error', (error: Error) => {
        console.error('❌ RabbitMQ connection error:', error);
      });

      this.connection.on('close', () => {
        console.warn('⚠️ RabbitMQ connection closed');
      });

    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }

    try {
      // Create a queue for this event type
      const queueName = `realtime_${eventType}_${Date.now()}`;
      const queue = await this.channel.assertQueue(queueName, {
        exclusive: true,
        autoDelete: true
      });

      // Bind queue to exchange with routing key
      await this.channel.bindQueue(queue.queue, this.config.exchange, eventType);

      // Start consuming messages
      await this.channel.consume(queue.queue, async (message: any) => {
        if (message) {
          try {
            const eventData = JSON.parse(message.content.toString());
            await handler(eventData);
            this.channel?.ack(message);
          } catch (error) {
            console.error(`❌ Error processing event ${eventType}:`, error);
            this.channel?.nack(message, false, false); // Don't requeue
          }
        }
      });

      // Store subscription
      if (!this.subscriptions.has(eventType)) {
        this.subscriptions.set(eventType, []);
      }
      this.subscriptions.get(eventType)?.push(handler);

      console.log(`📡 Subscribed to event type: ${eventType}`);

    } catch (error) {
      console.error(`❌ Failed to subscribe to event ${eventType}:`, error);
      throw error;
    }
  }

  async publish(eventType: string, eventData: unknown): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }

    try {
      const message = {
        type: eventType,
        data: eventData,
        timestamp: new Date().toISOString(),
        id: `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const published = this.channel.publish(
        this.config.exchange,
        eventType,
        messageBuffer,
        {
          persistent: true,
          messageId: message.id,
          timestamp: Date.now()
        }
      );

      if (!published) {
        throw new Error('Failed to publish message to RabbitMQ');
      }

      console.log(`📤 Published event: ${eventType}`);

    } catch (error) {
      console.error(`❌ Failed to publish event ${eventType}:`, error);
      throw error;
    }
  }

  async unsubscribe(eventType: string, handler?: EventHandler): Promise<void> {
    const handlers = this.subscriptions.get(eventType);
    
    if (!handlers) {
      console.warn(`⚠️ No subscriptions found for event type: ${eventType}`);
      return;
    }

    if (handler) {
      // Remove specific handler
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.subscriptions.delete(eventType);
        }
      }
    } else {
      // Remove all handlers for this event type
      this.subscriptions.delete(eventType);
    }

    console.log(`📡 Unsubscribed from event type: ${eventType}`);
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.subscriptions.clear();
      console.log('✅ Disconnected from RabbitMQ');

    } catch (error) {
      console.error('❌ Error disconnecting from RabbitMQ:', error);
    }
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

// Legacy export for backward compatibility
export class EventPublisher extends EventSubscriber {
  constructor(config?: Partial<RabbitMQConfig>) {
    super(config);
    console.warn('⚠️ EventPublisher is deprecated. Use EventSubscriber instead.');
  }
}

// Utility function to get a shared EventSubscriber instance
let sharedSubscriber: EventSubscriber | null = null;

export function getEventSubscriber(config?: Partial<RabbitMQConfig>): EventSubscriber {
  if (!sharedSubscriber) {
    sharedSubscriber = new EventSubscriber(config);
  }
  return sharedSubscriber;
}

export function resetEventSubscriber(): void {
  if (sharedSubscriber) {
    sharedSubscriber.disconnect();
    sharedSubscriber = null;
  }
}