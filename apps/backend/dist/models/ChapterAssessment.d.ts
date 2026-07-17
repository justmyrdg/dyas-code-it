import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import type { AssessmentQuestion } from '../services/grading.service';
export declare class ChapterAssessment extends Model<InferAttributes<ChapterAssessment>, InferCreationAttributes<ChapterAssessment>> {
    id: CreationOptional<string>;
    chapterId: string;
    title: string;
    passingScore: CreationOptional<number>;
    retryCooldownHours: CreationOptional<number>;
    questions: CreationOptional<AssessmentQuestion[]>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=ChapterAssessment.d.ts.map