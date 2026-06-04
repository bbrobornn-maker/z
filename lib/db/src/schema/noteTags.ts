import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { notesTable } from "./notes";
import { tagsTable } from "./tags";

export const noteTagsTable = pgTable("note_tags", {
  noteId: integer("note_id").notNull().references(() => notesTable.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tagsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: { primaryKey: { columns: [t.noteId, t.tagId] } },
}));

export const insertNoteTagSchema = createInsertSchema(noteTagsTable)
  .omit({ createdAt: true });

export type InsertNoteTag = z.infer<typeof insertNoteTagSchema>;
export type NoteTag = typeof noteTagsTable.$inferSelect;
