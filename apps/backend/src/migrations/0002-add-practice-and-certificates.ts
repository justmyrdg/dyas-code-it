import type { Model, ModelStatic } from 'sequelize';
import type { Migration } from '../config/migrator';
import {
  CodingChallenge,
  PracticeProject,
  ProjectVersion,
  StudentChallengeProgress,
  Certificate,
} from '../models';

// Same snapshot technique as the baseline: createTable from the model attributes
// so the DDL always matches the model definitions. Order matters for FKs —
// coding_challenges before practice_projects (challengeId FK), projects before
// versions/progress.
const models: ModelStatic<Model>[] = [
  CodingChallenge,
  PracticeProject,
  ProjectVersion,
  StudentChallengeProgress,
  Certificate,
];

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  for (const model of models) {
    await queryInterface.createTable(model.getTableName() as string, model.getAttributes());
  }
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  for (const model of [...models].reverse()) {
    await queryInterface.dropTable(model.getTableName() as string);
  }
};
