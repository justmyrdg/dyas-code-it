"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentSubmission = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// One student attempt at a chapter assessment within a class. `answers` aligns positionally to
// the assessment's questions. Objective questions are auto-scored on submit; short-answer
// questions stay `pending` until a teacher grades them.
class AssessmentSubmission extends sequelize_1.Model {
}
exports.AssessmentSubmission = AssessmentSubmission;
AssessmentSubmission.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    studentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    assessmentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'chapter_assessments', key: 'id' },
    },
    classId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'classes', key: 'id' },
    },
    attemptNumber: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    answers: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    autoScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    manualScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    totalScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    maxScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'auto_graded', 'graded', 'passed', 'failed'),
        allowNull: false,
    },
    feedback: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    integrity: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    submittedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    gradedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    gradedBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'AssessmentSubmission',
    tableName: 'assessment_submissions',
    indexes: [{ fields: ['studentId', 'assessmentId', 'classId'] }],
});
//# sourceMappingURL=AssessmentSubmission.js.map