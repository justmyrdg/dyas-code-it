import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export type EnrollmentStatus = 'active' | 'dropped';
export declare class ClassEnrollment extends Model<InferAttributes<ClassEnrollment>, InferCreationAttributes<ClassEnrollment>> {
    id: CreationOptional<string>;
    studentId: string;
    classId: string;
    status: CreationOptional<EnrollmentStatus>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=ClassEnrollment.d.ts.map