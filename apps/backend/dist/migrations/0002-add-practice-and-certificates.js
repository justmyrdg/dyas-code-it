"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const models_1 = require("../models");
// Same snapshot technique as the baseline: createTable from the model attributes
// so the DDL always matches the model definitions. Order matters for FKs —
// coding_challenges before practice_projects (challengeId FK), projects before
// versions/progress.
const models = [
    models_1.CodingChallenge,
    models_1.PracticeProject,
    models_1.ProjectVersion,
    models_1.StudentChallengeProgress,
    models_1.Certificate,
];
const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    for (const model of models) {
        await queryInterface.createTable(model.getTableName(), model.getAttributes());
    }
};
exports.up = up;
const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    for (const model of [...models].reverse()) {
        await queryInterface.dropTable(model.getTableName());
    }
};
exports.down = down;
//# sourceMappingURL=0002-add-practice-and-certificates.js.map