"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chapter = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Chapter extends sequelize_1.Model {
}
exports.Chapter = Chapter;
Chapter.init({
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
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    position: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'Chapter',
    tableName: 'chapters',
});
//# sourceMappingURL=Chapter.js.map