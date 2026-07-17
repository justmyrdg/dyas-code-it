import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

export class TeacherSubscription extends Model<
  InferAttributes<TeacherSubscription>,
  InferCreationAttributes<TeacherSubscription>
> {
  declare id: CreationOptional<string>;
  declare teacherId: string;
  declare tier: CreationOptional<SubscriptionTier>;
  declare status: CreationOptional<SubscriptionStatus>;
  declare stripeCustomerId: string | null;
  declare stripeSubscriptionId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TeacherSubscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
    },
    tier: {
      type: DataTypes.ENUM('free', 'premium'),
      allowNull: false,
      defaultValue: 'free',
    },
    status: {
      type: DataTypes.ENUM('active', 'canceled', 'past_due'),
      allowNull: false,
      defaultValue: 'active',
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'TeacherSubscription',
    tableName: 'teacher_subscriptions',
  },
);
