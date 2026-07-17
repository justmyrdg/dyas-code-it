import { Umzug, SequelizeStorage } from 'umzug';
import type { Sequelize } from 'sequelize';
import { sequelize } from './database';
// Importing the model index registers every model + association on the shared
// sequelize instance. Migrations that snapshot the schema from model definitions
// (e.g. the baseline) rely on this having run first.
import '../models';

// Migrations receive the sequelize instance as their `context`, and derive the
// QueryInterface from it. Glob is resolved relative to this file so it works both
// under ts-node (src/) in dev and compiled (dist/) in production.
export const migrator = new Umzug({
  migrations: {
    glob: ['../migrations/*.{ts,js}', { cwd: __dirname }],
  },
  context: sequelize as Sequelize,
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export type Migration = typeof migrator._types.migration;

export async function runMigrations(): Promise<void> {
  const applied = await migrator.up();
  if (applied.length === 0) {
    console.log('No pending migrations.');
  } else {
    console.log(`Applied ${applied.length} migration(s): ${applied.map((m) => m.name).join(', ')}`);
  }
}

// CLI entry: `ts-node src/config/migrator.ts [up|down]` (up is the default).
if (require.main === module) {
  const command = process.argv[2] ?? 'up';
  (async () => {
    if (command === 'down') {
      await migrator.down();
    } else {
      await migrator.up();
    }
    await sequelize.close();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
