import type { NextFunction, Request, Response } from 'express';
export declare function createAssessment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateAssessment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteAssessment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAssessmentForStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function submitAssessment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listPendingSubmissions(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSubmissionForTeacher(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=assessment.controller.d.ts.map