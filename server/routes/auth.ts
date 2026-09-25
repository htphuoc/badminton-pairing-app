import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db';
import { users, groups } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, resolveHostGroup } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const { username, password } = result.data;

  const user = (await db.select().from(users).where(eq(users.username, username)))[0];
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'Account is inactive' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // Resolve groupId for HOST/MEMBER
  let groupId: string | undefined;
  if (user.role === 'HOST') {
    groupId = (await resolveHostGroup(user.id)) ?? undefined;
  }

  const payload = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role as 'ADMIN' | 'HOST' | 'MEMBER',
    groupId,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });

  res.json({
    token,
    user: payload,
  });
});

// POST /api/auth/logout (stateless JWT â€” client discards token)
router.post('/logout', async (_req: Request, res: Response) => {
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (await db.select({ id: users.id, username: users.username, displayName: users.displayName, email: users.email, phone: users.phone, role: users.role, isActive: users.isActive }).from(users).where(eq(users.id, req.user!.id)))[0];

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let groupId: string | undefined;
  if (user.role === 'HOST') {
    groupId = (await resolveHostGroup(user.id)) ?? undefined;
  }

  res.json({ ...user, groupId });
});

export default router;
