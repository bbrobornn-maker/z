import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Key, Shield, Mail, Server, Star, Plus, ArrowRight } from "lucide-react";
import { useVault } from "@/contexts/vault-context";
import { CATEGORY_META, type VaultCategory } from "@/lib/vault-types";
import { Button } from "@/components/ui/button";
import { AddItemModal } from "@/components/vault/add-item-modal";
import { timeAgo } from "@/lib/utils";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

const STAT_CARDS = [
  { cat: "password" as VaultCategory, label: "Senhas", icon: Key, path: "/vault" },
  { cat: "totp" as VaultCategory, label: "2FA", icon: Shield, path: "/2fa" },
  { cat: "email" as VaultCategory, label: "E-mails", icon: Mail, path: "/emails" },
  { cat: "server" as VaultCategory, label: "Servidores", icon: Server, path: "/servers" },
];

const QUICK_ACCESS = [
  { path: "/vault", label: "Senhas", emoji: "🔑" },
  { path: "/2fa", label: "2FA", emoji: "🛡️" },
  { path: "/emails", label: "E-mails", emoji: "📧" },
  { path: "/sites", label: "Sites", emoji: "🌐" },
  { path: "/servers", label: "Servers", emoji: "🖥️" },
  { path: "/tokens", label: "Tokens", emoji: "⚡" },
  { path: "/cards", label: "Cartões", emoji: "💳" },
  { path: "/notes", label: "Notas", emoji: "📝" },
];

export default function Dashboard() {
  const { stats, items } = useVault();
  const [, navigate] = useLocation();
  const [addOpen, setAddOpen] = useState(false);

  const recentItems = [...items]
    .filter(i => !i.archived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const favorites = items.filter(i => i.favorite && !i.archived).slice(0, 4);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Bom dia 👋</h2>
          <p className="text-sm text-white/35 mt-0.5">{stats.total} itens protegidos</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
          <Plus size={14} /> Novo
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          const count = stats.categories[card.cat] ?? 0;
          const meta = CATEGORY_META[card.cat];
          return (
            <motion.button
              key={card.cat}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(card.path)}
              className="p-4 rounded-2xl border border-white/5 bg-[#050505] hover:bg-[#090909] hover:border-white/8 text-left transition-all"
            >
              <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: meta.color + "18" }}>
                <Icon size={16} style={{ color: meta.color }} />
              </div>
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-xs text-white/35 mt-0.5">{card.label}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Quick Access */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }}>
        <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Acesso Rápido</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {QUICK_ACCESS.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: 0.15 + i * 0.03 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/5 hover:bg-white/4 hover:border-white/8 transition-all"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[10px] text-white/40">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.15 }}>
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Favoritos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {favorites.map((item, i) => {
              const meta = CATEGORY_META[item.category as VaultCategory];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.2 + i * 0.04 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/5 bg-[#050505] hover:bg-[#090909] transition-colors cursor-default"
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: meta.color + "18", color: meta.color }}>
                    {item.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.name}</div>
                    <div className="text-xs text-white/35">{meta.label}</div>
                  </div>
                  <Star size={12} className="text-[#ffd60a] fill-[#ffd60a] shrink-0" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent */}
      {recentItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">Recentes</h3>
            <button onClick={() => navigate("/vault")} className="text-xs text-[#6e56ff] flex items-center gap-1">
              Ver tudo <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-1.5">
            {recentItems.map((item, i) => {
              const meta = CATEGORY_META[item.category as VaultCategory];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.25 + i * 0.03 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-[#050505] hover:bg-[#090909] transition-colors cursor-default"
                >
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: meta.color + "18", color: meta.color }}>
                    {item.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white truncate block">{item.name}</span>
                  </div>
                  <span className="text-xs text-white/25 shrink-0">{timeAgo(item.updatedAt)}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {stats.total === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, ...spring }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-white mb-2">Cofre vazio</h3>
          <p className="text-sm text-white/35 mb-6 max-w-xs">Comece adicionando suas senhas e dados sensíveis.</p>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Adicionar Primeiro Item
          </Button>
        </motion.div>
      )}

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
