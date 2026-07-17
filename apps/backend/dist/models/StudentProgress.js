"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentProgress = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class StudentProgress extends sequelize_1.Model {
}
exports.StudentProgress = StudentProgress;
StudentProgress.init({
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
    classId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'classes', key: 'id' },
    },
    lessonId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'lessons', key: 'id' },
    },
    completed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    completedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    lastAccessedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'StudentProgress',
    tableName: 'student_progress',
    indexes: [{ unique: true, fields: ['studentId', 'classId', 'lessonId'] }],
});
//# sourceMappingURL=StudentProgress.js.map