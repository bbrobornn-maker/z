import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Copy, Eye, EyeOff, Pencil, Archive, Trash2, MoreHorizontal } from "lucide-react";
import { type VaultItem, CATEGORY_META } from "@/lib/vault-types";
import { cn, copyToClipboard, maskPassword, getFaviconUrl, timeAgo } from "@/lib/utils";
import { useVault } from "@/contexts/vault-context";
import { useToast } from "@/components/ui/toast-context";
import { AnimatePresence } from "framer-motion";

interface VaultItemCardProps {
  item: VaultItem;
  onEdit?: (item: VaultItem) => void;
  view?: "grid" | "list";
}

const spring = { type: "spring" as const, mass: 0.5, stiffness: 350, damping: 26 };

export function VaultItemCard({ item, onEdit, view = "list" }: VaultItemCardProps) {
  const { toggleFavorite, archiveItem, deleteItem } = useVault();
  const { toast } = useToast();
  const [revealed, setRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = CATEGORY_META[item.category];

  const getSubtitle = () => {
    if (item.category === "password") return (item as any).username || (item as any).url || "";
    if (item.category === "email") return (item as any).email || "";
    if (item.category === "totp") return (item as any).issuer || "";
    if (item.category === "server") return `${(item as any).username}@${(item as any).host}` || "";
    if (item.category === "site") return (item as any).url || "";
    if (item.category === "api_key") return (item as any).service || "";
    return item.category;
  };

  const getSecret = () => {
    if (item.category === "password") return (item as any).password || "";
    if (item.category === "token") return (item as any).token || "";
    if (item.category === "api_key") return (item as any).key || "";
    if (item.category === "totp") return (item as any).secret || "";
    if (item.category === "card") return (item as any).cardNumber || "";
    return "";
  };

  const secret = getSecret();
  const favUrl = item.category === "password" || item.category === "site"
    ? getFaviconUrl((item as any).url || (item as any).host || "")
    : "";

  const handleCopy = async (text: string, label: string) => {
    await copyToClipboard(text);
    toast(`${label} copiado!`);
  };

  if (view === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={spring}
        className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/5 bg-[#050505] hover:bg-[#090909] hover:border-white/8 transition-all duration-100 cursor-default"
      >
        {/* Icon */}
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ backgroundColor: meta.color + "18", color: meta.color }}
        >
          {favUrl ? (
            <img src={favUrl} alt="" className="h-5 w-5 rounded" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            item.name.slice(0, 1).toUpperCase()
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{item.name}</span>
            {item.favorite && <Star size={10} className="text-[#ffd60a] fill-[#ffd60a] shrink-0" />}
          </div>
          <div className="text-xs text-white/35 truncate">{getSubtitle()}</div>
        </div>

        {/* Secret preview */}
        {secret && (
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <span className="text-xs text-white/25 font-mono truncate max-w-[120px]">
              {revealed ? secret.slice(0, 20) + (secret.length > 20 ? "…" : "") : maskPassword(secret)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {secret && (
            <>
              <button
                onClick={() => setRevealed(v => !v)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-colors"
              >
                {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                onClick={() => handleCopy(secret, "Senha")}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-colors"
              >
                <Copy size={13} />
              </button>
            </>
          )}
          <button
            onClick={() => toggleFavorite(item.id)}
            className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
              item.favorite ? "text-[#ffd60a]" : "text-white/30 hover:text-white hover:bg-white/8"
            )}
          >
            <Star size={13} className={item.favorite ? "fill-[#ffd60a]" : ""} />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-colors"
            >
              <MoreHorizontal size={13} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ type: "spring", mass: 0.4, stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-8 z-20 w-44 glass-panel rounded-xl shadow-xl py-1"
                  >
                    {onEdit && (
                      <button onClick={() => { setMenuOpen(false); onEdit(item); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                        <Pencil size={13} /> Editar
                      </button>
                    )}
                    <button onClick={() => { setMenuOpen(false); archiveItem(item.id); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      <Archive size={13} /> Arquivar
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button onClick={() => { setMenuOpen(false); deleteItem(item.id); toast("Item excluído", "error"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#ff375f] hover:bg-[#ff375f]/8 transition-colors">
                      <Trash2 size={13} /> Excluir
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={spring}
      className="group p-4 rounded-2xl border border-white/5 bg-[#050505] hover:bg-[#090909] hover:border-white/8 transition-all duration-100 cursor-default flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: meta.color + "18", color: meta.color }}
        >
          {favUrl ? (
            <img src={favUrl} alt="" className="h-6 w-6 rounded" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            item.name.slice(0, 1).toUpperCase()
          )}
        </div>
        <button
          onClick={() => toggleFavorite(item.id)}
          className={cn("opacity-0 group-hover:opacity-100 transition-opacity",
            item.favorite ? "opacity-100 text-[#ffd60a]" : "text-white/20")}
        >
          <Star size={14} className={item.favorite ? "fill-[#ffd60a]" : ""} />
        </button>
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-white truncate">{item.name}</div>
        <div className="text-xs text-white/35 truncate mt-0.5">{getSubtitle()}</div>
      </div>
      <div className="flex items-center gap-1.5 pt-1 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
        {secret && (
          <button onClick={() => handleCopy(secret, "Senha")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 text-xs text-white/60 hover:text-white transition-colors">
            <Copy size={11} /> Copiar
          </button>
        )}
        {onEdit && (
          <button onClick={() => onEdit(item)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 text-xs text-white/60 hover:text-white transition-colors">
            <Pencil size={11} /> Editar
          </button>
        )}
      </div>
    </motion.div>
  );
}
