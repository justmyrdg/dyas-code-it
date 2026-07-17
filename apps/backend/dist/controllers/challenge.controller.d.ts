import type { NextFunction, Request, Response } from 'express';
export declare function createChallenge(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listChallengesAdmin(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateChallenge(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteChallenge(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listChallengesForStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function startChallenge(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requestHint(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function completeChallenge(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=challenge.controller.d.ts.map