import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';
export declare class TeacherSubscription extends Model<InferAttributes<TeacherSubscription>, InferCreationAttributes<TeacherSubscription>> {
    id: CreationOptional<string>;
    teacherId: string;
    tier: CreationOptional<SubscriptionTier>;
    status: CreationOptional<SubscriptionStatus>;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=TeacherSubscription.d.ts.map