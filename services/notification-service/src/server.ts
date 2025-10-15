import dotenv from 'dotenv';
import app from './app';
import { consumeGradingCompletedEvent } from './events/consumer';

dotenv.config();

const port = process.env.PORT || 4005;

async function startServer() {
  await consumeGradingCompletedEvent();
  app.listen(port, () => {
    console.log(`Notification service listening on port ${port}`);
  });
}

startServer();
