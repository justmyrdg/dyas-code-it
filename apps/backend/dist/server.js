"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const migrator_1 = require("./config/migrator");
const io_1 = require("./realtime/io");
const models_1 = require("./models");
const PORT = process.env.PORT || 3000;
// Registration clamps role to student/teacher, so the first admin is promoted
// via env: set ADMIN_EMAIL to an existing account's email and restart.
async function promoteAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    if (!adminEmail)
        return;
    const user = await models_1.User.findOne({ where: { email: adminEmail } });
    if (user && user.role !== "admin") {
        user.role = "admin";
        await user.save();
        console.log(`Promoted ${adminEmail} to admin.`);
    }
}
async function start() {
    try {
        await database_1.sequelize.authenticate();
        console.log("Database connection established.");
        // Migrations are the default. DB_SYNC=true is an escape hatch for local
        // throwaway databases where syncing models directly is faster than writing
        // a migration for every in-flight schema tweak.
        if (process.env.DB_SYNC === "true") {
            await database_1.sequelize.sync({ alter: true });
            console.log("Database synced from models (DB_SYNC=true).");
        }
        else {
            await (0, migrator_1.runMigrations)();
        }
        await promoteAdmin();
    }
    catch (err) {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    }
    // Wrap Express in an explicit HTTP server so Socket.io can share the port.
    const server = http_1.default.createServer(app_1.default);
    (0, io_1.initRealtime)(server);
    server.listen(PORT, () => {
        console.log(`DyasCodeIT API running on http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
}
start();
//# sourceMappingURL=server.js.map