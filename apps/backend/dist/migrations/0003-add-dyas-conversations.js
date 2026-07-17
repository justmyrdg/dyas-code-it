"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const models_1 = require("../models");
const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.createTable(models_1.DyasConversation.getTableName(), models_1.DyasConversation.getAttributes());
};
exports.up = up;
const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable(models_1.DyasConversation.getTableName());
};
exports.down = down;
//# sourceMappingURL=0003-add-dyas-conversations.js.map