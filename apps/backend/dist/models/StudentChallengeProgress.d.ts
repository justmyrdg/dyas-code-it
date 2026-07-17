import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export declare class StudentChallengeProgress extends Model<InferAttributes<StudentChallengeProgress>, InferCreationAttributes<StudentChallengeProgress>> {
    id: CreationOptional<string>;
    studentId: string;
    challengeId: string;
    projectId: string;
    completed: CreationOptional<boolean>;
    viewedHints: CreationOptional<number[]>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=StudentChallengeProgress.d.ts.map