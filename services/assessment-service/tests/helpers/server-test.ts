import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import * as dotenv from 'dotenv';

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
    status: 'healthy',
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
      assessments: 'Not yet connected to database'
    },
    architecture: {
      database: 'PostgreSQL (port 5433) - Not connected',
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
    database: 'not connected - test mode'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      info: 'GET /',
      health: 'GET /health'
    },
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);

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
  app.listen(PORT, () => {
    console.log(`🚀 Assessment Service running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 Service info: http://localhost:${PORT}/`);
    console.log(`⚠️  Database: Not connected (test mode)`);
  });
}

export default app;