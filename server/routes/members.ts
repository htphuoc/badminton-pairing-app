import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '../db';
import { members, groups, sessions, sessionPlayers } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, requireRole, resolveHostGroup } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'HOST'));

const now = () => new Date().toISOString();

// Resolve the group scope for the current user
async function getGroupScope(req: Request): Promise<string | null> {
  if (req.user!.role === 'ADMIN') return null; // null = all groups
  return req.user!.groupId ?? await resolveHostGroup(req.user!.id);
}

// Verify a groupId belongs to current HOST (IDOR protection)
async function assertGroupOwnership(req: Request, res: Response, groupId: string): Promise<boolean> {
  if (req.user!.role === 'ADMIN') return true;
  const ownedGroupId = req.user!.groupId ?? await resolveHostGroup(req.user!.id);
  if (ownedGroupId !== groupId) {
    res.status(403).json({ error: 'Access denied: not your group' });
    return false;
  }
  return true;
}

// Verify a member belongs to HOST's group (IDOR protection)
async function assertMemberOwnership(req: Request, res: Response, memberId: string): Promise<{ ok: boolean; member?: typeof members.$inferSelect }> {
  const member = (await db.select().from(members).where(eq(members.id, memberId)))[0];
  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return { ok: false };
  }
  const owned = await assertGroupOwnership(req, res, member.groupId);
  return { ok: owned, member };
}

const createMemberSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE']),
  skillLevel: z.enum(['Y', 'TBY', 'TB', 'K']),
  memberType: z.enum(['CÃ¡Â»Â Ã„ÂÃ¡Â»Å NH', 'VÃNG LAI']),
  phone: z.string().optional(),
  note: z.string().optional(),
});

// GET /api/members
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const groupId = await getGroupScope(req);

  const query = db.select().from(members);
  const result = await (groupId ? query.where(eq(members.groupId, groupId)) : query);

  // Count career matches per member
  const withStats = await Promise.all(result.map(async m => {
    const sps = await db.select({ matchesPlayed: sessionPlayers.matchesPlayed })
      .from(sessionPlayers)
      .where(eq(sessionPlayers.memberId, m.id))
      ;
    const careerMatches = sps.reduce((sum, sp) => sum + sp.matchesPlayed, 0);
    return { ...m, careerMatches };
  }));

  res.json(withStats);
});

// POST /api/members
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const result = createMemberSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  // HOST backend-determines groupId Ã¢â‚¬â€ cannot be spoofed
  const groupId = req.user!.groupId ?? await resolveHostGroup(req.user!.id);
  if (!groupId && req.user!.role !== 'ADMIN') {
    res.status(400).json({ error: 'No group found for this host' });
    return;
  }

  // ADMIN must provide groupId
  const targetGroupId = req.user!.role === 'ADMIN' ? req.body.groupId : groupId;
  if (!targetGroupId) {
    res.status(400).json({ error: 'groupId required for ADMIN' });
    return;
  }

  const member = {
    id: uuidv4(),
    groupId: targetGroupId,
    ...result.data,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  };

  await db.insert(members).values(member);
  res.status(201).json(member);
});

// GET /api/members/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { ok, member } = await assertMemberOwnership(req, res, req.params.id);
  if (!ok || !member) return;

  const sps = await db.select({ matchesPlayed: sessionPlayers.matchesPlayed })
    .from(sessionPlayers)
    .where(eq(sessionPlayers.memberId, member.id))
    ;
  const careerMatches = sps.reduce((sum, sp) => sum + sp.matchesPlayed, 0);

  res.json({ ...member, careerMatches });
});

// PUT /api/members/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { ok, member } = await assertMemberOwnership(req, res, req.params.id);
  if (!ok || !member) return;

  const result = createMemberSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  await db.update(members)
    .set({ ...result.data, updatedAt: now() })
    .where(eq(members.id, req.params.id))
    ;

  res.json({ message: 'Member updated' });
});

// PATCH /api/members/:id/status
router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { ok, member } = await assertMemberOwnership(req, res, req.params.id);
  if (!ok || !member) return;

  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    res.status(400).json({ error: 'isActive (boolean) required' });
    return;
  }

  await db.update(members).set({ isActive, updatedAt: now() }).where(eq(members.id, req.params.id));
  res.json({ message: `Member ${isActive ? 'activated' : 'deactivated'}` });
});

// DELETE /api/members/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { ok, member } = await assertMemberOwnership(req, res, req.params.id);
  if (!ok || !member) return;

  // Soft delete (preserve session history)
  await db.update(members).set({ isActive: false, updatedAt: now() }).where(eq(members.id, req.params.id));
  res.json({ message: 'Member deactivated' });
});

export default router;
