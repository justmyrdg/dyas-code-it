"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodingChallenge = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CodingChallenge extends sequelize_1.Model {
}
exports.CodingChallenge = CodingChallenge;
CodingChallenge.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
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
    difficulty: {
        type: sequelize_1.DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: false,
        defaultValue: 'beginner',
    },
    language: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    starterCode: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
    },
    hints: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    published: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    createdBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'CodingChallenge',
    tableName: 'coding_challenges',
});
//# sourceMappingURL=CodingChallenge.js.map