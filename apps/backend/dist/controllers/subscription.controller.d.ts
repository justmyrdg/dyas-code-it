import type { NextFunction, Request, Response } from 'express';
export declare function getSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function startCheckout(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function stripeWebhook(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=subscription.controller.d.ts.map