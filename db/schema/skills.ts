import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { documentTable } from './document';
import { relations } from 'drizzle-orm';

export const skillsTable = pgTable('skills', {
  id: serial('id').primaryKey(),
  docId: varchar('document_id', { length: 255 })
    .references(() => documentTable.documentId, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: varchar('name', { length: 255 }),
  category: varchar('category', { length: 255 }),
  rating: integer('rating').notNull().default(0),
  hideRating: integer('hide_rating').notNull().default(0),
  skillOrder: integer('skill_order').notNull().default(0),
  categoryOrder: integer('category_order').notNull().default(0),
});

export const skillCategoriesTable = pgTable('skill_categories', {
  id: serial('id').primaryKey(),
  docId: varchar('document_id', { length: 255 })
    .references(() => documentTable.documentId, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  displayOrder: integer('display_order').notNull().default(0),
});

export const skillsRelations = relations(skillsTable, ({ one }) => ({
  document: one(documentTable, {
    fields: [skillsTable.docId],
    references: [documentTable.documentId],
  }),
}));

export const skillCategoriesRelations = relations(skillCategoriesTable, ({ one }) => ({
  document: one(documentTable, {
    fields: [skillCategoriesTable.docId],
    references: [documentTable.documentId],
  }),
}));

export const skillsTableSchema = createInsertSchema(skillsTable, {
  id: z.number().optional(),
  category: z.string().optional(),
}).pick({
  id: true,
  name: true,
  rating: true,
  hideRating: true,
  skillOrder: true,
  categoryOrder: true,
  category: true,
});

export const skillCategoriesTableSchema = createInsertSchema(skillCategoriesTable, {
  id: z.number().optional(),
}).pick({
  id: true,
  name: true,
  displayOrder: true,
});
