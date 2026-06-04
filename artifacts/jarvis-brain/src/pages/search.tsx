import { useState } from "react";
import { useSearchParams } from "wouter";
import { useSearchNotes } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText } from "lucide-react";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const { data: results, isLoading } = useSearchNotes(
    searchTerm ? { query: { q: searchTerm } } : undefined,
    { query: { enabled: !!searchTerm } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    setSearchParams({ q: query });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">Find notes across all vaults</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for notes..."
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}
        {!isLoading && searchTerm && results?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No results found for &ldquo;{searchTerm}&rdquo;</p>
          </div>
        )}
        {!searchTerm && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Enter a search term to find notes</p>
          </div>
        )}
        {results?.map((note) => (
          <Link key={note.id} href={`/notes/${note.id}`}>
            <Card className="bg-card border-card-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <h3 className="font-semibold">{note.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {note.excerpt || note.content.slice(0, 150)}...
                </p>
                <div className="flex items-center gap-3 mt-2">
                  {note.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
