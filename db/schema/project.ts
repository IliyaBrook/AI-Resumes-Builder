import { pgTable, serial, varchar, text, integer } from 'drizzle-orm/pg-core';
import { documentTable } from './document';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const projectTable = pgTable('project', {
  id: serial('id').primaryKey(),
  docId: varchar('document_id', { length: 255 })
    .references(() => documentTable.documentId, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }),
  description: text('description'),
  order: integer('order').notNull().default(0),
  git: varchar('git', { length: 255 }),
});

export const projectRelations = relations(projectTable, ({ one }) => ({
  document: one(documentTable, {
    fields: [projectTable.docId],
    references: [documentTable.documentId],
  }),
}));

export const projectTableSchema = createInsertSchema(projectTable, {
  id: z.number().optional(),
}).pick({
  id: true,
  name: true,
  url: true,
  description: true,
  order: true,
  git: true,
});
