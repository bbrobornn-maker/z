import { motion } from "framer-motion";
import { ShieldCheck, Plus, Eye, Pencil, Trash2, Download, LogIn, LogOut, Lock } from "lucide-react";
import { useVault } from "@/contexts/vault-context";
import { type AuditEntry } from "@/lib/vault-types";
import { formatDateTime } from "@/lib/utils";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

const ACTION_META: Record<AuditEntry["action"], { label: string; icon: typeof ShieldCheck; color: string }> = {
  create: { label: "Criou", icon: Plus, color: "#30d158" },
  read: { label: "Visualizou", icon: Eye, color: "#6e56ff" },
  update: { label: "Atualizou", icon: Pencil, color: "#0a84ff" },
  delete: { label: "Excluiu", icon: Trash2, color: "#ff375f" },
  export: { label: "Exportou", icon: Download, color: "#ffd60a" },
  login: { label: "Login", icon: LogIn, color: "#30d158" },
  logout: { label: "Logout", icon: LogOut, color: "#8e8e93" },
};

export default function AuditPage() {
  const { auditLog } = useVault();

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">Log de Auditoria</h2>
        <p className="text-sm text-white/35">{auditLog.length} eventos registrados</p>
      </div>

      {auditLog.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-white/30 text-sm">Nenhuma atividade registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {auditLog.map((entry, i) => {
            const meta = ACTION_META[entry.action] ?? ACTION_META.read;
            const Icon = meta.icon;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: Math.min(i * 0.02, 0.3) }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-[#050505]"
              >
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: meta.color + "15" }}>
                  <Icon size={12} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    <span style={{ color: meta.color }}>{meta.label}</span>
                    {entry.itemName && <span className="text-white/60"> "{entry.itemName}"</span>}
                  </div>
                  {entry.category && (
                    <div className="text-xs text-white/30">{entry.category}</div>
                  )}
                </div>
                <span className="text-xs text-white/25 shrink-0">{formatDateTime(entry.timestamp)}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
