declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        displayName: string;
        role: 'ADMIN' | 'HOST' | 'MEMBER';
        groupId?: string;
      };
    }
  }
}
export {};
