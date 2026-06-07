import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Tag, Link2, ArrowLeft, X } from "lucide-react";

interface NoteTag {
  id: number;
  name: string;
}

interface NoteLink {
  id: number;
  targetNoteId: number;
  relation?: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  vaultId: number;
  tags?: NoteTag[];
  links?: NoteLink[];
}

export default function NotePage({
  note,
  onSave,
  onAddTag,
  onRemoveTag,
  onBack,
}: {
  note?: Note;
  onSave?: (data: { title: string; content: string }) => void;
  onAddTag?: (name: string) => void;
  onRemoveTag?: (tagId: number) => void;
  onBack?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = () => {
    onSave?.({ title, content });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    onAddTag?.(newTag);
    setNewTag("");
  };

  if (!note) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1" />
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-2xl font-bold border-0 bg-transparent px-0 focus-visible:ring-0 mb-4"
        placeholder="Note title"
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {note.tags?.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
          >
            <Tag className="h-3 w-3" />
            {tag.name}
            <button onClick={() => onRemoveTag?.(tag.id)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <form onSubmit={handleAddTag} className="inline-flex items-center">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="+ tag"
            className="h-7 w-24 text-xs px-2"
          />
        </form>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-[60vh] p-4 rounded-lg border border-input bg-background text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Write your note here (markdown supported)"
      />

      {note.links && note.links.length > 0 && (
        <div className="mt-6 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4" />
            Linked Notes
          </h3>
          <div className="space-y-2">
            {note.links.map((link) => (
              <a key={link.id} href={`/notes/${link.targetNoteId}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <span>Note #{link.targetNoteId}</span>
                {link.relation && <span className="text-muted-foreground">({link.relation})</span>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
