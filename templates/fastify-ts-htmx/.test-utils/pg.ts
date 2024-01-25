import type { VitestUtils } from 'vitest';
import type { Pool } from 'pg';

export function mockPool(opts: { query: VitestUtils['fn'] }): Pool {
  return {
    connect() {
      return Promise.resolve({
        query: opts.query,
      });
    },
    query: opts.query,
  } as unknown as Pool;
}
