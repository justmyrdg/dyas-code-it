import type { NextFunction, Request, Response } from 'express';
import { MiniActivity } from '../models';
import type { ActivityType } from '../services/grading.service';
export interface StudentActivity {
    id: string;
    type: ActivityType;
    prompt: string;
    position: number;
    config: Record<string, unknown>;
}
export declare function toStudentActivity(activity: MiniActivity): StudentActivity;
export declare function createActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=activity.controller.d.ts.map