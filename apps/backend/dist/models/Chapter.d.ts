import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export declare class Chapter extends Model<InferAttributes<Chapter>, InferCreationAttributes<Chapter>> {
    id: CreationOptional<string>;
    topicId: string;
    title: string;
    description: string | null;
    position: number;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=Chapter.d.ts.map