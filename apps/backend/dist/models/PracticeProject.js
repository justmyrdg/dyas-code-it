"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticeProject = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PracticeProject extends sequelize_1.Model {
}
exports.PracticeProject = PracticeProject;
PracticeProject.init({
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
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
    },
    language: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    visibility: {
        type: sequelize_1.DataTypes.ENUM('private', 'shared_with_teacher', 'public'),
        allowNull: false,
        defaultValue: 'private',
    },
    challengeId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: { model: 'coding_challenges', key: 'id' },
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'PracticeProject',
    tableName: 'practice_projects',
});
//# sourceMappingURL=PracticeProject.js.map