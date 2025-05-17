import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const modelTable = pgTable("model", {
  id: serial("id").primaryKey(),
  modelName: varchar("model_name", { length: 255 }).notNull(),
}); 