import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';
import type { AssessmentQuestion } from '../services/grading.service';

// A chapter's final evaluation. `questions` is a JSONB array of typed questions (mcq / code /
// short_answer). mcq and code are auto-graded; short_answer requires teacher review.
export class ChapterAssessment extends Model<
  InferAttributes<ChapterAssessment>,
  InferCreationAttributes<ChapterAssessment>
> {
  declare id: CreationOptional<string>;
  declare chapterId: string;
  declare title: string;
  declare passingScore: CreationOptional<number>; // percentage, 0..100
  declare retryCooldownHours: CreationOptional<number>;
  declare questions: CreationOptional<AssessmentQuestion[]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ChapterAssessment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    chapterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'chapters', key: 'id' },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passingScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 70,
    },
    retryCooldownHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 24,
    },
    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'ChapterAssessment',
    tableName: 'chapter_assessments',
  },
);
