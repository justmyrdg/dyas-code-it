import { Umzug } from 'umzug';
import type { Sequelize } from 'sequelize';
import '../models';
export declare const migrator: Umzug<Sequelize>;
export type Migration = typeof migrator._types.migration;
export declare function runMigrations(): Promise<void>;
//# sourceMappingURL=migrator.d.ts.map