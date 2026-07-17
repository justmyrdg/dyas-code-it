import { DataTypes } from 'sequelize';
import type { Migration } from '../config/migrator';

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.addColumn('users', 'passwordResetTokenHash', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await queryInterface.addColumn('users', 'passwordResetExpiresAt', {
    type: DataTypes.DATE,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.removeColumn('users', 'passwordResetTokenHash');
  await queryInterface.removeColumn('users', 'passwordResetExpiresAt');
};
