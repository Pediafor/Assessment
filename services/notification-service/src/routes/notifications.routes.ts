import { Router } from 'express';
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
