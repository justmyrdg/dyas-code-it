import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export type DyasContextType = 'lesson' | 'activity' | 'assessment' | 'sandbox' | 'general';
export interface DyasMessage {
    role: 'student' | 'dyas';
    content: string;
    timestamp: string;
}
export declare class DyasConversation extends Model<InferAttributes<DyasConversation>, InferCreationAttributes<DyasConversation>> {
    id: CreationOptional<string>;
    studentId: string;
    contextType: DyasContextType;
    contextId: string | null;
    messages: CreationOptional<DyasMessage[]>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=DyasConversation.d.ts.map