"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrator = void 0;
exports.runMigrations = runMigrations;
const umzug_1 = require("umzug");
const database_1 = require("./database");
// Importing the model index registers every model + association on the shared
// sequelize instance. Migrations that snapshot the schema from model definitions
// (e.g. the baseline) rely on this having run first.
require("../models");
// Migrations receive the sequelize instance as their `context`, and derive the
// QueryInterface from it. Glob is resolved relative to this file so it works both
// under ts-node (src/) in dev and compiled (dist/) in production.
exports.migrator = new umzug_1.Umzug({
    migrations: {
        glob: ['../migrations/*.{ts,js}', { cwd: __dirname }],
    },
    context: database_1.sequelize,
    storage: new umzug_1.SequelizeStorage({ sequelize: database_1.sequelize }),
    logger: console,
});
async function runMigrations() {
    const applied = await exports.migrator.up();
    if (applied.length === 0) {
        console.log('No pending migrations.');
    }
    else {
        console.log(`Applied ${applied.length} migration(s): ${applied.map((m) => m.name).join(', ')}`);
    }
}
// CLI entry: `ts-node src/config/migrator.ts [up|down]` (up is the default).
if (require.main === module) {
    const command = process.argv[2] ?? 'up';
    (async () => {
        if (command === 'down') {
            await exports.migrator.down();
        }
        else {
            await exports.migrator.up();
        }
        await database_1.sequelize.close();
    })().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
//# sourceMappingURL=migrator.js.map