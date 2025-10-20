import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
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

// Handle CORS preflight for all routes (avoid 404 on OPTIONS)
app.options('*', cors({
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
      'Security Headers',
      'Real-time WebSocket Communication',
      'Event Broadcasting'
    ],
    routes: {
      auth: '/api/auth/* → UserService',
      users: '/api/users/* → UserService', 
      assessments: '/api/assessments/* → AssessmentService',
      submissions: '/api/submissions/* → SubmissionService',
      grading: '/api/grading/* → GradingService'
    },
    realtime: {
      websocket: '/ws',
      stats: '/ws/stats'
    },
    health: '/health'
  });
});

// Microservice proxy routes (define targets first)
const services = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:4000',
  assessment: process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:4001',
  submission: process.env.SUBMISSION_SERVICE_URL || 'http://localhost:4002',
  grading: process.env.GRADING_SERVICE_URL || 'http://localhost:4003',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005'
};

// Diagnostic: echo route to validate mount path and public route handling
app.post('/api/auth/echo', (req, res) => {
  res.json({ ok: true, receivedPath: req.path, body: req.body });
});

// Temporary direct handler for auth login to ensure correct forwarding
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const http = await import('node:http');
    const targetUrl = new URL(`${services.user}/auth/login`);
    const body = JSON.stringify(req.body);
    const options = {
      method: 'POST',
      hostname: targetUrl.hostname,
      port: targetUrl.port || 80,
      path: targetUrl.pathname,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    } as any;
    const request = (http as any).request(options, (proxyRes: any) => {
      let data = '';
      proxyRes.on('data', (chunk: any) => data += chunk);
      proxyRes.on('end', () => {
        res.status(proxyRes.statusCode || 500);
        const ct = proxyRes.headers['content-type'] || 'application/json';
        res.set('content-type', Array.isArray(ct) ? ct[0] : ct);
        return res.send(data);
      });
    });
    request.on('error', (err: any) => next(err));
    request.write(body);
    request.end();
  } catch (e) {
    return next(e);
  }
});

// Route to UserService (public auth routes mounted before auth middleware)
app.use('/api/auth', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  // After mounting at '/api/auth', forward to '/auth/*' on user-service
  pathRewrite: { '^/api/auth': '/auth' },
}));

// Public user registration alias without /api prefix
app.use('/users/register', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: (path) => `/users${path.replace(/^\/users/, '')}`,
}));

// Protected routes: apply auth per-route to avoid mount path side-effects
app.use('/api/users', authenticateGateway, createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: (path) => `/users${path}`,
}));

// Non-/api alias: /users -> user service (protected)
app.use('/users', authenticateGateway, createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: { '^/users': '/users' },
}));

// Route to AssessmentService
app.use('/api/assessments', authenticateGateway, createProxyMiddleware({
  target: services.assessment,
  changeOrigin: true,
  pathRewrite: (path) => `/assessments${path}`,
}));

// Non-/api alias: /assessments -> assessment service (protected)
app.use('/assessments', authenticateGateway, createProxyMiddleware({
  target: services.assessment,
  changeOrigin: true,
  pathRewrite: { '^/assessments': '/assessments' },
}));

// Route to SubmissionService (this service expects '/api/submissions' path)
app.use('/api/submissions', authenticateGateway, createProxyMiddleware({
  target: services.submission,
  changeOrigin: true,
  pathRewrite: (path) => `/api/submissions${path}`,
}));

// Non-/api alias: /submissions -> submission service (protected)
app.use('/submissions', authenticateGateway, createProxyMiddleware({
  target: services.submission,
  changeOrigin: true,
  pathRewrite: { '^/submissions': '/api/submissions' },
}));

// Route to GradingService (service exposes '/api/grade')
app.use('/api/grade', authenticateGateway, createProxyMiddleware({
  target: services.grading,
  changeOrigin: true,
  pathRewrite: (path) => `/api/grade${path}`,
}));

// Non-/api alias: /grade -> grading service (protected)
app.use('/grade', authenticateGateway, createProxyMiddleware({
  target: services.grading,
  changeOrigin: true,
  pathRewrite: { '^/grade': '/api/grade' },
}));

// Back-compat alias: /api/grades -> grading service
app.use('/api/grades', authenticateGateway, createProxyMiddleware({
  target: services.grading,
  changeOrigin: true,
  pathRewrite: (path) => `/api/grade${path.replace(/^\/api\/grades/, '')}`,
}));

// Notifications REST proxy to notification-service
app.use('/api/notifications', authenticateGateway, createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  pathRewrite: (path) => `/api/notifications${path}`,
}));

// Non-/api alias: /notifications -> notification service (protected)
app.use('/notifications', authenticateGateway, createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  pathRewrite: { '^/notifications': '/api/notifications' },
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

// Real-time service status endpoint (Placeholder)
app.get('/ws/stats', (req, res) => {
  res.json({ 
    message: 'Real-time service runs separately',
    note: 'Use npm run realtime to start the WebTransport/WebSocket server',
    port: process.env.REALTIME_PORT || 8080
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

// Create HTTP server
const server = createServer(app);

async function startServer() {
  try {
    console.log('🌐 Real-time service available separately via npm run realtime');
  } catch (error) {
    console.error('❌ Server initialization error:', error);
  }

  // Start HTTP server
  server.listen(PORT, () => {
    console.log(`🚀 Gateway Service running on port ${PORT}`);
    console.log(`🔗 Proxying to services:`, services);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Real-time server: Run 'npm run realtime' for WebSocket/WebTransport`);
    console.log(`📊 Real-time stats: http://localhost:${PORT}/ws/stats`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Gateway Service shut down');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Gateway Service shut down');
    process.exit(0);
  });
});

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start Gateway Service:', error);
  process.exit(1);
});

export default app;