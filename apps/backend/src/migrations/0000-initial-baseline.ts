import type { Model, ModelStatic } from 'sequelize';
import type { Migration } from '../config/migrator';
import {
  User,
  Topic,
  Chapter,
  Lesson,
  Class,
  ClassEnrollment,
  StudentProgress,
  MiniActivity,
  ActivitySubmission,
  ChapterAssessment,
  AssessmentSubmission,
} from '../models';

// Baseline snapshot of the schema that previously existed via `sequelize.sync()`.
// `createTable(tableName, model.getAttributes())` runs through the same query
// generator as sync(), so the emitted DDL matches the model definitions exactly —
// but only for the models listed here, which keeps future models out of the
// baseline (they ship their own migrations).
//
// Order matters: each table's foreign keys reference tables created earlier.
const baselineModels: ModelStatic<Model>[] = [
  User,
  Topic,
  Chapter,
  Lesson,
  Class,
  ClassEnrollment,
  StudentProgress,
  MiniActivity,
  ActivitySubmission,
  ChapterAssessment,
  AssessmentSubmission,
];

function tableName(model: ModelStatic<Model>): string {
  return model.getTableName() as string;
}

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  // Adopt existing dev databases gracefully: tables already created by a prior
  // sync() are left untouched so this baseline is a no-op there, then recorded.
  const existing = (await queryInterface.showAllTables()).map((t) =>
    (typeof t === 'string' ? t : (t as { tableName: string }).tableName).toLowerCase(),
  );

  for (const model of baselineModels) {
    const name = tableName(model);
    if (existing.includes(name.toLowerCase())) continue;
    await queryInterface.createTable(name, model.getAttributes());
  }
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  for (const model of [...baselineModels].reverse()) {
    await queryInterface.dropTable(tableName(model));
  }
};
