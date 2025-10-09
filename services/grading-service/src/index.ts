import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import gradingRoutes from './routes/gradingRoutes';
import { userContextMiddleware, errorHandler } from './middleware/auth';

// RabbitMQ imports
import { getRabbitMQConnection } from './config/rabbitmq';
import { getGradingEventSubscriber } from './events/subscriber';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'grading-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Authentication middleware for all API routes
app.use('/api', userContextMiddleware);

// API routes
app.use('/api/grade', gradingRoutes);

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, async () => {
  console.log(`🚀 Grading Service running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🎯 API endpoints available at http://localhost:${PORT}/api/grade`);
  
  // Initialize RabbitMQ and event subscribers
  try {
    const rabbitMQ = getRabbitMQConnection();
    await rabbitMQ.connect();
    console.log('🐰 RabbitMQ connected successfully');
    
    const eventSubscriber = getGradingEventSubscriber();
    await eventSubscriber.initialize();
    console.log('🎧 Event subscriber initialized - ready to process submission events');
  } catch (error) {
    console.error('❌ Failed to initialize RabbitMQ or event subscriber:', error);
    // Don't exit - service can still work for manual grading
  }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  try {
    const eventSubscriber = getGradingEventSubscriber();
    await eventSubscriber.close();
    console.log('🔌 Event subscriber closed');
  } catch (error) {
    console.error('❌ Error closing event subscriber:', error);
  }
  
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  
  try {
    const eventSubscriber = getGradingEventSubscriber();
    await eventSubscriber.close();
    console.log('🔌 Event subscriber closed');
  } catch (error) {
    console.error('❌ Error closing event subscriber:', error);
  }
  
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;