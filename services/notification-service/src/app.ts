import express from 'express';
import { renderMetrics } from './metrics';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.type('text/plain').send(await renderMetrics());
});

export default app;
