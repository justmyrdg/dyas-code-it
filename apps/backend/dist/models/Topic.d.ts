import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export type TopicStatus = 'draft' | 'published' | 'archived';
export declare class Topic extends Model<InferAttributes<Topic>, InferCreationAttributes<Topic>> {
    id: CreationOptional<string>;
    name: string;
    description: string | null;
    adminId: string;
    status: CreationOptional<TopicStatus>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=Topic.d.ts.map