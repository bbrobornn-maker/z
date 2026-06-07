import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Note {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  updatedAt: string;
}

interface Vault {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export default function VaultPage({
  vault,
  notes,
  onCreateNote,
  onDeleteNote,
}: {
  vault?: Vault;
  notes?: Note[];
  onCreateNote?: (data: { title: string; content: string }) => void;
  onDeleteNote?: (noteId: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredNotes = notes?.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateNote?.({ title: newTitle, content: newContent });
    setNewTitle("");
    setNewContent("");
    setDialogOpen(false);
  };

  const handleDelete = (noteId: number) => {
    if (!confirm("Delete this note?")) return;
    onDeleteNote?.(noteId);
  };

  if (!vault) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: vault.color || "#6366f1" }} />
            <h1 className="text-3xl font-bold">{vault.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1">{vault.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Note</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  placeholder="Note title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
                <textarea
                  className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm resize-none"
                  placeholder="Note content (markdown supported)"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <Button type="submit" className="w-full">Create Note</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotes?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notes in this vault yet</p>
          </div>
        )}
        {filteredNotes?.map((note) => (
          <Card key={note.id} className="bg-card border-card-border group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <a href={`/notes/${note.id}`} className="flex-1 cursor-pointer">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{note.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {note.excerpt || note.content.slice(0, 120)}...
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {note.tags?.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                    ))}
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={() => handleDelete(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
