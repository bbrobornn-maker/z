import { pgTable, integer, text, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { notesTable } from "./notes";

export const noteLinksTable = pgTable("note_links", {
  id: serial("id").primaryKey(),
  sourceNoteId: integer("source_note_id").notNull().references(() => notesTable.id, { onDelete: "cascade" }),
  targetNoteId: integer("target_note_id").notNull().references(() => notesTable.id, { onDelete: "cascade" }),
  relation: text("relation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNoteLinkSchema = createInsertSchema(noteLinksTable)
  .omit({ id: true, createdAt: true });

export type InsertNoteLink = z.infer<typeof insertNoteLinkSchema>;
export type NoteLink = typeof noteLinksTable.$inferSelect;
