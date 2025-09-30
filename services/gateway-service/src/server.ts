import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticateGateway } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Gateway health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Gateway Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Gateway info endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Pediafor Assessment Platform - API Gateway 🚀',
    service: 'gateway-service',
    version: '1.0.0',
    features: [
      'PASETO Token Validation',
      'Microservice Routing',
      'Request Authentication',
      'User Context Injection',
      'Load Balancing',
      'Security Headers'
    ],
    routes: {
      auth: '/api/auth/* → UserService',
      users: '/api/users/* → UserService', 
      assessments: '/api/assessments/* → AssessmentService',
      submissions: '/api/submissions/* → SubmissionService',
      grading: '/api/grading/* → GradingService'
    },
    health: '/health'
  });
});

// Apply authentication middleware to all /api routes
app.use('/api', authenticateGateway);

// Microservice proxy routes
const services = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:4000',
  assessment: process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:4001',
  submission: process.env.SUBMISSION_SERVICE_URL || 'http://localhost:4002',
  grading: process.env.GRADING_SERVICE_URL || 'http://localhost:4003'
};

// Route to UserService
app.use('/api/auth', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/auth'
  }
}));

app.use('/api/users', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users'
  }
}));

// Route to AssessmentService (future)
app.use('/api/assessments', createProxyMiddleware({
  target: services.assessment,
  changeOrigin: true,
  pathRewrite: {
    '^/api/assessments': '/assessments'
  }
}));

// Route to SubmissionService (future)
app.use('/api/submissions', createProxyMiddleware({
  target: services.submission,
  changeOrigin: true,
  pathRewrite: {
    '^/api/submissions': '/submissions'
  }
}));

// Route to GradingService (future)
app.use('/api/grading', createProxyMiddleware({
  target: services.grading,
  changeOrigin: true,
  pathRewrite: {
    '^/api/grading': '/grading'
  }
}));

// 404 handler for all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist`,
    availableRoutes: {
      gateway: ['GET /', 'GET /health'],
      api: [
        'POST /api/auth/login',
        'POST /api/auth/refresh', 
        'POST /api/auth/logout',
        'POST /api/users/register',
        'GET /api/users/:id',
        'PUT /api/users/:id',
        'DELETE /api/users/:id',
        'GET /api/users'
      ]
    }
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Gateway error:', err);
  
  res.status(err.status || 500).json({
    error: 'Gateway error',
    message: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway Service running on port ${PORT}`);
  console.log(`🔗 Proxying to services:`, services);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});

export default app;