import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '../db';
import { users, groups, groupSettings, members } from '../db/schema';
import { eq, ne } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));

const now = () => new Date().toISOString();

const createHostSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  groupName: z.string().min(1),
});

// GET /api/admin/hosts
router.get('/hosts', async (_req: Request, res: Response): Promise<void> => {
  const hosts = await db.select({
    id: users.id,
    username: users.username,
    displayName: users.displayName,
    email: users.email,
    phone: users.phone,
    isActive: users.isActive,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.role, 'HOST'));

  // Attach group info
  const result = await Promise.all(hosts.map(async host => {
    const group = (await db.select().from(groups).where(eq(groups.hostUserId, host.id)))[0];
    return { ...host, group: group ?? null };
  }));

  res.json(result);
});

// POST /api/admin/hosts ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â create HOST + Group + GroupSettings
router.post('/hosts', async (req: Request, res: Response): Promise<void> => {
  const result = createHostSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { username, password, displayName, email, phone, groupName } = result.data;

  // Check username uniqueness
  const existing = (await db.select().from(users).where(eq(users.username, username)))[0];
  if (existing) {
    res.status(409).json({ error: 'Username already exists' });
    return;
  }

  const hostId = uuidv4();
  const groupId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    id: hostId,
    username,
    passwordHash,
    displayName,
    email,
    phone,
    role: 'HOST',
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  });

  await db.insert(groups).values({
    id: groupId,
    hostUserId: hostId,
    name: groupName,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  });

  await db.insert(groupSettings).values({
    id: uuidv4(),
    groupId,
    courtFeeFixedPerHour: 130000,
    courtFeeCasualPerHour: 180000,
    shuttleFee: 28000,
    splitMethod: 'EQUAL',
    femaleDiscountPercent: 10,
    defaultCourtsByWeekday: '{}',
    updatedAt: now(),
  });

  res.status(201).json({
    message: 'HOST created',
    hostId,
    groupId,
  });
});

// PUT /api/admin/hosts/:id
router.put('/hosts/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { displayName, email, phone, password } = req.body;

  const host = (await db.select().from(users).where(eq(users.id, id)))[0];
  if (!host || host.role !== 'HOST') {
    res.status(404).json({ error: 'Host not found' });
    return;
  }

  const updates: Partial<typeof users.$inferInsert> = {
    displayName: displayName ?? host.displayName,
    email: email ?? host.email,
    phone: phone ?? host.phone,
    updatedAt: now(),
  };

  if (password) {
    updates.passwordHash = await bcrypt.hash(password, 12);
  }

  await db.update(users).set(updates).where(eq(users.id, id));
  res.json({ message: 'Host updated' });
});

// PATCH /api/admin/hosts/:id/status ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â activate/deactivate
router.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    res.status(400).json({ error: 'isActive (boolean) required' });
    return;
  }

  const host = (await db.select().from(users).where(eq(users.id, id)))[0];
  if (!host || host.role !== 'HOST') {
    res.status(404).json({ error: 'Host not found' });
    return;
  }

  await db.update(users).set({ isActive, updatedAt: now() }).where(eq(users.id, id));
  res.json({ message: `Host ${isActive ? 'activated' : 'deactivated'}` });
});

// POST /api/admin/hosts/:id/reset-password
router.post('/hosts/:id/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const host = (await db.select().from(users).where(eq(users.id, id)))[0];
  if (!host || host.role !== 'HOST') {
    res.status(404).json({ error: 'Host not found' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.update(users).set({ passwordHash, updatedAt: now() }).where(eq(users.id, id));
  res.json({ message: 'Password reset' });
});

// GET /api/admin/stats
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  const totalHosts = await db.select().from(users).where(eq(users.role, 'HOST')).length;
  const totalGroups = await db.select().from(groups).length;
  const totalMembers = await db.select().from(members).length;

  res.json({ totalHosts, totalGroups, totalMembers });
});

export default router;
