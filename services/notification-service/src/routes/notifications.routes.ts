import { Router } from 'express';
import amqplib from 'amqplib';
import prisma from '../prismaClient';

const router = Router();

// Extract user from gateway-injected headers
function getUserId(req: any): string | null {
  return (req.headers['x-user-id'] as string) || null;
}

router.get('/', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  res.json({ success: true, data: { notifications, nextCursor: null } });
});

router.post('/:id/read', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const id = req.params.id;
  await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
  res.json({ success: true });
});

router.post('/read', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const ids: string[] = (req.body && req.body.ids) || [];
  if (ids.length) {
    await prisma.notification.updateMany({ where: { id: { in: ids }, userId }, data: { read: true } });
  }
  res.json({ success: true });
});

export default router;

// Dev-only: simulate a new notification and publish to RabbitMQ
router.post('/_simulate', async (req, res) => {
  try {
    if (process.env.ALLOW_SIMULATE !== 'true') {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    const userId = (req.body && req.body.userId) || getUserId(req);
    if (!userId) return res.status(400).json({ success: false, error: 'userId required' });

    const title = req.body?.title || 'Test notification';
    const body = req.body?.body || 'This is a simulated notification.';

    const record = await prisma.notification.create({ data: { userId, title, body } });

    try {
      const amqpUrl = process.env.AMQP_URL || process.env.RABBITMQ_URL || 'amqp://localhost';
      const connection = await amqplib.connect(amqpUrl);
      const channel = await connection.createChannel();
      const exchange = 'notification.events';
      await channel.assertExchange(exchange, 'topic', { durable: true });
      const payload = { id: record.id, userId: record.userId, title: record.title, createdAt: record.createdAt };
      channel.publish(exchange, 'notification.created', Buffer.from(JSON.stringify(payload)), { persistent: true });
      await channel.close();
      await connection.close();
    } catch (e) {
      // Non-fatal: event bus unavailable
      console.warn('⚠️ Failed to publish simulate notification.created:', e);
    }

    return res.json({ success: true, data: record });
  } catch (e: any) {
    console.error('simulate error:', e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
});
