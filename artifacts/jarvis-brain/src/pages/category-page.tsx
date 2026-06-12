import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useVault } from "@/contexts/vault-context";
import { VaultItemCard } from "@/components/vault/vault-item-card";
import { AddItemModal } from "@/components/vault/add-item-modal";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, type VaultCategory, type VaultItem } from "@/lib/vault-types";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

interface CategoryPageProps {
  category: VaultCategory;
}

export function CategoryPage({ category }: CategoryPageProps) {
  const { getItemsByCategory } = useVault();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<VaultItem | null>(null);
  const meta = CATEGORY_META[category];

  const items = getItemsByCategory(category);
  const filtered = search
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{meta.label}</h2>
          <p className="text-sm text-white/35">{items.length} {items.length === 1 ? "item" : "itens"}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={13} /> Novo
        </Button>
      </div>

      {items.length > 3 && (
        <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-white/4 border border-white/6 focus-within:border-[#6e56ff]/40 transition-colors">
          <Search size={14} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Buscar em ${meta.label.toLowerCase()}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="text-5xl mb-4" style={{ filter: "grayscale(0)" }}>
            {getCategoryEmoji(category)}
          </div>
          <h3 className="text-base font-semibold text-white mb-2">
            {search ? "Nenhum resultado" : `Nenhum(a) ${meta.label.toLowerCase()}`}
          </h3>
          {!search && (
            <>
              <p className="text-sm text-white/35 mb-6 max-w-xs">
                Adicione sua(s) primeira(s) {meta.label.toLowerCase()} ao cofre.
              </p>
              <Button variant="primary" onClick={() => setAddOpen(true)}>
                <Plus size={14} /> Adicionar
              </Button>
            </>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-1.5">
            {filtered.map(item => (
              <VaultItemCard key={item.id} item={item} onEdit={setEditItem} view="list" />
            ))}
          </div>
        </AnimatePresence>
      )}

      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl z-30"
        style={{ background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}cc 100%)`, boxShadow: `0 8px 32px ${meta.color}35` }}
      >
        <Plus size={22} className="text-white" />
      </motion.button>

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} defaultCategory={category} />
    </div>
  );
}

function getCategoryEmoji(cat: VaultCategory): string {
  const map: Record<VaultCategory, string> = {
    password: "🔑", totp: "🛡️", email: "📧", site: "🌐", app: "📱",
    server: "🖥️", document: "📄", token: "⚡", card: "💳",
    identity: "👤", note: "📝", license: "🏅", api_key: "#️⃣",
  };
  return map[cat] ?? "📌";
}
