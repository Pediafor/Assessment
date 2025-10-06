import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import 'express-async-errors';

// Route imports
import submissionRoutes from './routes/submission.routes';
import healthRoutes from './routes/health.routes';

// Middleware imports
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Routes
app.use('/health', healthRoutes);
app.use('/api/submissions', submissionRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Submission Service',
    version: '1.0.0',
    description: 'Submission management microservice for Pediafor platform',
    status: 'running',
    endpoints: {
      health: '/health',
      submissions: '/api/submissions'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  const port = Number(PORT);
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Submission Service running on port ${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${port}/health`);
    console.log(`📖 Service info: http://localhost:${port}/`);
    console.log(`📡 Listening on all interfaces (0.0.0.0:${port})`);
  });
}

export default app;