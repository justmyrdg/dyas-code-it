import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export declare class ProjectVersion extends Model<InferAttributes<ProjectVersion>, InferCreationAttributes<ProjectVersion>> {
    id: CreationOptional<string>;
    projectId: string;
    versionNumber: number;
    code: string;
    message: string;
    teacherFeedback: string | null;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=ProjectVersion.d.ts.map