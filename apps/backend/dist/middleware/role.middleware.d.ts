import type { RequestHandler } from 'express';
import type { UserRole } from '../types/auth.types';
export declare function requireRole(...roles: UserRole[]): RequestHandler;
//# sourceMappingURL=role.middleware.d.ts.map