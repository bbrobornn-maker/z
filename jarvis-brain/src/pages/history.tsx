import { motion } from "framer-motion";
import { useVault } from "@/contexts/vault-context";
import { CATEGORY_META, type VaultCategory } from "@/lib/vault-types";
import { timeAgo, formatDateTime } from "@/lib/utils";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

export default function HistoryPage() {
  const { items } = useVault();

  const recent = [...items]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">Histórico</h2>
        <p className="text-sm text-white/35">Atividade recente no cofre</p>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">🕐</div>
          <p className="text-white/30 text-sm">Nenhuma atividade ainda.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {recent.map((item, i) => {
            const meta = CATEGORY_META[item.category as VaultCategory];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: Math.min(i * 0.025, 0.4) }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 bg-[#050505]"
              >
                <div className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: meta.color + "18", color: meta.color }}>
                  {item.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{item.name}</div>
                  <div className="text-xs text-white/35">{meta.label}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-white/25">{timeAgo(item.updatedAt)}</div>
                  {item.archived && (
                    <div className="text-[10px] text-[#ffd60a] mt-0.5">Arquivado</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
