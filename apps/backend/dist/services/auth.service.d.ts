import type { Response } from 'express';
import type { User } from '../models/User';
import type { UserRole } from '../types/auth.types';
export declare const AUTH_COOKIE_NAME = "dyas_token";
export interface AuthTokenPayload {
    sub: string;
    email: string;
    role: UserRole;
    name: string;
}
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function signAuthToken(user: User): string;
export declare function verifyAuthToken(token: string): AuthTokenPayload;
export declare function setAuthCookie(res: Response, token: string): void;
export declare function clearAuthCookie(res: Response): void;
//# sourceMappingURL=auth.service.d.ts.map