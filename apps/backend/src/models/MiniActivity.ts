import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';
import type { ActivityType, ActivityConfig } from '../services/grading.service';

// A per-lesson interactive exercise. `config` is a JSONB blob whose shape depends on `type`
// (quiz options+correctIndex, fill_blank answers, code_challenge language+testCases). The
// grading service owns the config/answer type definitions.
export class MiniActivity extends Model<
  InferAttributes<MiniActivity>,
  InferCreationAttributes<MiniActivity>
> {
  declare id: CreationOptional<string>;
  declare lessonId: string;
  declare type: ActivityType;
  declare prompt: string;
  declare position: number;
  declare config: ActivityConfig;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

MiniActivity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'lessons', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('quiz', 'code_challenge', 'fill_blank', 'debug'),
      allowNull: false,
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'MiniActivity',
    tableName: 'mini_activities',
  },
);
