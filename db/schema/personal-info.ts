import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { documentTable } from "./document";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const personalInfoTable = pgTable("personal_info", {
  id: serial("id").notNull().primaryKey(),
  docId: varchar("document_id", { length: 255 })
    .references(() => documentTable.documentId, {
      onDelete: "cascade",
    }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  address: varchar("address", { length: 500 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  github: varchar("github", { length: 255 }),
  linkedin: varchar("linkedin", { length: 255 }),
});

export const personalInfoRelations = relations(
  personalInfoTable,
  ({ one }) => ({
    document: one(documentTable, {
      fields: [personalInfoTable.docId],
      references: [documentTable.documentId],
    }),
  })
);

export const personalInfoTableSchema = createInsertSchema(personalInfoTable, {
  id: z.number().optional(),
}).pick({
  id: true,
  firstName: true,
  lastName: true,
  jobTitle: true,
  address: true,
  phone: true,
  email: true,
  github: true,
  linkedin: true,
});
export type PersonalSchema = z.infer<typeof personalInfoTableSchema>;
