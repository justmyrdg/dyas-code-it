"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const sequelize_1 = require("sequelize");
const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn('users', 'passwordResetTokenHash', {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    });
    await queryInterface.addColumn('users', 'passwordResetExpiresAt', {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    });
};
exports.up = up;
const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.removeColumn('users', 'passwordResetTokenHash');
    await queryInterface.removeColumn('users', 'passwordResetExpiresAt');
};
exports.down = down;
//# sourceMappingURL=0001-add-password-reset-fields-to-users.js.map