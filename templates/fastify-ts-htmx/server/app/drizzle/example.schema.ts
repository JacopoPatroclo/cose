import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const exampleTable = pgTable('example-table', {
  uuid: uuid('uuid').primaryKey().defaultRandom(),
  email: varchar('email').unique().notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});
