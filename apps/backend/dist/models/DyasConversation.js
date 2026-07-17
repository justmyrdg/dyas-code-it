"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DyasConversation = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class DyasConversation extends sequelize_1.Model {
}
exports.DyasConversation = DyasConversation;
DyasConversation.init({
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
    contextType: {
        type: sequelize_1.DataTypes.ENUM('lesson', 'activity', 'assessment', 'sandbox', 'general'),
        allowNull: false,
        defaultValue: 'general',
    },
    contextId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    messages: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'DyasConversation',
    tableName: 'dyas_conversations',
});
//# sourceMappingURL=DyasConversation.js.map