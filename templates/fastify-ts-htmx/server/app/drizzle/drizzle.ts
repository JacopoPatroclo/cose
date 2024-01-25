import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { env } from '@env';
import * as schema from '.';

export const pool = new Pool({
  connectionString: env.DB_URL,
});

export type DBType = NodePgDatabase<typeof schema>;

export function makeDrizzle(pool: Pool) {
  return drizzle(pool, { schema });
}

export function doMigrate(...args: Parameters<typeof migrate>) {
  return migrate(...args);
}
