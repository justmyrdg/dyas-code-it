"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassEnrollment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ClassEnrollment extends sequelize_1.Model {
}
exports.ClassEnrollment = ClassEnrollment;
ClassEnrollment.init({
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
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'dropped'),
        allowNull: false,
        defaultValue: 'active',
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'ClassEnrollment',
    tableName: 'class_enrollments',
    indexes: [{ unique: true, fields: ['studentId', 'classId'] }],
});
//# sourceMappingURL=ClassEnrollment.js.map