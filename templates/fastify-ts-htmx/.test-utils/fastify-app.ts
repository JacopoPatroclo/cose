import { vi } from 'vitest';
import fastify from 'fastify';

// Import the drizzle schema used by the app
import * as schema from '../server/app/drizzle/index';

// Import the utility function to mock the database connection
import { mockPool } from '../.test-utils/pg';

// Import the main application builder plugin
import builder, { BuilderOptions } from '../server/app/builder';

// Import the drizzle-orm library
import { drizzle } from 'drizzle-orm/node-postgres';

/**
 * Create a fastify app with the builder plugin and a mocked database connection
 * @param withEnv - The environment variables to use
 * @returns The fastify app and the query function that has been mocked
 */
export function makeFastifyApp(withEnv: BuilderOptions['env']) {
  const app = fastify();

  const query = vi.fn();
  const db = drizzle(
    mockPool({
      query,
    }),
    { schema },
  );

  app.register(builder, { env: withEnv, db });

  return { app, query };
}
