import type { Migration } from '../config/migrator';
import { TeacherSubscription } from '../models';

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable(
    TeacherSubscription.getTableName() as string,
    TeacherSubscription.getAttributes(),
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable(TeacherSubscription.getTableName() as string);
};
