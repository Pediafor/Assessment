import express from 'express';
import dotenv from 'dotenv';
import { consumeGradingCompletedEvent } from './events/consumer';

dotenv.config();

const app = express();
const port = process.env.PORT || 4005;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

async function startServer() {
  await consumeGradingCompletedEvent();
  app.listen(port, () => {
    console.log(`Notification service listening on port ${port}`);
  });
}

startServer();
