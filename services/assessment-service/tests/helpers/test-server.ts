import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'assessment-service-test',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Assessment Service Test is running! 🚀',
    service: 'Pediafor Assessment Platform - Assessment Service Test'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Assessment Service Test running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

export default app;