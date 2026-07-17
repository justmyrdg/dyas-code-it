import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export declare class Class extends Model<InferAttributes<Class>, InferCreationAttributes<Class>> {
    id: CreationOptional<string>;
    topicId: string;
    teacherId: string;
    name: string;
    classCode: string;
    schedule: string | null;
    active: CreationOptional<boolean>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=Class.d.ts.map