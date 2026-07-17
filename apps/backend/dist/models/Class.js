"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Class extends sequelize_1.Model {
}
exports.Class = Class;
Class.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    topicId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'topics', key: 'id' },
    },
    teacherId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    classCode: {
        type: sequelize_1.DataTypes.STRING(6),
        allowNull: false,
        unique: true,
    },
    schedule: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'Class',
    tableName: 'classes',
});
//# sourceMappingURL=Class.js.map