import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, groups } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'HOST' | 'MEMBER';
  groupId?: string; // primary group for HOST/MEMBER
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// â”€â”€ requireAuth: verify JWT, attach req.user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as AuthUser;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// â”€â”€ requireRole: RBAC guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function requireRole(...roles: Array<'ADMIN' | 'HOST' | 'MEMBER'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

// â”€â”€ requireGroupAccess: verify resource belongs to current user's group â”€â”€â”€â”€â”€â”€â”€â”€
// For HOST: resource groupId must match their own group
// For ADMIN: always allowed
export async function resolveHostGroup(hostUserId: string): Promise<string | null> {
  const group = (await db.select({ id: groups.id }).from(groups).where(eq(groups.hostUserId, hostUserId)))[0];
  return group?.id ?? null;
}

// Middleware factory: checks that params.groupId or body.groupId is owned by HOST
export function requireGroupAccess(getGroupId: (req: Request) => string | undefined) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // ADMIN bypasses all group checks
    if (user.role === 'ADMIN') {
      next();
      return;
    }

    const requestedGroupId = getGroupId(req);
    if (!requestedGroupId) {
      res.status(400).json({ error: 'Group ID required' });
      return;
    }

    // HOST must own the group
    if (user.role === 'HOST') {
      const ownedGroupId = await resolveHostGroup(user.id);
      if (!ownedGroupId || ownedGroupId !== requestedGroupId) {
        res.status(403).json({ error: 'Access denied: not your group' });
        return;
      }
      next();
      return;
    }

    // MEMBER: check group membership (simple version)
    if (user.groupId !== requestedGroupId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    next();
  };
}
