import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { vaultsTable } from "./vaults";

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  vaultId: integer("vault_id").notNull().references(() => vaultsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNoteSchema = createInsertSchema(notesTable)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notesTable.$inferSelect;
