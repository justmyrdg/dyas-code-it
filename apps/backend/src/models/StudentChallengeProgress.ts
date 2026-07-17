import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export class StudentChallengeProgress extends Model<
  InferAttributes<StudentChallengeProgress>,
  InferCreationAttributes<StudentChallengeProgress>
> {
  declare id: CreationOptional<string>;
  declare studentId: string;
  declare challengeId: string;
  declare projectId: string;
  declare completed: CreationOptional<boolean>;
  declare viewedHints: CreationOptional<number[]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

StudentChallengeProgress.init(
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
    challengeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'coding_challenges', key: 'id' },
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'practice_projects', key: 'id' },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    viewedHints: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'StudentChallengeProgress',
    tableName: 'student_challenge_progress',
    indexes: [{ unique: true, fields: ['studentId', 'challengeId'] }],
  },
);
