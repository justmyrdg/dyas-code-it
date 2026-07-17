import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export class ProjectVersion extends Model<
  InferAttributes<ProjectVersion>,
  InferCreationAttributes<ProjectVersion>
> {
  declare id: CreationOptional<string>;
  declare projectId: string;
  declare versionNumber: number;
  declare code: string;
  declare message: string;
  // Teacher's non-graded feedback on this snapshot (visible to the student).
  declare teacherFeedback: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProjectVersion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'practice_projects', key: 'id' },
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    teacherFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'ProjectVersion',
    tableName: 'project_versions',
    indexes: [{ unique: true, fields: ['projectId', 'versionNumber'] }],
  },
);
