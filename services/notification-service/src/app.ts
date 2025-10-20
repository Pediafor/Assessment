import express from 'express';
import { renderMetrics } from './metrics';
import notificationsRouter from './routes/notifications.routes';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.type('text/plain').send(await renderMetrics());
});

// Real REST API for notifications
app.use('/api/notifications', notificationsRouter);

export default app;
