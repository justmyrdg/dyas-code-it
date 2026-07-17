"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const models_1 = require("../models");
// Baseline snapshot of the schema that previously existed via `sequelize.sync()`.
// `createTable(tableName, model.getAttributes())` runs through the same query
// generator as sync(), so the emitted DDL matches the model definitions exactly —
// but only for the models listed here, which keeps future models out of the
// baseline (they ship their own migrations).
//
// Order matters: each table's foreign keys reference tables created earlier.
const baselineModels = [
    models_1.User,
    models_1.Topic,
    models_1.Chapter,
    models_1.Lesson,
    models_1.Class,
    models_1.ClassEnrollment,
    models_1.StudentProgress,
    models_1.MiniActivity,
    models_1.ActivitySubmission,
    models_1.ChapterAssessment,
    models_1.AssessmentSubmission,
];
function tableName(model) {
    return model.getTableName();
}
const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    // Adopt existing dev databases gracefully: tables already created by a prior
    // sync() are left untouched so this baseline is a no-op there, then recorded.
    const existing = (await queryInterface.showAllTables()).map((t) => (typeof t === 'string' ? t : t.tableName).toLowerCase());
    for (const model of baselineModels) {
        const name = tableName(model);
        if (existing.includes(name.toLowerCase()))
            continue;
        await queryInterface.createTable(name, model.getAttributes());
    }
};
exports.up = up;
const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    for (const model of [...baselineModels].reverse()) {
        await queryInterface.dropTable(tableName(model));
    }
};
exports.down = down;
//# sourceMappingURL=0000-initial-baseline.js.map