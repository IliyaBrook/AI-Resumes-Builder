import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { documentTable } from "./document";
import { relations } from "drizzle-orm";

export const skillsTable = pgTable("skills", {
  id: serial("id").primaryKey(),
  docId: varchar("document_id", { length: 255 })
    .references(() => documentTable.documentId, {
      onDelete: "cascade",
    })
    .notNull(),
  name: varchar("name", { length: 255 }),
  category: varchar("category", { length: 255 }),
  rating: integer("rating").notNull().default(0),
  hideRating: integer("hide_rating").notNull().default(0),
  order: integer("order").notNull().default(0),
});

export const skillsRelations = relations(skillsTable, ({ one }) => ({
  document: one(documentTable, {
    fields: [skillsTable.docId],
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
  order: true,
  category: true,
});
