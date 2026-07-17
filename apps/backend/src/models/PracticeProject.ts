import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export type ProjectVisibility = 'private' | 'shared_with_teacher' | 'public';

export class PracticeProject extends Model<
  InferAttributes<PracticeProject>,
  InferCreationAttributes<PracticeProject>
> {
  declare id: CreationOptional<string>;
  declare studentId: string;
  declare title: string;
  declare description: string;
  declare language: string;
  declare visibility: CreationOptional<ProjectVisibility>;
  declare challengeId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PracticeProject.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    visibility: {
      type: DataTypes.ENUM('private', 'shared_with_teacher', 'public'),
      allowNull: false,
      defaultValue: 'private',
    },
    challengeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'coding_challenges', key: 'id' },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'PracticeProject',
    tableName: 'practice_projects',
  },
);
