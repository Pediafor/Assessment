import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import * as dotenv from 'dotenv';

import assessmentRoutes from './routes/assessment.routes';
import mediaRoutes from './routes/media.routes';
import { AppError } from './types';
import { createStaticFileServer } from './middleware/static';
import { getRabbitMQConnection } from './config/rabbitmq';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Service info endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Assessment Service is running! 🚀',
    service: 'Pediafor Assessment Platform - Assessment Service',
    version: '1.0.0',
    features: [
      'Assessment Management',
      'Question Sets & Questions',
      'Rich Media Support',
      'Randomization Algorithms',
      'Timer Management',
      'Role-based Access Control'
    ],
    endpoints: {
      health: '/health',
      uploads: '/uploads/:filename',
      assessments: {
        create: 'POST /assessments',
        list: 'GET /assessments',
        get: 'GET /assessments/:id',
        update: 'PUT /assessments/:id',
        delete: 'DELETE /assessments/:id',
        publish: 'POST /assessments/:id/publish',
        duplicate: 'POST /assessments/:id/duplicate'
      },
      media: {
        question: 'POST /media/question',
        option: 'POST /media/option',
        audio: 'POST /media/audio',
        video: 'POST /media/video'
      }
    },
    architecture: {
      database: 'PostgreSQL (port 5433)',
      authentication: 'Gateway-provided user context',
      authorization: 'Role-based (TEACHER, ADMIN)',
      containerName: 'assessment-service'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'assessment-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected' // TODO: Add actual DB health check
  });
});

// API routes
app.use('/assessments', assessmentRoutes);
app.use('/media', mediaRoutes);

// Static file serving for uploads
app.use('/uploads', createStaticFileServer());

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      info: 'GET /',
      health: 'GET /health',
      assessments: 'GET /assessments'
    },
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);

  // Handle known errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists',
      timestamp: new Date().toISOString(),
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  const port = Number(PORT);
  
  // Initialize RabbitMQ connection
  const initializeServices = async () => {
    try {
      const rabbitMQ = getRabbitMQConnection();
      await rabbitMQ.connect();
      console.log('✅ RabbitMQ connection initialized');
    } catch (error) {
      console.error('❌ Failed to initialize RabbitMQ:', error);
      console.log('⚠️  Continuing without RabbitMQ - events will not be published');
    }
  };

  app.listen(port, '0.0.0.0', async () => {
    console.log(`🚀 Assessment Service running on port ${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${port}/health`);
    console.log(`📖 Service info: http://localhost:${port}/`);
    console.log(`📡 Listening on all interfaces (0.0.0.0:${port})`);
    
    // Initialize services after server starts
    await initializeServices();
  });
}

export default app;