import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Tag, FolderOpen, Share2, Clock } from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  updatedAt: string;
}

interface Stats {
  totalNotes: number;
  totalTags: number;
  totalVaults: number;
  totalLinks: number;
  recentNotes?: Note[];
}

export default function Dashboard({ stats }: { stats?: Stats }) {
  const statCards = [
    { label: "Notes", value: stats?.totalNotes ?? 0, icon: FileText, color: "text-primary" },
    { label: "Tags", value: stats?.totalTags ?? 0, icon: Tag, color: "text-emerald-400" },
    { label: "Vaults", value: stats?.totalVaults ?? 0, icon: FolderOpen, color: "text-amber-400" },
    { label: "Links", value: stats?.totalLinks ?? 0, icon: Share2, color: "text-rose-400" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your knowledge base at a glance</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="bg-card border-card-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-card border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!stats?.recentNotes?.length && (
              <p className="text-muted-foreground">No notes yet. Create your first note!</p>
            )}
            {stats?.recentNotes?.map((note) => (
              <a key={note.id} href={`/notes/${note.id}`}>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-card/80 transition-colors cursor-pointer">
                  <div>
                    <h3 className="font-semibold">{note.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {note.excerpt || note.content.slice(0, 100)}...
                    </p>
                    <div className="flex gap-2 mt-2">
                      {note.tags?.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
