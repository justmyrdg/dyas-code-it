"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certificate = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Certificate extends sequelize_1.Model {
}
exports.Certificate = Certificate;
Certificate.init({
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
    topicId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'topics', key: 'id' },
    },
    certificateCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'revoked'),
        allowNull: false,
        defaultValue: 'active',
    },
    issuedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'Certificate',
    tableName: 'certificates',
    indexes: [{ unique: true, fields: ['studentId', 'classId'] }],
});
//# sourceMappingURL=Certificate.js.map