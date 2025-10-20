import { Router } from 'express';

// Minimal in-memory store keyed by user id for dev/local
// In production, back with DB or cache; populated by event consumers
const store: Record<string, Array<{ id: string; title: string; body?: string; read?: boolean; createdAt: string }>> = {};

const router = Router();

// Extract user from gateway-injected headers
function getUserId(req: any): string | null {
  return (req.headers['x-user-id'] as string) || null;
}

router.get('/', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);
  const items = (store[userId] || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  res.json({ success: true, data: { notifications: items, nextCursor: null } });
});

router.post('/:id/read', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const id = req.params.id;
  const list = store[userId] || [];
  const idx = list.findIndex(n => n.id === id);
  if (idx >= 0) list[idx].read = true;
  store[userId] = list;
  res.json({ success: true });
});

router.post('/read', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const ids: string[] = (req.body && req.body.ids) || [];
  const list = store[userId] || [];
  const set = new Set(ids);
  list.forEach(n => { if (set.has(n.id)) n.read = true; });
  store[userId] = list;
  res.json({ success: true });
});

export default router;
