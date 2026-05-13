import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const themeTable = pgTable('theme', {
  id: serial('id').primaryKey(),
  theme: varchar('theme', { length: 32 }).notNull(),
});
