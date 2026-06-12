import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useVault } from "@/contexts/vault-context";
import { CATEGORY_META, type VaultCategory } from "@/lib/vault-types";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { searchItems } = useVault();
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const results = query.length >= 2 ? searchItems(query) : [];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex items-center gap-3 px-4 h-12 rounded-2xl border border-white/8 bg-white/4 focus-within:border-[#6e56ff]/50 transition-colors"
      >
        <Search size={16} className="text-white/30 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar no cofre..."
          className="flex-1 bg-transparent text-white placeholder:text-white/25 text-base outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-white/30 hover:text-white transition-colors">
            <X size={15} />
          </button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {query.length < 2 ? (
          <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-12 text-white/20 text-sm">
            Digite pelo menos 2 caracteres
          </motion.div>
        ) : results.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-12">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-white/30 text-sm">Nenhum resultado para "{query}"</p>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-xs text-white/25 mb-3">{results.length} resultado{results.length !== 1 ? "s" : ""}</p>
            <div className="space-y-1.5">
              {results.map((item, i) => {
                const meta = CATEGORY_META[item.category as VaultCategory];
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: i * 0.03 }}
                    onClick={() => navigate("/vault")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-[#050505] hover:bg-[#090909] text-left transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: meta.color + "18", color: meta.color }}>
                      {item.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{item.name}</div>
                      <div className="text-xs text-white/35">{meta.label}</div>
                    </div>
                    <ArrowRight size={13} className="text-white/20 shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
