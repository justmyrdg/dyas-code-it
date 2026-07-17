import type { NextFunction, Request, Response } from 'express';
import { type AuthTokenPayload } from '../services/auth.service';
declare global {
    namespace Express {
        interface User extends AuthTokenPayload {
        }
    }
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map