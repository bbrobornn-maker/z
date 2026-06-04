import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetNote,
  useUpdateNote,
  useGetNoteTags,
  useAddNoteTag,
  useRemoveNoteTag,
  useGetNoteLinks,
  getGetNoteQueryKey,
  getGetNoteTagsQueryKey,
  getGetNoteLinksQueryKey,
  getGetVaultNotesQueryKey,
  getGetStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Tag, Link2, ArrowLeft, Plus, X } from "lucide-react";

export default function NotePage() {
  const { noteId } = useParams<{ noteId: string }>();
  const id = parseInt(noteId, 10);
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: note, isLoading } = useGetNote(id, { query: { enabled: !!id } });
  const { data: tags } = useGetNoteTags(id, { query: { enabled: !!id } });
  const { data: links } = useGetNoteLinks(id, { query: { enabled: !!id } });
  const updateNote = useUpdateNote();
  const addTag = useAddNoteTag();
  const removeTag = useRemoveNoteTag();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = () => {
    if (!note) return;
    setIsSaving(true);
    updateNote.mutate(
      { noteId: id, data: { title, content, vaultId: note.vaultId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetVaultNotesQueryKey(note.vaultId) });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setIsSaving(false);
        },
      }
    );
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    addTag.mutate(
      { noteId: id, data: { name: newTag } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetNoteTagsQueryKey(id) });
          setNewTag("");
        },
      }
    );
  };

  const handleRemoveTag = (tagId: number) => {
    removeTag.mutate(
      { noteId: id, tagId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetNoteTagsQueryKey(id) });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Note not found</p>
        <Button onClick={() => setLocation("/")} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/vaults/${note.vaultId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1" />
        <Button onClick={handleSave} disabled={isSaving || updateNote.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-2xl font-bold border-0 bg-transparent px-0 focus-visible:ring-0 mb-4"
        placeholder="Note title"
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {tags?.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
          >
            <Tag className="h-3 w-3" />
            {tag.name}
            <button onClick={() => handleRemoveTag(tag.id)} className="hover:text-destructive">
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

      {links && links.length > 0 && (
        <div className="mt-6 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4" />
            Linked Notes
          </h3>
          <div className="space-y-2">
            {links.map((link) => (
              <Link key={link.id} href={`/notes/${link.targetNoteId}`}>
                <div className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                  <span>Note #{link.targetNoteId}</span>
                  {link.relation && (
                    <span className="text-muted-foreground">({link.relation})</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
