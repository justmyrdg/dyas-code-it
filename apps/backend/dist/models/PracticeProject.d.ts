import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export type ProjectVisibility = 'private' | 'shared_with_teacher' | 'public';
export declare class PracticeProject extends Model<InferAttributes<PracticeProject>, InferCreationAttributes<PracticeProject>> {
    id: CreationOptional<string>;
    studentId: string;
    title: string;
    description: string;
    language: string;
    visibility: CreationOptional<ProjectVisibility>;
    challengeId: string | null;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=PracticeProject.d.ts.map