"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
require("./env");
const sequelize_1 = require("sequelize");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Copy apps/backend/.env.example to apps/backend/.env and configure it.');
}
exports.sequelize = new sequelize_1.Sequelize(databaseUrl, {
    logging: false,
});
//# sourceMappingURL=database.js.map