import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

// One student attempt at a mini-activity, scoped to the class it was submitted in. Multiple
// attempts are allowed, so (studentId, activityId, classId) is indexed but not unique.
export class ActivitySubmission extends Model<
  InferAttributes<ActivitySubmission>,
  InferCreationAttributes<ActivitySubmission>
> {
  declare id: CreationOptional<string>;
  declare studentId: string;
  declare activityId: string;
  declare classId: string;
  declare attemptNumber: number;
  declare answer: unknown;
  declare score: number;
  declare passed: boolean;
  declare feedback: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ActivitySubmission.init(
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
    activityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'mini_activities', key: 'id' },
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
    answer: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'ActivitySubmission',
    tableName: 'activity_submissions',
    indexes: [{ fields: ['studentId', 'activityId', 'classId'] }],
  },
);
