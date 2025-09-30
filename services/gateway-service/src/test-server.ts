import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Basic routes
app.get('/health', (req, res) => {
  res.json({
    service: 'Gateway Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Pediafor Assessment Platform - API Gateway 🚀',
    service: 'gateway-service',
    version: '1.0.0',
    features: [
      'PASETO Token Validation',
      'Microservice Routing',
      'Request Authentication'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway Service running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});

export default app;