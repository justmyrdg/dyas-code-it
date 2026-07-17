import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';
import type { QuestionFeedback } from '../services/grading.service';
import type { IntegrityMetadata } from '../services/similarity.service';

export type AssessmentStatus = 'pending' | 'auto_graded' | 'graded' | 'passed' | 'failed';

// One student attempt at a chapter assessment within a class. `answers` aligns positionally to
// the assessment's questions. Objective questions are auto-scored on submit; short-answer
// questions stay `pending` until a teacher grades them.
export class AssessmentSubmission extends Model<
  InferAttributes<AssessmentSubmission>,
  InferCreationAttributes<AssessmentSubmission>
> {
  declare id: CreationOptional<string>;
  declare studentId: string;
  declare assessmentId: string;
  declare classId: string;
  declare attemptNumber: number;
  declare answers: unknown;
  declare autoScore: number;
  declare manualScore: CreationOptional<number>;
  declare totalScore: number;
  declare maxScore: number;
  declare status: AssessmentStatus;
  declare feedback: CreationOptional<QuestionFeedback[]>;
  // Client-reported behavioral metadata (tab switches, paste size, time spent).
  // Advisory only — surfaced to teachers, never auto-punitive.
  declare integrity: CreationOptional<IntegrityMetadata | null>;
  declare submittedAt: CreationOptional<Date>;
  declare gradedAt: CreationOptional<Date | null>;
  declare gradedBy: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AssessmentSubmission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    assessmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'chapter_assessments', key: 'id' },
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'classes', key: 'id' },
    },
    attemptNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    autoScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    manualScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'auto_graded', 'graded', 'passed', 'failed'),
      allowNull: false,
    },
    feedback: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    integrity: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    gradedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gradedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'AssessmentSubmission',
    tableName: 'assessment_submissions',
    indexes: [{ fields: ['studentId', 'assessmentId', 'classId'] }],
  },
);
