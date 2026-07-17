import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { UserRole } from '../types/auth.types';

// Assumes requireAuth already ran and populated req.user.
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: { message: 'Forbidden', status: 403 } });
      return;
    }
    next();
  };
}
