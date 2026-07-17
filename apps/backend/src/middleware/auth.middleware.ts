import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME, verifyAuthToken, type AuthTokenPayload } from '../services/auth.service';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // @types/passport (pulled in transitively once ../config/passport is imported) already
    // augments Request with `user?: Express.User`; redeclaring `Request.user` here with a
    // different type would conflict (TS2717). Extend the `User` interface instead so both
    // augmentations agree on the same shape.
    interface User extends AuthTokenPayload {}
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: { message: 'Not authenticated', status: 401 } });
    return;
  }

  try {
    req.user = verifyAuthToken(token);
    next();
  } catch {
    res.status(401).json({ error: { message: 'Invalid or expired session', status: 401 } });
  }
}
