import amqp from 'amqplib/callback_api';
import { promisify } from 'util';

let connection: any = null;
let channel: any = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'pediafor.events';
const SERVICE_NAME = 'user-service';

/**
 * Initialize RabbitMQ connection and channel
 */
export const initializeRabbitMQ = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔄 Connecting to RabbitMQ...');
      
      amqp.connect(RABBITMQ_URL, (connectionError, conn) => {
        if (connectionError) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️  Continuing without RabbitMQ in development mode');
            return resolve();
          }
          return reject(connectionError);
        }

        connection = conn;
        
        conn.createChannel((channelError, ch) => {
          if (channelError) {
            return reject(channelError);
          }

          channel = ch;
          
          // Assert exchange
          ch.assertExchange(EXCHANGE_NAME, 'topic', { durable: true }, (exchangeError) => {
            if (exchangeError) {
              return reject(exchangeError);
            }

            console.log('✅ RabbitMQ connected successfully');
            console.log(`📡 Service: ${SERVICE_NAME}`);
            console.log(`🔗 Exchange: ${EXCHANGE_NAME}`);
            
            // Handle connection errors
            conn.on('error', (err) => {
              console.error('❌ RabbitMQ connection error:', err);
            });

            conn.on('close', () => {
              console.log('🔌 RabbitMQ connection closed');
            });

            resolve();
          });
        });
      });
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
      
      // In development, continue without RabbitMQ
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Continuing without RabbitMQ in development mode');
        return resolve();
      }
      
      reject(error);
    }
  });
};

/**
 * Publish an event to RabbitMQ
 */
export const publishEvent = async (eventType: string, data: any): Promise<void> => {
  try {
    if (!channel) {
      console.warn('⚠️  RabbitMQ not connected, skipping event publication');
      return;
    }

    const event = {
      id: `${SERVICE_NAME}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      source: SERVICE_NAME,
      timestamp: new Date().toISOString(),
      data
    };

    const message = JSON.stringify(event);
    
    const published = channel.publish(
      EXCHANGE_NAME,
      eventType,
      Buffer.from(message),
      { persistent: true }
    );

    if (published) {
      console.log('📤 Event published:', {
        type: eventType,
        id: event.id,
        source: SERVICE_NAME
      });
    } else {
      console.warn('⚠️  Event publication may have failed (buffer full)');
    }

  } catch (error) {
    console.error('❌ Failed to publish event:', error);
    // Don't throw - service should continue working even if events fail
  }
};

/**
 * Close RabbitMQ connection gracefully
 */
export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      channel.close();
    }
    if (connection) {
      connection.close();
    }
    console.log('🔌 RabbitMQ connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing RabbitMQ connection:', error);
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing RabbitMQ connection...');
  await closeRabbitMQ();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing RabbitMQ connection...');
  await closeRabbitMQ();
  process.exit(0);
});