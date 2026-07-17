import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import type { QuestionFeedback } from '../services/grading.service';
import type { IntegrityMetadata } from '../services/similarity.service';
export type AssessmentStatus = 'pending' | 'auto_graded' | 'graded' | 'passed' | 'failed';
export declare class AssessmentSubmission extends Model<InferAttributes<AssessmentSubmission>, InferCreationAttributes<AssessmentSubmission>> {
    id: CreationOptional<string>;
    studentId: string;
    assessmentId: string;
    classId: string;
    attemptNumber: number;
    answers: unknown;
    autoScore: number;
    manualScore: CreationOptional<number>;
    totalScore: number;
    maxScore: number;
    status: AssessmentStatus;
    feedback: CreationOptional<QuestionFeedback[]>;
    integrity: CreationOptional<IntegrityMetadata | null>;
    submittedAt: CreationOptional<Date>;
    gradedAt: CreationOptional<Date | null>;
    gradedBy: CreationOptional<string | null>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=AssessmentSubmission.d.ts.map