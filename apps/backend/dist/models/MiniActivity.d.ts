import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import type { ActivityType, ActivityConfig } from '../services/grading.service';
export declare class MiniActivity extends Model<InferAttributes<MiniActivity>, InferCreationAttributes<MiniActivity>> {
    id: CreationOptional<string>;
    lessonId: string;
    type: ActivityType;
    prompt: string;
    position: number;
    config: ActivityConfig;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=MiniActivity.d.ts.map