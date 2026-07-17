import type { NextFunction, Request, Response } from 'express';
export declare function listMyProjects(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createProject(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getMyProject(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateMyProject(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteMyProject(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function saveVersion(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function restoreVersion(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listSharedProjects(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSharedProject(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function leaveVersionFeedback(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getPublicProject(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=project.controller.d.ts.map