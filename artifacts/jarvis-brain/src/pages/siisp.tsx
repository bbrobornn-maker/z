import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Users, Search, Eye, X, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SiispPerson {
  nome: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  pai: string;
  mae: string;
  naturalidade: string;
  sexo: string;
  foto_url: string;
  foto_base64: string | null;
  foto_tamanho: number;
}

interface SiispResponse {
  total: number;
  people: SiispPerson[];
}

export default function SiispPage() {
  const [data, setData] = useState<SiispResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SiispPerson | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 24;

  useEffect(() => {
    const baseUrl = window.location.origin;
    fetch(`${baseUrl}/api/siisp`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data.people;
    const q = query.toLowerCase();
    return data.people.filter((p) =>
      p.nome?.toLowerCase().includes(q) ||
      p.cpf?.includes(q) ||
      p.rg?.toLowerCase().includes(q) ||
      p.mae?.toLowerCase().includes(q) ||
      p.pai?.toLowerCase().includes(q)
    );
  }, [data, query]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [query]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 font-semibold">Erro ao carregar dados</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SIISP MA</h1>
            <p className="text-sm text-muted-foreground">
              Sistema Penitenciário do Maranhão — {data?.total} registros
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{filtered.length} filtrados</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, CPF, RG, mãe ou pai..."
          className="pl-10"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {paginated.map((person, idx) => (
          <Card
            key={idx}
            className="bg-card border-card-border cursor-pointer hover:border-primary/50 transition-all overflow-hidden group"
            onClick={() => setSelected(person)}
          >
            <div className="relative h-32 bg-gradient-to-b from-primary/5 to-transparent flex items-center justify-center">
              {person.foto_base64 ? (
                <img
                  src={person.foto_base64}
                  alt={person.nome}
                  className="h-28 w-24 object-cover rounded-md border border-border"
                />
              ) : (
                <div className="h-28 w-24 rounded-md bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-4 w-4 text-primary" />
              </div>
            </div>
            <CardContent className="p-3">
              <p className="font-semibold text-sm truncate" title={person.nome}>
                {person.nome || "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {person.cpf ? `CPF: ${person.cpf}` : "CPF: —"}
              </p>
              <p className="text-xs text-muted-foreground">
                {person.data_nascimento || "Nasc: —"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {person.sexo || "N/A"}
                </span>
                {person.foto_base64 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    Foto
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <Card
            className="w-full max-w-md bg-card border-card-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Detalhes</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                {selected.foto_base64 ? (
                  <img
                    src={selected.foto_base64}
                    alt={selected.nome}
                    className="h-32 w-28 object-cover rounded-md border border-border"
                  />
                ) : (
                  <div className="h-32 w-28 rounded-md bg-muted flex items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold">{selected.nome || "—"}</p>
                  <p className="text-sm text-muted-foreground">{selected.sexo || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">CPF</p>
                  <p className="font-mono">{selected.cpf || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">RG</p>
                  <p className="font-mono">{selected.rg || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Nascimento</p>
                  <p>{selected.data_nascimento || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Naturalidade</p>
                  <p>{selected.naturalidade || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Pai</p>
                  <p>{selected.pai || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Mãe</p>
                  <p>{selected.mae || "—"}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
