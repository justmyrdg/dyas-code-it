import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export class StudentProgress extends Model<
  InferAttributes<StudentProgress>,
  InferCreationAttributes<StudentProgress>
> {
  declare id: CreationOptional<string>;
  declare studentId: string;
  declare classId: string;
  declare lessonId: string;
  declare completed: CreationOptional<boolean>;
  declare completedAt: CreationOptional<Date | null>;
  declare lastAccessedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

StudentProgress.init(
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
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'classes', key: 'id' },
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'lessons', key: 'id' },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'StudentProgress',
    tableName: 'student_progress',
    indexes: [{ unique: true, fields: ['studentId', 'classId', 'lessonId'] }],
  },
);
