import type { NextFunction, Request, Response } from 'express';
import { User } from '../models/User';
import type { AuthUser } from '../types/auth.types';
declare function toAuthUser(user: User): AuthUser;
export declare function register(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function logout(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function me(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export { toAuthUser };
//# sourceMappingURL=auth.controller.d.ts.map