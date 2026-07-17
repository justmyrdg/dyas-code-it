"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectVersion = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ProjectVersion extends sequelize_1.Model {
}
exports.ProjectVersion = ProjectVersion;
ProjectVersion.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    projectId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'practice_projects', key: 'id' },
    },
    versionNumber: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    code: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
    },
    teacherFeedback: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'ProjectVersion',
    tableName: 'project_versions',
    indexes: [{ unique: true, fields: ['projectId', 'versionNumber'] }],
});
//# sourceMappingURL=ProjectVersion.js.map