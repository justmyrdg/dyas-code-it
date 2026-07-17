import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export class CodingChallenge extends Model<
  InferAttributes<CodingChallenge>,
  InferCreationAttributes<CodingChallenge>
> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: string;
  declare difficulty: ChallengeDifficulty;
  declare language: string;
  declare starterCode: string;
  declare hints: CreationOptional<string[]>;
  declare published: CreationOptional<boolean>;
  declare createdBy: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CodingChallenge.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
      defaultValue: 'beginner',
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    starterCode: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    hints: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'CodingChallenge',
    tableName: 'coding_challenges',
  },
);
