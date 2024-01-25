import type { Config } from 'drizzle-kit';

import { env } from '@env';

export default {
  schema: './server/**/*.schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: env.DB_URL,
  },
} satisfies Config;
