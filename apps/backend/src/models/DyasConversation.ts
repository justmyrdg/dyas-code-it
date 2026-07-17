import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export type DyasContextType = 'lesson' | 'activity' | 'assessment' | 'sandbox' | 'general';

export interface DyasMessage {
  role: 'student' | 'dyas';
  content: string;
  timestamp: string;
}

export class DyasConversation extends Model<
  InferAttributes<DyasConversation>,
  InferCreationAttributes<DyasConversation>
> {
  declare id: CreationOptional<string>;
  declare studentId: string;
  declare contextType: DyasContextType;
  declare contextId: string | null;
  declare messages: CreationOptional<DyasMessage[]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

DyasConversation.init(
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
    contextType: {
      type: DataTypes.ENUM('lesson', 'activity', 'assessment', 'sandbox', 'general'),
      allowNull: false,
      defaultValue: 'general',
    },
    contextId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    messages: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'DyasConversation',
    tableName: 'dyas_conversations',
  },
);
