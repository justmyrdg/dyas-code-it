"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentChallengeProgress = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class StudentChallengeProgress extends sequelize_1.Model {
}
exports.StudentChallengeProgress = StudentChallengeProgress;
StudentChallengeProgress.init({
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
    challengeId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'coding_challenges', key: 'id' },
    },
    projectId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'practice_projects', key: 'id' },
    },
    completed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    viewedHints: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'StudentChallengeProgress',
    tableName: 'student_challenge_progress',
    indexes: [{ unique: true, fields: ['studentId', 'challengeId'] }],
});
//# sourceMappingURL=StudentChallengeProgress.js.map