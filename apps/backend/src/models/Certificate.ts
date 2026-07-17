import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export type CertificateStatus = 'active' | 'revoked';

export class Certificate extends Model<
  InferAttributes<Certificate>,
  InferCreationAttributes<Certificate>
> {
  declare id: CreationOptional<string>;
  declare studentId: string;
  declare classId: string;
  declare topicId: string;
  // Public, unguessable identifier embedded in the QR code / verify URL.
  declare certificateCode: string;
  declare status: CreationOptional<CertificateStatus>;
  declare issuedAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Certificate.init(
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
    topicId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'topics', key: 'id' },
    },
    certificateCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'revoked'),
      allowNull: false,
      defaultValue: 'active',
    },
    issuedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Certificate',
    tableName: 'certificates',
    indexes: [{ unique: true, fields: ['studentId', 'classId'] }],
  },
);
