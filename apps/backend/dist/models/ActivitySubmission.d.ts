import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export declare class ActivitySubmission extends Model<InferAttributes<ActivitySubmission>, InferCreationAttributes<ActivitySubmission>> {
    id: CreationOptional<string>;
    studentId: string;
    activityId: string;
    classId: string;
    attemptNumber: number;
    answer: unknown;
    score: number;
    passed: boolean;
    feedback: CreationOptional<string | null>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=ActivitySubmission.d.ts.map