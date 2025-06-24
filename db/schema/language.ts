import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { documentTable } from './document';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const languageTable = pgTable('language', {
  id: serial('id').primaryKey(),
  docId: varchar('document_id', { length: 255 })
    .references(() => documentTable.documentId, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  level: varchar('level', { length: 100 }),
  order: integer('order').notNull().default(0),
});

export const languageRelations = relations(languageTable, ({ one }) => ({
  document: one(documentTable, {
    fields: [languageTable.docId],
    references: [documentTable.documentId],
  }),
}));

export const languageTableSchema = createInsertSchema(languageTable, {
  id: z.number().optional(),
}).pick({
  id: true,
  name: true,
  level: true,
  order: true,
});
