import { Router, type IRouter } from "express";
import { db, vaultsTable, notesTable, tagsTable, noteTagsTable, noteLinksTable } from "@workspace/db";

const router: IRouter = Router();

function mk(text: string): string {
  return text;
}

router.post("/seed", async (_req, res): Promise<void> => {
  await db.delete(noteLinksTable);
  await db.delete(noteTagsTable);
  await db.delete(tagsTable);
  await db.delete(notesTable);
  await db.delete(vaultsTable);

  const [vault1] = await db
    .insert(vaultsTable)
    .values({
      name: "Jarvis Core",
      description: "Core knowledge about the Jarvis Brain system",
      icon: "brain",
      color: "#6366f1",
    })
    .returning();

  const [vault2] = await db
    .insert(vaultsTable)
    .values({
      name: "Project Skills",
      description: "Documentation of project skills and capabilities",
      icon: "zap",
      color: "#f59e0b",
    })
    .returning();

  const [vault3] = await db
    .insert(vaultsTable)
    .values({
      name: "Architecture Notes",
      description: "System architecture and design decisions",
      icon: "layers",
      color: "#10b981",
    })
    .returning();

  const notes = [
    {
      vaultId: vault1.id,
      title: "Welcome to Jarvis Brain",
      content: "# Welcome to Jarvis Brain\n\n" +
        "This is your **personal knowledge base** — an Obsidian-style interface for managing all your project knowledge.\n\n" +
        "## Key Features\n\n" +
        "- **Bidirectional Links**: Connect notes to each other\n" +
        "- **Graph View**: Visualize your knowledge as a network\n" +
        "- **Tags**: Organize with color-coded tags\n" +
        "- **Vaults**: Separate knowledge into collections\n" +
        "- **Dark Mode**: Easy on the eyes for long sessions\n\n" +
        "## Getting Started\n\n" +
        "1. Create a vault to organize your knowledge\n" +
        "2. Add notes with markdown content\n" +
        "3. Link notes using [[Note Title]] syntax\n" +
        "4. Explore the graph view to see connections\n" +
        "5. Use tags to categorize your thoughts\n\n" +
        "Built by Tony Stark. Powered by AI.",
      excerpt: "Overview of the Jarvis Brain knowledge base system",
    },
    {
      vaultId: vault1.id,
      title: "API Design Principles",
      content: "# API Design Principles\n\n" +
        "## Contract-First\n\n" +
        "We use OpenAPI specs as the single source of truth. All endpoints are defined in `lib/api-spec/openapi.yaml`.\n\n" +
        "## Codegen Pipeline\n\n" +
        "1. Write OpenAPI spec\n" +
        "2. Run `pnpm --filter @workspace/api-spec run codegen`\n" +
        "3. Orval generates Zod schemas and React Query hooks\n\n" +
        "## Validation\n\n" +
        "- Every request is validated with Zod schemas\n" +
        "- TypeScript types flow from spec to frontend\n" +
        "- No manual type definitions needed\n\n" +
        "## Best Practices\n\n" +
        "- Use entity-shaped names for body schemas (e.g., NoteInput, not CreateNoteBody)\n" +
        "- Keep the /healthz endpoint\n" +
        "- Define array responses with item schemas\n" +
        "- Use nullable types with type: ['string', 'null']",
      excerpt: "How the API layer is structured and validated",
    },
    {
      vaultId: vault2.id,
      title: "Code Review Skill",
      content: "# Code Review Skill\n\n" +
        "## Purpose\n\n" +
        "The code review skill enables architectural analysis of the codebase.\n\n" +
        "## Architecture\n\n" +
        "- Uses a specialized subagent for deep analysis\n" +
        "- Focuses on strategic guidance rather than implementation\n" +
        "- Ideal for debugging complex issues\n\n" +
        "## Usage\n\n" +
        "spawn a code_review subagent\n\n" +
        "## Key Features\n\n" +
        "- Architecture analysis\n" +
        "- Debugging assistance\n" +
        "- Strategic planning\n\n" +
        "## When to Use\n\n" +
        "- Before building major features\n" +
        "- When debugging complex issues\n" +
        "- For architectural decisions",
      excerpt: "Documentation for the code review subagent skill",
    },
    {
      vaultId: vault2.id,
      title: "Design Skill",
      content: "# Design Skill\n\n" +
        "## Purpose\n\n" +
        "The design skill delegates frontend work to a specialized DESIGN subagent.\n\n" +
        "## Workflow\n\n" +
        "1. Main agent plans the API surface\n" +
        "2. Design subagent builds the visual layer\n" +
        "3. Integration happens automatically\n\n" +
        "## Key Principles\n\n" +
        "- Never build frontend yourself — always delegate\n" +
        "- Design subagent owns layout, colors, typography\n" +
        "- Main agent owns data types and API hooks\n\n" +
        "## Best Practices\n\n" +
        "- Keep briefs short and vivid\n" +
        "- Include product identity in every brief\n" +
        "- Pass exact hook names to subagent\n" +
        "- Use real data, not mocks",
      excerpt: "How to delegate frontend work to the design subagent",
    },
    {
      vaultId: vault3.id,
      title: "Monorepo Structure",
      content: "# Monorepo Structure\n\n" +
        "## Packages\n\n" +
        "- `lib/api-spec` - OpenAPI spec and codegen config\n" +
        "- `lib/api-zod` - Zod validation schemas\n" +
        "- `lib/api-client-react` - React Query hooks\n" +
        "- `lib/db` - Drizzle ORM schema and database client\n" +
        "- `artifacts/api-server` - Express backend\n" +
        "- `artifacts/jarvis-brain` - React frontend\n\n" +
        "## Key Conventions\n\n" +
        "- All packages are in `workspace:*`\n" +
        "- Base API path is `/api`\n" +
        "- Database is PostgreSQL via Replit\n" +
        "- Drizzle ORM for schema and queries\n\n" +
        "## Workflows\n\n" +
        "- API Server runs on port from PORT env\n" +
        "- Frontend runs on port from PORT env\n" +
        "- Both are managed by Replit workflows",
      excerpt: "Overview of the pnpm workspace structure",
    },
    {
      vaultId: vault3.id,
      title: "Knowledge Graph Concept",
      content: "# Knowledge Graph Concept\n\n" +
        "## What is a Knowledge Graph?\n\n" +
        "A knowledge graph represents information as a network of interconnected nodes.\n\n" +
        "## In Jarvis Brain\n\n" +
        "- **Nodes**: Individual notes\n" +
        "- **Edges**: Links between notes\n" +
        "- **Relations**: Optional semantic meaning (e.g., references, extends)\n\n" +
        "## Visualization\n\n" +
        "The graph view uses a force-directed layout:\n" +
        "- Connected nodes attract each other\n" +
        "- All nodes repel each other\n" +
        "- Creates natural clusters of related ideas\n\n" +
        "## Bidirectional Links\n\n" +
        "Every link is bidirectional:\n" +
        "- If A links to B, B knows about A\n" +
        "- Backlinks appear automatically\n" +
        "- No manual maintenance needed\n\n" +
        "## Use Cases\n\n" +
        "- Discover hidden connections\n" +
        "- See the shape of your knowledge\n" +
        "- Find orphaned ideas\n" +
        "- Navigate visually",
      excerpt: "How the knowledge graph works in Jarvis Brain",
    },
  ];

  const createdNotes = await db.insert(notesTable).values(notes).returning();

  const tagNames = ["documentation", "architecture", "skill", "guide", "system"];
  const tagColors = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];

  const createdTags = [];
  for (let i = 0; i < tagNames.length; i++) {
    const [tag] = await db
      .insert(tagsTable)
      .values({ name: tagNames[i], color: tagColors[i] })
      .returning();
    createdTags.push(tag);
  }

  const noteTagMappings = [
    { noteId: createdNotes[0].id, tagId: createdTags[0].id },
    { noteId: createdNotes[1].id, tagId: createdTags[1].id },
    { noteId: createdNotes[1].id, tagId: createdTags[3].id },
    { noteId: createdNotes[2].id, tagId: createdTags[2].id },
    { noteId: createdNotes[3].id, tagId: createdTags[2].id },
    { noteId: createdNotes[4].id, tagId: createdTags[1].id },
    { noteId: createdNotes[5].id, tagId: createdTags[4].id },
  ];

  await db.insert(noteTagsTable).values(noteTagMappings);

  const links = [
    { sourceNoteId: createdNotes[0].id, targetNoteId: createdNotes[1].id, relation: "references" },
    { sourceNoteId: createdNotes[1].id, targetNoteId: createdNotes[4].id, relation: "part of" },
    { sourceNoteId: createdNotes[2].id, targetNoteId: createdNotes[3].id, relation: "similar to" },
    { sourceNoteId: createdNotes[4].id, targetNoteId: createdNotes[5].id, relation: "implements" },
    { sourceNoteId: createdNotes[0].id, targetNoteId: createdNotes[5].id, relation: "uses" },
    { sourceNoteId: createdNotes[3].id, targetNoteId: createdNotes[1].id, relation: "extends" },
  ];

  await db.insert(noteLinksTable).values(links);

  res.json({
    message: "Seeded successfully",
    vaults: 3,
    notes: createdNotes.length,
    tags: createdTags.length,
    links: links.length,
  });
});

export default router;
