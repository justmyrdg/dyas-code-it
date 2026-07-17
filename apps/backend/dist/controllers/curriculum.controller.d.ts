import type { NextFunction, Request, Response } from 'express';
export declare function createTopic(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listTopics(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTopic(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateTopic(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteTopic(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createChapter(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateChapter(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteChapter(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createLesson(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateLesson(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteLesson(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=curriculum.controller.d.ts.map