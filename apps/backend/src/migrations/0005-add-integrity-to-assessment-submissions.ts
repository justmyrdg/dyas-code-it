import { DataTypes } from 'sequelize';
import type { Migration } from '../config/migrator';

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable('assessment_submissions');

  if (columns.integrity) {
    return;
  }

  await queryInterface.addColumn('assessment_submissions', 'integrity', {
    type: DataTypes.JSONB,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable('assessment_submissions');

  if (!columns.integrity) {
    return;
  }

  await queryInterface.removeColumn('assessment_submissions', 'integrity');
};
