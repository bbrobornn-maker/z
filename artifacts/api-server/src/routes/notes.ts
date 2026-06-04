import { Router, type IRouter } from "express";
import { eq, and, like, or, sql } from "drizzle-orm";
import { db, notesTable, tagsTable, noteTagsTable, noteLinksTable } from "@workspace/db";
import {
  GetVaultNotesParams,
  GetVaultNotesQueryParams,
  GetVaultNotesResponse,
  CreateNoteBody,
  GetNoteParams,
  GetNoteResponse,
  UpdateNoteParams,
  UpdateNoteBody,
  UpdateNoteResponse,
  DeleteNoteParams,
  GetNoteTagsParams,
  GetNoteTagsResponse,
  AddNoteTagParams,
  AddNoteTagBody,
  GetNoteLinksParams,
  GetNoteLinksResponse,
  CreateNoteLinkParams,
  CreateNoteLinkBody,
  DeleteNoteLinkParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function buildNoteWithTags(rows: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
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
  return Array.from(map.values()).map(({ note, tags }) => ({ ...note, tags }));
}

router.get("/vaults/:vaultId/notes", async (req, res): Promise<void> => {
  const params = GetVaultNotesParams.safeParse(req.params);
  const query = GetVaultNotesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const vaultId = params.data.vaultId;
  const tagFilter = query.success ? query.data.tag : undefined;
  const qFilter = query.success ? query.data.q : undefined;

  let baseQuery = db
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
    .where(eq(notesTable.vaultId, vaultId));

  if (tagFilter) {
    baseQuery = baseQuery.where(
      and(
        eq(notesTable.vaultId, vaultId),
        eq(tagsTable.name, tagFilter)
      )
    );
  }

  if (qFilter) {
    baseQuery = baseQuery.where(
      and(
        eq(notesTable.vaultId, vaultId),
        or(
          like(notesTable.title, `%${qFilter}%`),
          like(notesTable.content, `%${qFilter}%`)
        )
      )
    );
  }

  const rows = await baseQuery;
  const notes = buildNoteWithTags(rows);
  res.json(GetVaultNotesResponse.parse(notes));
});

router.post("/notes", async (req, res): Promise<void> => {
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { tags, ...noteData } = parsed.data;
  const [note] = await db.insert(notesTable).values(noteData).returning();

  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      let [tag] = await db.select().from(tagsTable).where(eq(tagsTable.name, tagName));
      if (!tag) {
        [tag] = await db.insert(tagsTable).values({ name: tagName }).returning();
      }
      await db.insert(noteTagsTable).values({ noteId: note.id, tagId: tag.id }).onConflictDoNothing();
    }
  }

  res.status(201).json(GetNoteResponse.parse({ ...note, tags: tags ?? [] }));
});

router.get("/notes/:noteId", async (req, res): Promise<void> => {
  const params = GetNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.noteId));
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const tagRows = await db
    .select({ name: tagsTable.name })
    .from(noteTagsTable)
    .leftJoin(tagsTable, eq(tagsTable.id, noteTagsTable.tagId))
    .where(eq(noteTagsTable.noteId, note.id));

  res.json(GetNoteResponse.parse({ ...note, tags: tagRows.map((t) => t.name) }));
});

router.patch("/notes/:noteId", async (req, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tags, ...updateData } = parsed.data;
  const [note] = await db
    .update(notesTable)
    .set(updateData)
    .where(eq(notesTable.id, params.data.noteId))
    .returning();

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  if (tags !== undefined) {
    await db.delete(noteTagsTable).where(eq(noteTagsTable.noteId, note.id));
    for (const tagName of tags) {
      let [tag] = await db.select().from(tagsTable).where(eq(tagsTable.name, tagName));
      if (!tag) {
        [tag] = await db.insert(tagsTable).values({ name: tagName }).returning();
      }
      await db.insert(noteTagsTable).values({ noteId: note.id, tagId: tag.id }).onConflictDoNothing();
    }
  }

  const tagRows = await db
    .select({ name: tagsTable.name })
    .from(noteTagsTable)
    .leftJoin(tagsTable, eq(tagsTable.id, noteTagsTable.tagId))
    .where(eq(noteTagsTable.noteId, note.id));

  res.json(UpdateNoteResponse.parse({ ...note, tags: tagRows.map((t) => t.name) }));
});

router.delete("/notes/:noteId", async (req, res): Promise<void> => {
  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [note] = await db
    .delete(notesTable)
    .where(eq(notesTable.id, params.data.noteId))
    .returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/notes/:noteId/tags", async (req, res): Promise<void> => {
  const params = GetNoteTagsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const tags = await db
    .select({
      id: tagsTable.id,
      name: tagsTable.name,
      color: tagsTable.color,
      createdAt: tagsTable.createdAt,
    })
    .from(noteTagsTable)
    .leftJoin(tagsTable, eq(tagsTable.id, noteTagsTable.tagId))
    .where(eq(noteTagsTable.noteId, params.data.noteId));
  res.json(GetNoteTagsResponse.parse(tags));
});

router.post("/notes/:noteId/tags", async (req, res): Promise<void> => {
  const params = AddNoteTagParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AddNoteTagBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [tag] = await db.select().from(tagsTable).where(eq(tagsTable.name, parsed.data.name));
  if (!tag) {
    [tag] = await db.insert(tagsTable).values({ name: parsed.data.name, color: parsed.data.color }).returning();
  }

  await db
    .insert(noteTagsTable)
    .values({ noteId: params.data.noteId, tagId: tag.id })
    .onConflictDoNothing();

  res.status(201).json(GetNoteTagsResponseItem.parse(tag));
});

router.delete("/notes/:noteId/tags/:tagId", async (req, res): Promise<void> => {
  const params = GetNoteTagsParams.safeParse(req.params);
  const tagId = parseInt(req.params.tagId, 10);
  if (!params.success || isNaN(tagId)) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db
    .delete(noteTagsTable)
    .where(and(eq(noteTagsTable.noteId, params.data.noteId), eq(noteTagsTable.tagId, tagId)));
  res.sendStatus(204);
});

router.get("/notes/:noteId/links", async (req, res): Promise<void> => {
  const params = GetNoteLinksParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const links = await db
    .select({
      id: noteLinksTable.id,
      sourceNoteId: noteLinksTable.sourceNoteId,
      targetNoteId: noteLinksTable.targetNoteId,
      relation: noteLinksTable.relation,
      createdAt: noteLinksTable.createdAt,
    })
    .from(noteLinksTable)
    .where(eq(noteLinksTable.sourceNoteId, params.data.noteId));
  res.json(GetNoteLinksResponse.parse(links));
});

router.post("/notes/:noteId/links", async (req, res): Promise<void> => {
  const params = CreateNoteLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateNoteLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [link] = await db
    .insert(noteLinksTable)
    .values({
      sourceNoteId: params.data.noteId,
      targetNoteId: parsed.data.targetNoteId,
      relation: parsed.data.relation,
    })
    .returning();

  res.status(201).json(GetNoteLinksResponseItem.parse(link));
});

router.delete("/notes/:noteId/links/:linkId", async (req, res): Promise<void> => {
  const params = GetNoteLinksParams.safeParse(req.params);
  const linkId = parseInt(req.params.linkId, 10);
  if (!params.success || isNaN(linkId)) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [link] = await db
    .delete(noteLinksTable)
    .where(eq(noteLinksTable.id, linkId))
    .returning();
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
