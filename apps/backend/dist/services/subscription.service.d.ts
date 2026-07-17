import Stripe from 'stripe';
import { TeacherSubscription } from '../models';
export declare function getStripe(): Stripe;
export declare function getOrCreateSubscription(teacherId: string): Promise<TeacherSubscription>;
export declare function isPremium(subscription: TeacherSubscription): boolean;
export declare function createCheckoutSession(teacherId: string, teacherEmail: string): Promise<string>;
export declare function handleCheckoutCompleted(session: {
    client_reference_id: string | null;
    customer: string | null;
    subscription: string | null;
}): Promise<void>;
export declare function handleSubscriptionUpdated(stripeSub: {
    id: string;
    status: string;
}): Promise<void>;
export declare function handleSubscriptionDeleted(stripeSub: {
    id: string;
}): Promise<void>;
//# sourceMappingURL=subscription.service.d.ts.map