"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const sequelize_1 = require("sequelize");
const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('assessment_submissions');
    if (columns.integrity) {
        return;
    }
    await queryInterface.addColumn('assessment_submissions', 'integrity', {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    });
};
exports.up = up;
const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('assessment_submissions');
    if (!columns.integrity) {
        return;
    }
    await queryInterface.removeColumn('assessment_submissions', 'integrity');
};
exports.down = down;
//# sourceMappingURL=0005-add-integrity-to-assessment-submissions.js.map