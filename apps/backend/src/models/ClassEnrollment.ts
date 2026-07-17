import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export type EnrollmentStatus = 'active' | 'dropped';

export class ClassEnrollment extends Model<
  InferAttributes<ClassEnrollment>,
  InferCreationAttributes<ClassEnrollment>
> {
  declare id: CreationOptional<string>;
  declare studentId: string;
  declare classId: string;
  declare status: CreationOptional<EnrollmentStatus>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ClassEnrollment.init(
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
    status: {
      type: DataTypes.ENUM('active', 'dropped'),
      allowNull: false,
      defaultValue: 'active',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'ClassEnrollment',
    tableName: 'class_enrollments',
    indexes: [{ unique: true, fields: ['studentId', 'classId'] }],
  },
);
