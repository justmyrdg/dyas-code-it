"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitySubmission = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// One student attempt at a mini-activity, scoped to the class it was submitted in. Multiple
// attempts are allowed, so (studentId, activityId, classId) is indexed but not unique.
class ActivitySubmission extends sequelize_1.Model {
}
exports.ActivitySubmission = ActivitySubmission;
ActivitySubmission.init({
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
    activityId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'mini_activities', key: 'id' },
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
    answer: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    score: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    passed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    feedback: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'ActivitySubmission',
    tableName: 'activity_submissions',
    indexes: [{ fields: ['studentId', 'activityId', 'classId'] }],
});
//# sourceMappingURL=ActivitySubmission.js.map