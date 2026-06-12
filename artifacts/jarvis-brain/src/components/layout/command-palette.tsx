import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Search, Key, Shield, Mail, Globe, Server, Hash, ArrowRight } from "lucide-react";
import { useVault } from "@/contexts/vault-context";
import { CATEGORY_META, type VaultCategory } from "@/lib/vault-types";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Dashboard", path: "/", icon: "🏠" },
  { label: "Cofre de Senhas", path: "/vault", icon: "🔑" },
  { label: "Autenticação 2FA", path: "/2fa", icon: "🛡️" },
  { label: "E-mails", path: "/emails", icon: "📧" },
  { label: "Sites", path: "/sites", icon: "🌐" },
  { label: "Servidores", path: "/servers", icon: "🖥️" },
  { label: "Configurações", path: "/settings", icon: "⚙️" },
  { label: "Segurança", path: "/security", icon: "🔒" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const spring = { type: "spring" as const, mass: 0.5, stiffness: 380, damping: 28 };

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [, navigate] = useLocation();
  const { searchItems } = useVault();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const vaultResults = query ? searchItems(query).slice(0, 5) : [];
  const actionResults = query
    ? QUICK_ACTIONS.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : QUICK_ACTIONS;

  const allResults = [
    ...vaultResults.map(item => ({ type: "vault" as const, item })),
    ...actionResults.map(a => ({ type: "action" as const, action: a })),
  ];

  const handleSelect = useCallback((idx: number) => {
    const result = allResults[idx];
    if (!result) return;
    if (result.type === "action") {
      navigate(result.action.path);
    } else {
      navigate(`/vault?highlight=${result.item.id}`);
    }
    onClose();
  }, [allResults, navigate, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, allResults.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); handleSelect(selectedIdx); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, allResults.length, selectedIdx, handleSelect, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={spring}
            className="relative w-full max-w-xl glass-panel rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/6">
              <Search size={16} className="text-white/30 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
                placeholder="Buscar no cofre..."
                className="flex-1 bg-transparent text-white placeholder:text-white/25 text-sm outline-none"
              />
              <kbd className="text-[10px] text-white/20 border border-white/8 rounded px-1.5 py-0.5 font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto py-2">
              {vaultResults.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest">Cofre</div>
                  {vaultResults.map((item, idx) => {
                    const meta = CATEGORY_META[item.category as VaultCategory];
                    const globalIdx = idx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(globalIdx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          selectedIdx === globalIdx ? "bg-[#6e56ff]/15" : "hover:bg-white/4"
                        )}
                      >
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs"
                          style={{ backgroundColor: meta.color + "20", color: meta.color }}>
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{item.name}</div>
                          <div className="text-xs text-white/35">{meta.label}</div>
                        </div>
                        <ArrowRight size={13} className="text-white/20" />
                      </button>
                    );
                  })}
                </div>
              )}

              {actionResults.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                    {vaultResults.length > 0 ? "Navegação" : "Ações"}
                  </div>
                  {actionResults.map((action, idx) => {
                    const globalIdx = vaultResults.length + idx;
                    return (
                      <button
                        key={action.path}
                        onClick={() => handleSelect(globalIdx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          selectedIdx === globalIdx ? "bg-[#6e56ff]/15" : "hover:bg-white/4"
                        )}
                      >
                        <span className="text-base w-7 text-center">{action.icon}</span>
                        <span className="text-sm text-white flex-1">{action.label}</span>
                        <ArrowRight size={13} className="text-white/20" />
                      </button>
                    );
                  })}
                </div>
              )}

              {allResults.length === 0 && (
                <div className="px-4 py-8 text-center text-white/25 text-sm">
                  Nenhum resultado para "{query}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5 text-[10px] text-white/20">
              <span><kbd className="font-mono">↑↓</kbd> navegar</span>
              <span><kbd className="font-mono">↵</kbd> selecionar</span>
              <span><kbd className="font-mono">ESC</kbd> fechar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
