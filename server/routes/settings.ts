import { Router, Request, Response } from 'express';
import { db } from '../db';
import { groupSettings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole, resolveHostGroup } from '../middleware/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'HOST'));

const now = () => new Date().toISOString();

async function getGroupId(req: Request): Promise<string | null> {
  if (req.user!.role === 'ADMIN') return req.query.groupId as string ?? null;
  return req.user!.groupId ?? resolveHostGroup(req.user!.id);
}

const settingsSchema = z.object({
  courtFeeFixedPerHour: z.number().min(0).optional(),
  courtFeeCasualPerHour: z.number().min(0).optional(),
  shuttleFee: z.number().min(0).optional(),
  splitMethod: z.enum(['EQUAL', 'BY_MATCHES']).optional(),
  femaleDiscountPercent: z.number().min(0).max(100).optional(),
  defaultCourtsByWeekday: z.record(z.string(), z.array(z.number())).optional(),
});

// GET /api/settings
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const groupId = await getGroupId(req);
  if (!groupId) {
    res.status(400).json({ error: 'groupId required for ADMIN' });
    return;
  }

  const settings = (await db.select().from(groupSettings).where(eq(groupSettings.groupId, groupId)))[0];
  if (!settings) {
    res.status(404).json({ error: 'Settings not found' });
    return;
  }

  res.json({
    ...settings,
    defaultCourtsByWeekday: JSON.parse(settings.defaultCourtsByWeekday),
  });
});

// PUT /api/settings
router.put('/', async (req: Request, res: Response): Promise<void> => {
  const groupId = await getGroupId(req);
  if (!groupId) {
    res.status(400).json({ error: 'groupId required' });
    return;
  }

  // IDOR: HOST cannot update another group's settings
  if (req.user!.role === 'HOST') {
    const ownGroupId = req.user!.groupId ?? await resolveHostGroup(req.user!.id);
    if (ownGroupId !== groupId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
  }

  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = (await db.select().from(groupSettings).where(eq(groupSettings.groupId, groupId)))[0];

  const data = parsed.data;
  const updates: Partial<typeof groupSettings.$inferInsert> = {
    updatedAt: now(),
  };
  if (data.courtFeeFixedPerHour !== undefined) updates.courtFeeFixedPerHour = data.courtFeeFixedPerHour;
  if (data.courtFeeCasualPerHour !== undefined) updates.courtFeeCasualPerHour = data.courtFeeCasualPerHour;
  if (data.shuttleFee !== undefined) updates.shuttleFee = data.shuttleFee;
  if (data.splitMethod !== undefined) updates.splitMethod = data.splitMethod;
  if (data.femaleDiscountPercent !== undefined) updates.femaleDiscountPercent = data.femaleDiscountPercent;
  if (data.defaultCourtsByWeekday !== undefined) updates.defaultCourtsByWeekday = JSON.stringify(data.defaultCourtsByWeekday);

  if (existing) {
    await db.update(groupSettings).set(updates).where(eq(groupSettings.groupId, groupId));
  } else {
    await db.insert(groupSettings).values({
      id: uuidv4(),
      groupId,
      courtFeeFixedPerHour: data.courtFeeFixedPerHour ?? 130000,
      courtFeeCasualPerHour: data.courtFeeCasualPerHour ?? 180000,
      shuttleFee: data.shuttleFee ?? 28000,
      splitMethod: data.splitMethod ?? 'EQUAL',
      femaleDiscountPercent: data.femaleDiscountPercent ?? 10,
      defaultCourtsByWeekday: JSON.stringify(data.defaultCourtsByWeekday ?? {}),
      updatedAt: now(),
    });
  }

  res.json({ message: 'Settings updated' });
});

export default router;
