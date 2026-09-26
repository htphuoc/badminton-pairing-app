import { Router, Request, Response } from 'express';
import { randomUUID as uuidv4 } from 'crypto';
import { z } from 'zod';
import { db, sqlite } from '../db';
import { sessions, sessionPlayers, matches, groups, members, groupSettings } from '../db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { requireAuth, requireRole, resolveHostGroup } from '../middleware/auth';
import { generateMatchSuggestion, reshuffleSuggestion } from '../algorithms/matchingEngine';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'HOST'));

const now = () => new Date().toISOString();
const j = JSON.stringify;
const p = <T>(s: string): T => JSON.parse(s);

async function getGroupId(req: Request): Promise<string | null> {
  if (req.user!.role === 'ADMIN') return null;
  return req.user!.groupId ?? await resolveHostGroup(req.user!.id);
}

async function assertSessionAccess(req: Request, res: Response, sessionId: string): Promise<{ ok: boolean; session?: typeof sessions.$inferSelect }> {
  const session = (await db.select().from(sessions).where(eq(sessions.id, sessionId)))[0];
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return { ok: false };
  }
  if (req.user!.role !== 'ADMIN') {
    const groupId = req.user!.groupId ?? await resolveHostGroup(req.user!.id);
    if (session.groupId !== groupId) {
      res.status(403).json({ error: 'Access denied' });
      return { ok: false };
    }
  }
  return { ok: true, session };
}

// Helper: map DB session row â†’ frontend-compatible format
function mapSession(s: typeof sessions.$inferSelect) {
  return {
    ...s,
    courtNumbers: p<number[]>(s.courtNumbers),
    initialCourtNumbers: p<number[]>(s.initialCourtNumbers),
    courtMeta: p<Record<string, unknown>>(s.courtMeta),
    courtFees: p<Record<string, number>>(s.courtFees),
    costs: p<Record<string, unknown>>(s.costsSnapshot),
  };
}

async function attachSessionDetails(rows: typeof sessions.$inferSelect[]) {
  if (rows.length === 0) return [];

  const sessionIds = rows.map(s => s.id);
  const [allPlayers, allMatches] = await Promise.all([
    db.select().from(sessionPlayers).where(inArray(sessionPlayers.sessionId, sessionIds)),
    db.select().from(matches).where(inArray(matches.sessionId, sessionIds)),
  ]);

  const playersBySession = new Map<string, typeof allPlayers>();
  for (const sp of allPlayers) {
    const list = playersBySession.get(sp.sessionId) ?? [];
    list.push(sp);
    playersBySession.set(sp.sessionId, list);
  }

  const matchesBySession = new Map<string, typeof allMatches>();
  for (const m of allMatches) {
    const list = matchesBySession.get(m.sessionId) ?? [];
    list.push(m);
    matchesBySession.set(m.sessionId, list);
  }

  return rows.map(s => ({
    ...mapSession(s),
    players: (playersBySession.get(s.id) ?? []).map(sp => ({
      ...sp,
      playerId: sp.memberId,
      hasPaid: sp.hasPaid,
    })),
    matches: (matchesBySession.get(s.id) ?? []).map(m => ({
      ...m,
      type: m.matchType,
      team1: p<string[]>(m.team1),
      team2: p<string[]>(m.team2),
    })),
  }));
}

// GET /api/sessions/active — lightweight endpoint for live session screen
router.get('/active', async (req: Request, res: Response): Promise<void> => {
  const groupId = await getGroupId(req);
  const rows = groupId
    ? await db.select().from(sessions)
        .where(and(eq(sessions.groupId, groupId), eq(sessions.status, 'RUNNING')))
        .orderBy(desc(sessions.createdAt))
        .limit(1)
    : await db.select().from(sessions)
        .where(eq(sessions.status, 'RUNNING'))
        .orderBy(desc(sessions.createdAt))
        .limit(1);

  if (rows.length === 0) {
    res.json(null);
    return;
  }

  const [session] = await attachSessionDetails(rows);
  res.json(session);
});

// GET /api/sessions
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const groupId = await getGroupId(req);
  const rows = groupId
    ? await db.select().from(sessions).where(eq(sessions.groupId, groupId)).orderBy(desc(sessions.createdAt))
    : await db.select().from(sessions).orderBy(desc(sessions.createdAt));

  res.json(await attachSessionDetails(rows));
});

const createSessionSchema = z.object({
  selectedPlayerIds: z.array(z.string()).optional(),
  sessionDate: z.string(),
  plannedDurationMinutes: z.number().optional(),
  durationMinutes: z.number().min(15).max(480),
  sessionType: z.enum(['CỐ ĐỊNH', 'VÃNG LAI']).default('CỐ ĐỊNH'),
  courtNumbers: z.array(z.number()).min(1),
  shuttleCount: z.number().min(0).default(15),
});

// POST /api/sessions
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const groupId = req.user!.role === 'ADMIN' ? req.body.groupId : (req.user!.groupId ?? await resolveHostGroup(req.user!.id));
  if (!groupId) {
    res.status(400).json({ error: 'No group found' });
    return;
  }

  // Get current settings snapshot
  const settings = (await db.select().from(groupSettings).where(eq(groupSettings.groupId, groupId)))[0];

  const sessionId = uuidv4();
  const courtNums = parsed.data.courtNumbers;

  // Build courtMeta and courtFees
  const courtMeta: Record<string, object> = {};
  const courtFees: Record<string, number> = {};
  for (const c of courtNums) {
    courtMeta[String(c)] = {
      isSupplemental: false,
      plannedMinutes: parsed.data.durationMinutes,
      startedAt: now(),
    };
    courtFees[String(c)] = settings?.courtFeeFixedPerHour ?? 130000;
  }

  const costsSnapshot = settings ? {
    courtFeePerHour: settings.courtFeeFixedPerHour,
    courtFeeFixedPerHour: settings.courtFeeFixedPerHour,
    courtFeeCasualPerHour: settings.courtFeeCasualPerHour,
    shuttleFee: settings.shuttleFee,
    splitMethod: settings.splitMethod,
    femaleDiscountPercent: settings.femaleDiscountPercent,
    defaultCourtsByWeekday: JSON.parse(settings.defaultCourtsByWeekday),
  } : {};

  const newSession = {
    id: sessionId,
    groupId,
    sessionDate: parsed.data.sessionDate,
    startTime: now(),
    plannedDurationMinutes: parsed.data.durationMinutes,
    sessionType: parsed.data.sessionType,
    status: 'RUNNING' as const,
    shuttleCount: parsed.data.shuttleCount,
    isFinalized: false,
    courtNumbers: j(courtNums),
    initialCourtNumbers: j(courtNums),
    courtMeta: j(courtMeta),
    courtFees: j(courtFees),
    costsSnapshot: j(costsSnapshot),
    createdAt: now(),
    updatedAt: now(),
  };

  await db.insert(sessions).values(newSession);

  // Add initial players from request body
  const playerIds: string[] = parsed.data.selectedPlayerIds ?? [];
  for (const memberId of playerIds) {
    const member = (await db.select().from(members).where(eq(members.id, memberId)))[0];
    if (!member || member.groupId !== groupId) continue; // IDOR: skip members from other groups

    await db.insert(sessionPlayers).values({
      id: uuidv4(),
      sessionId,
      memberId,
      playerName: member.name,
      gender: member.gender,
      skillLevel: member.skillLevel,
      memberType: member.memberType,
      attendance: 'WAITING',
      matchesPlayed: 0,
      totalMinutesPlayed: 0,
      waitingSince: now(),
      hasPaid: false,
    });
  }

  res.status(201).json(mapSession(newSession as typeof sessions.$inferSelect));
});

// GET /api/sessions/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const players = await db.select().from(sessionPlayers).where(eq(sessionPlayers.sessionId, session.id));
  const matchRows = await db.select().from(matches).where(eq(matches.sessionId, session.id));

  res.json({
    ...mapSession(session),
    players: players.map(sp => ({ ...sp, playerId: sp.memberId, hasPaid: sp.hasPaid })),
    matches: matchRows.map(m => ({
      ...m,
      type: m.matchType,
      team1: p<string[]>(m.team1),
      team2: p<string[]>(m.team2),
    })),
  });
});

// PUT /api/sessions/:id â€” update shuttle count, finalize, etc.
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const { shuttleCount, isFinalized, courtNumbers, courtMeta, courtFees } = req.body;
  const updates: Partial<typeof sessions.$inferInsert> = { updatedAt: now() };

  if (shuttleCount !== undefined) updates.shuttleCount = shuttleCount;
  if (isFinalized !== undefined) updates.isFinalized = isFinalized;
  if (courtNumbers !== undefined) updates.courtNumbers = j(courtNumbers);
  if (courtMeta !== undefined) updates.courtMeta = j(courtMeta);
  if (courtFees !== undefined) updates.courtFees = j(courtFees);

  await db.update(sessions).set(updates).where(eq(sessions.id, req.params.id));
  res.json({ message: 'Session updated' });
});

// POST /api/sessions/:id/end â€” end session (finish all active matches)
router.post('/:id/end', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const endTime = now();

  const activeMatches = await db.select().from(matches)
    .where(and(eq(matches.sessionId, session.id), eq(matches.status, 'PLAYING')));

  const sessionPlayerRows = await db.select().from(sessionPlayers)
    .where(eq(sessionPlayers.sessionId, session.id));
  const playerByMemberId = new Map(sessionPlayerRows.map(sp => [sp.memberId, sp]));

  const playerDeltas = new Map<string, { matches: number; minutes: number }>();

  for (const match of activeMatches) {
    const startMs = match.startTime ? new Date(match.startTime).getTime() : Date.now();
    const diffMins = Math.round((Date.now() - startMs) / 60000);
    const matchPlayers = [...p<string[]>(match.team1), ...p<string[]>(match.team2)];

    await db.update(matches).set({
      status: 'COMPLETED',
      endTime,
      durationMinutes: diffMins,
      updatedAt: endTime,
    }).where(eq(matches.id, match.id));

    for (const memberId of matchPlayers) {
      const prev = playerDeltas.get(memberId) ?? { matches: 0, minutes: 0 };
      playerDeltas.set(memberId, {
        matches: prev.matches + 1,
        minutes: prev.minutes + diffMins,
      });
    }
  }

  await Promise.all(
    [...playerDeltas.entries()].map(([memberId, delta]) => {
      const sp = playerByMemberId.get(memberId);
      if (!sp) return Promise.resolve();
      return db.update(sessionPlayers).set({
        matchesPlayed: sp.matchesPlayed + delta.matches,
        totalMinutesPlayed: sp.totalMinutesPlayed + delta.minutes,
        attendance: 'WAITING',
        waitingSince: endTime,
      }).where(eq(sessionPlayers.id, sp.id));
    }),
  );

  await Promise.all(
    sessionPlayerRows
      .filter(sp => sp.attendance === 'PLAYING')
      .map(sp =>
        db.update(sessionPlayers).set({
          attendance: 'WAITING',
          waitingSince: endTime,
        }).where(eq(sessionPlayers.id, sp.id)),
      ),
  );

  // Use the session object directly (from assertSessionAccess which works fine)
  const finalShuttleCount = req.body?.shuttleCount ?? session.shuttleCount ?? 15;
  await db.update(sessions).set({
    status: 'FINISHED',
    endTime,
    shuttleCount: finalShuttleCount,
    updatedAt: endTime,
  }).where(eq(sessions.id, session.id));

  res.json({ message: 'Session ended' });
});

// â”€â”€ SESSION PLAYERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// POST /api/sessions/:id/players â€” add member to session
router.post('/:id/players', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const { memberId } = req.body;
  const member = (await db.select().from(members).where(eq(members.id, memberId)))[0];
  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }
  // IDOR: ensure member belongs to same group
  if (member.groupId !== session.groupId) {
    res.status(403).json({ error: 'Member does not belong to this group' });
    return;
  }

  const existing = (await db.select().from(sessionPlayers)
    .where(and(eq(sessionPlayers.sessionId, session.id), eq(sessionPlayers.memberId, memberId)))
    )[0];
  if (existing) {
    // Re-activate if absent
    if (existing.attendance === 'ABSENT') {
      await db.update(sessionPlayers).set({ attendance: 'WAITING', waitingSince: now() })
        .where(eq(sessionPlayers.id, existing.id));
      res.json({ message: 'Player re-added' });
    } else {
      res.status(409).json({ error: 'Player already in session' });
    }
    return;
  }

  await db.insert(sessionPlayers).values({
    id: uuidv4(),
    sessionId: session.id,
    memberId,
    playerName: member.name,
    gender: member.gender,
    skillLevel: member.skillLevel,
    memberType: member.memberType,
    attendance: 'WAITING',
    matchesPlayed: 0,
    totalMinutesPlayed: 0,
    waitingSince: now(),
    hasPaid: false,
  });

  res.status(201).json({ message: 'Player added' });
});

// PUT /api/sessions/:id/players/:memberId â€” update player state (attendance, hasPaid, etc.)
router.put('/:id/players/:memberId', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const sp = (await db.select().from(sessionPlayers)
    .where(and(eq(sessionPlayers.sessionId, session.id), eq(sessionPlayers.memberId, req.params.memberId)))
    )[0];
  if (!sp) {
    res.status(404).json({ error: 'Player not in session' });
    return;
  }

  const { attendance, hasPaid, matchesPlayed, totalMinutesPlayed, waitingSince } = req.body;
  const updates: Partial<typeof sessionPlayers.$inferInsert> = {};
  if (attendance !== undefined) updates.attendance = attendance;
  if (hasPaid !== undefined) updates.hasPaid = hasPaid;
  if (matchesPlayed !== undefined) updates.matchesPlayed = matchesPlayed;
  if (totalMinutesPlayed !== undefined) updates.totalMinutesPlayed = totalMinutesPlayed;
  if (waitingSince !== undefined) updates.waitingSince = waitingSince;

  await db.update(sessionPlayers).set(updates).where(eq(sessionPlayers.id, sp.id));
  res.json({ message: 'Player updated' });
});

// DELETE /api/sessions/:id/players/:memberId â€” remove (mark ABSENT)
router.delete('/:id/players/:memberId', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  await db.update(sessionPlayers).set({ attendance: 'ABSENT' })
    .where(and(eq(sessionPlayers.sessionId, session.id), eq(sessionPlayers.memberId, req.params.memberId)))
    ;
  res.json({ message: 'Player removed' });
});

// â”€â”€ MATCHES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// GET /api/sessions/:id/matches
router.get('/:id/matches', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const matchRows = await db.select().from(matches).where(eq(matches.sessionId, session.id));
  res.json(matchRows.map(m => ({ ...m, team1: p<string[]>(m.team1), team2: p<string[]>(m.team2) })));
});

// POST /api/sessions/:id/matches â€” create match
router.post('/:id/matches', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const { courtId, matchType, team1, team2, assignmentMode } = req.body;
  if (!courtId || !team1?.length || !team2?.length) {
    res.status(400).json({ error: 'courtId, team1, team2 required' });
    return;
  }

  const matchId = uuidv4();
  await db.insert(matches).values({
    id: matchId,
    sessionId: session.id,
    groupId: session.groupId,
    courtId: String(courtId),
    matchType: matchType ?? 'Tá»° DO',
    team1: j(team1),
    team2: j(team2),
    startTime: now(),
    status: 'PLAYING',
    assignmentMode: assignmentMode ?? 'MANUAL',
    createdAt: now(),
    updatedAt: now(),
  });

  // Update attendance for players
  const allPlayers = [...team1, ...team2];
  for (const memberId of allPlayers) {
    await db.update(sessionPlayers).set({ attendance: 'PLAYING' })
      .where(and(eq(sessionPlayers.sessionId, session.id), eq(sessionPlayers.memberId, memberId)))
      ;
  }

  res.status(201).json({ id: matchId, message: 'Match created' });
});

// POST /api/sessions/:id/matches/:matchId/end â€” end a match
router.post('/:id/matches/:matchId/end', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const match = (await db.select().from(matches).where(eq(matches.id, req.params.matchId)))[0];
  if (!match || match.sessionId !== session.id) {
    res.status(404).json({ error: 'Match not found' });
    return;
  }

  const endTime = now();
  const startMs = match.startTime ? new Date(match.startTime).getTime() : Date.now();
  const diffMins = Math.round((Date.now() - startMs) / 60000);
  const allPlayers = [...p<string[]>(match.team1), ...p<string[]>(match.team2)];

  await db.update(matches).set({
    status: 'COMPLETED',
    endTime,
    durationMinutes: diffMins,
    updatedAt: endTime,
  }).where(eq(matches.id, match.id));

  for (const memberId of allPlayers) {
    const sp = (await db.select().from(sessionPlayers)
      .where(and(eq(sessionPlayers.sessionId, session.id), eq(sessionPlayers.memberId, memberId)))
      )[0];
    if (sp) {
      await db.update(sessionPlayers).set({
        matchesPlayed: sp.matchesPlayed + 1,
        totalMinutesPlayed: sp.totalMinutesPlayed + diffMins,
        attendance: 'WAITING',
        waitingSince: endTime,
      }).where(eq(sessionPlayers.id, sp.id));
    }
  }

  res.json({ message: 'Match ended', durationMinutes: diffMins });
});

// GET /api/sessions/:id/suggest-match
router.post('/:id/suggest-match', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const { excludePlayerSets, preferredMatchType } = req.body;
  const waitingPlayers = await db.select().from(sessionPlayers)
    .where(and(eq(sessionPlayers.sessionId, session.id), eq(sessionPlayers.attendance, 'WAITING')))
    ;

  // Any players from members not needed directly because sessionPlayers has the required fields
  const suggestion = generateMatchSuggestion({
    waitingPlayers: waitingPlayers as any, // Cast to any to bypass strict type check for now
    activeMatches: [], // We don't use this in current simplified matching
    sessionHistory: [], // Not used yet
    availableCourts: 1, // Doesn't matter right now
    preferredMatchType,
    excludePlayerSets,
  });

  if (!suggestion) {
    res.status(404).json({ error: 'KhÃ´ng Ä‘á»§ 4 ngÆ°á»i chá» Ä‘á»ƒ xáº¿p tráº­n' });
    return;
  }

  res.json(suggestion);
});

router.post('/:id/reshuffle-match', async (req: Request, res: Response): Promise<void> => {
  const { ok, session } = await assertSessionAccess(req, res, req.params.id);
  if (!ok || !session) return;

  const { suggestion } = req.body;
  if (!suggestion) {
    res.status(400).json({ error: 'Missing suggestion body' });
    return;
  }

  res.json(reshuffleSuggestion(suggestion));
});

export default router;
