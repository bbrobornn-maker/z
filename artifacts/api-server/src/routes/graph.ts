import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, notesTable, noteLinksTable, tagsTable, noteTagsTable, vaultsTable } from "@workspace/db";
import {
  GetGraphQueryParams,
  GetGraphResponse,
  GetStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/graph", async (req, res): Promise<void> => {
  const query = GetGraphQueryParams.safeParse(req.query);
  const vaultId = query.success ? query.data.vaultId : undefined;

  let notesQuery = db.select().from(notesTable);
  if (vaultId !== undefined) {
    notesQuery = notesQuery.where(eq(notesTable.vaultId, vaultId));
  }
  const notes = await notesQuery;

  let linksQuery = db.select().from(noteLinksTable);
  if (vaultId !== undefined) {
    const noteIds = notes.map((n) => n.id);
    if (noteIds.length > 0) {
      linksQuery = linksQuery.where(
        sql`${noteLinksTable.sourceNoteId} IN (${sql.join(noteIds, sql`, `)})`
      );
    } else {
      linksQuery = linksQuery.where(sql`1 = 0`);
    }
  }
  const links = await linksQuery;

  const nodes = notes.map((note, i) => {
    const angle = (i / notes.length) * Math.PI * 2;
    const radius = 200 + Math.random() * 100;
    return {
      id: note.id,
      title: note.title,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      color: null,
    };
  });

  const edges = links.map((link) => ({
    source: link.sourceNoteId,
    target: link.targetNoteId,
    relation: link.relation,
  }));

  res.json(GetGraphResponse.parse({ nodes, edges }));
});

router.get("/stats", async (_req, res): Promise<void> => {
  const [notesCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notesTable);
  const [tagsCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tagsTable);
  const [vaultsCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(vaultsTable);
  const [linksCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(noteLinksTable);

  const recentNotes = await db
    .select()
    .from(notesTable)
    .orderBy(sql`${notesTable.updatedAt} DESC`)
    .limit(5);

  const notesWithTags = await Promise.all(
    recentNotes.map(async (note) => {
      const tagRows = await db
        .select({ name: tagsTable.name })
        .from(noteTagsTable)
        .leftJoin(tagsTable, eq(tagsTable.id, noteTagsTable.tagId))
        .where(eq(noteTagsTable.noteId, note.id));
      return { ...note, tags: tagRows.map((t) => t.name) };
    })
  );

  res.json(
    GetStatsResponse.parse({
      totalNotes: notesCount.count,
      totalTags: tagsCount.count,
      totalVaults: vaultsCount.count,
      totalLinks: linksCount.count,
      recentNotes: notesWithTags,
    })
  );
});

export default router;
