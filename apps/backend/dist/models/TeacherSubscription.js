"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherSubscription = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class TeacherSubscription extends sequelize_1.Model {
}
exports.TeacherSubscription = TeacherSubscription;
TeacherSubscription.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    teacherId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
    },
    tier: {
        type: sequelize_1.DataTypes.ENUM('free', 'premium'),
        allowNull: false,
        defaultValue: 'free',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'canceled', 'past_due'),
        allowNull: false,
        defaultValue: 'active',
    },
    stripeCustomerId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    stripeSubscriptionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'TeacherSubscription',
    tableName: 'teacher_subscriptions',
});
//# sourceMappingURL=TeacherSubscription.js.map