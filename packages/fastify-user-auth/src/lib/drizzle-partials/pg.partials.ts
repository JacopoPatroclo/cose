import { text, type pgTable } from 'drizzle-orm/pg-core';

export function makeUsernamePasswordSaltPG() {
  return {
    username: text('username').notNull().unique(),
    password: text('password'),
    salt: text('salt'),
  };
}

type UsernamePasswordSaltPGType = ReturnType<typeof makeUsernamePasswordSaltPG>;
type PgTableUsernamePasswordSaltType = typeof pgTable<
  string,
  UsernamePasswordSaltPGType
>;

export type UsernamePasswordSaltPGGenericTableType =
  ReturnType<PgTableUsernamePasswordSaltType>;
