import type { Migration } from '../config/migrator';
import { DyasConversation } from '../models';

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable(
    DyasConversation.getTableName() as string,
    DyasConversation.getAttributes(),
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable(DyasConversation.getTableName() as string);
};
