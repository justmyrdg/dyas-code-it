import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export declare class StudentProgress extends Model<InferAttributes<StudentProgress>, InferCreationAttributes<StudentProgress>> {
    id: CreationOptional<string>;
    studentId: string;
    classId: string;
    lessonId: string;
    completed: CreationOptional<boolean>;
    completedAt: CreationOptional<Date | null>;
    lastAccessedAt: CreationOptional<Date | null>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=StudentProgress.d.ts.map