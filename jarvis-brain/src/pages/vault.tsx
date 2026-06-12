import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, LayoutGrid, List, SlidersHorizontal, Star, Archive } from "lucide-react";
import { useVault } from "@/contexts/vault-context";
import { VaultItemCard } from "@/components/vault/vault-item-card";
import { AddItemModal } from "@/components/vault/add-item-modal";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, type VaultItem, type VaultCategory } from "@/lib/vault-types";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

type FilterType = "all" | "favorites" | "archived" | VaultCategory;

export default function VaultPage() {
  const { items, stats } = useVault();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [filter, setFilter] = useState<FilterType>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<VaultItem | null>(null);

  const categories = Object.keys(CATEGORY_META) as VaultCategory[];

  const filtered = useMemo(() => {
    let result = items;
    if (filter === "favorites") result = result.filter(i => i.favorite);
    else if (filter === "archived") result = result.filter(i => i.archived);
    else if (filter === "all") result = result.filter(i => !i.archived);
    else result = result.filter(i => i.category === filter && !i.archived);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i => {
        if (i.name.toLowerCase().includes(q)) return true;
        if ((i as any).username?.toLowerCase().includes(q)) return true;
        if ((i as any).email?.toLowerCase().includes(q)) return true;
        if ((i as any).url?.toLowerCase().includes(q)) return true;
        if (i.tags.some(t => t.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    return result.sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [items, filter, search]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-white/4 border border-white/6 focus-within:border-[#6e56ff]/40 transition-colors">
          <Search size={14} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar no cofre..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
          />
        </div>

        {/* Filters + view toggle */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          <div className="flex gap-1 shrink-0">
            {(["all", "favorites"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  filter === f ? "bg-[#6e56ff]/20 text-[#9c85ff]" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                {f === "favorites" && <Star size={11} />}
                {f === "all" ? "Todos" : "Favoritos"}
              </button>
            ))}
            {categories.map(cat => {
              const count = stats.categories[cat];
              if (!count) return null;
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                    filter === cat
                      ? "text-white border"
                      : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                  style={filter === cat ? { backgroundColor: meta.color + "18", borderColor: meta.color + "30", color: meta.color } : {}}
                >
                  {meta.label.split(" ")[0]}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <button onClick={() => setView("list")} className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-colors", view === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white")}>
              <List size={14} />
            </button>
            <button onClick={() => setView("grid")} className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-colors", view === "grid" ? "bg-white/10 text-white" : "text-white/30 hover:text-white")}>
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-white/30 text-sm">Nenhum item encontrado</p>
            {!search && filter === "all" && (
              <Button variant="primary" className="mt-6" onClick={() => setAddOpen(true)}>
                <Plus size={14} /> Adicionar Item
              </Button>
            )}
          </motion.div>
        ) : view === "list" ? (
          <AnimatePresence mode="popLayout">
            <div className="space-y-1.5">
              {filtered.map(item => (
                <VaultItemCard key={item.id} item={item} onEdit={setEditItem} view="list" />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(item => (
                <VaultItemCard key={item.id} item={item} onEdit={setEditItem} view="grid" />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl z-30"
        style={{ background: "linear-gradient(135deg, #6e56ff 0%, #9c85ff 100%)", boxShadow: "0 8px 32px rgba(110,86,255,0.35)" }}
      >
        <Plus size={22} className="text-white" />
      </motion.button>

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
