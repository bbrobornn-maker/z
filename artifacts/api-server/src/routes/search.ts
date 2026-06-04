import { Router, type IRouter } from "express";
import { like, or, eq } from "drizzle-orm";
import { db, notesTable, tagsTable, noteTagsTable } from "@workspace/db";
import {
  SearchNotesQueryParams,
  SearchNotesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const query = SearchNotesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { q, vaultId } = query.data;
  const searchTerm = `%${q}%`;

  let notesQuery = db
    .select({
      note_id: notesTable.id,
      note_vault_id: notesTable.vaultId,
      note_title: notesTable.title,
      note_content: notesTable.content,
      note_excerpt: notesTable.excerpt,
      note_created_at: notesTable.createdAt,
      note_updated_at: notesTable.updatedAt,
      tag_name: tagsTable.name,
    })
    .from(notesTable)
    .leftJoin(noteTagsTable, eq(noteTagsTable.noteId, notesTable.id))
    .leftJoin(tagsTable, eq(tagsTable.id, noteTagsTable.tagId))
    .where(
      or(
        like(notesTable.title, searchTerm),
        like(notesTable.content, searchTerm)
      )
    );

  if (vaultId !== undefined) {
    notesQuery = notesQuery.where(
      eq(notesTable.vaultId, vaultId)
    );
  }

  const rows = await notesQuery;

  const map = new Map<number, { note: Record<string, unknown>; tags: string[] }>();
  for (const row of rows) {
    const noteId = row.note_id as number;
    if (!map.has(noteId)) {
      map.set(noteId, {
        note: {
          id: row.note_id,
          vaultId: row.note_vault_id,
          title: row.note_title,
          content: row.note_content,
          excerpt: row.note_excerpt,
          createdAt: row.note_created_at,
          updatedAt: row.note_updated_at,
        },
        tags: [],
      });
    }
    if (row.tag_name) {
      map.get(noteId)!.tags.push(row.tag_name as string);
    }
  }

  const notes = Array.from(map.values()).map(({ note, tags }) => ({ ...note, tags }));
  res.json(SearchNotesResponse.parse(notes));
});

export default router;
