import { relations } from 'drizzle-orm';
import { boolean, date, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { documentTable } from './document';

export const educationTable = pgTable('education', {
  id: serial('id').primaryKey(),
  docId: varchar('document_id', { length: 255 })
    .references(() => documentTable.documentId, {
      onDelete: 'cascade',
    })
    .notNull(),
  universityName: varchar('university_name', { length: 255 }),
  degree: varchar('degree', { length: 255 }),
  major: varchar('major', { length: 255 }),
  description: text('description'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  currentlyStudying: boolean('currently_studying').notNull().default(false),
  skipDates: boolean('skip_dates').notNull().default(false),
  yearsOnly: boolean('years_only').notNull().default(false),
});

export const educationRelations = relations(educationTable, ({ one }) => ({
  document: one(documentTable, {
    fields: [educationTable.docId],
    references: [documentTable.documentId],
  }),
}));

export const educationTableSchema = createInsertSchema(educationTable, {
  id: z.number().optional(),
}).pick({
  id: true,
  universityName: true,
  degree: true,
  major: true,
  description: true,
  startDate: true,
  endDate: true,
  currentlyStudying: true,
  skipDates: true,
  yearsOnly: true,
});
