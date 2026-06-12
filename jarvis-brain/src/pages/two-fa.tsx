import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Copy, RefreshCw, QrCode, Search } from "lucide-react";
import { useVault } from "@/contexts/vault-context";
import { useToast } from "@/components/ui/toast";
import { generateTOTP, getTimeRemaining, getTimeProgress, formatCode, parseTOTPUri } from "@/lib/totp";
import { type TOTPItem } from "@/lib/vault-types";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { AddItemModal } from "@/components/vault/add-item-modal";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

interface TOTPCardProps {
  item: TOTPItem;
}

function TOTPCard({ item }: TOTPCardProps) {
  const [code, setCode] = useState(() => generateTOTP(item));
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(item.period ?? 30));
  const [progress, setProgress] = useState(() => getTimeProgress(item.period ?? 30));
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const period = item.period ?? 30;

  useEffect(() => {
    const tick = () => {
      const remaining = getTimeRemaining(period);
      const prog = getTimeProgress(period);
      setTimeLeft(remaining);
      setProgress(prog);
      if (remaining === period) {
        setCode(generateTOTP(item));
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [item, period]);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    toast("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrgent = timeLeft <= 5;
  const accent = isUrgent ? "#ff375f" : timeLeft <= 10 ? "#ffd60a" : "#6e56ff";

  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference * (1 - progress);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={spring}
      className="p-4 rounded-2xl border border-white/5 bg-[#050505] hover:bg-[#090909] transition-colors cursor-default"
    >
      <div className="flex items-center gap-4">
        {/* Circular countdown */}
        <div className="relative h-12 w-12 shrink-0">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <motion.circle
              cx="24" cy="24" r="20"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              stroke={accent}
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.5 }}
              style={{ filter: `drop-shadow(0 0 4px ${accent}60)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-mono font-semibold" style={{ color: accent }}>{timeLeft}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/35 mb-0.5">{item.issuer || item.name}</div>
          <motion.div
            key={code}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="code-digit text-2xl font-bold tracking-widest"
            style={{ color: isUrgent ? "#ff375f" : "white" }}
          >
            {formatCode(code)}
          </motion.div>
          {item.issuer !== item.name && (
            <div className="text-xs text-white/25 mt-0.5 truncate">{item.name}</div>
          )}
        </div>

        {/* Copy button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCopy}
          className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
          style={{
            backgroundColor: copied ? "#30d15820" : "rgba(255,255,255,0.05)",
            color: copied ? "#30d158" : "rgba(255,255,255,0.4)"
          }}
        >
          {copied ? <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }}>✓</motion.span> : <Copy size={14} />}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function TwoFAPage() {
  const { getItemsByCategory } = useVault();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [uriInput, setUriInput] = useState("");
  const [uriOpen, setUriOpen] = useState(false);

  const totpItems = getItemsByCategory("totp") as TOTPItem[];
  const filtered = totpItems.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.issuer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">2FA / TOTP</h2>
          <p className="text-sm text-white/35">{totpItems.length} autenticadores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setUriOpen(true)}>
            <QrCode size={13} /> URI
          </Button>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={13} /> Adicionar
          </Button>
        </div>
      </div>

      {/* Search */}
      {totpItems.length > 3 && (
        <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-white/4 border border-white/6 focus-within:border-[#6e56ff]/40 transition-colors">
          <Search size={14} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar autenticador..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
          />
        </div>
      )}

      {/* TOTP Cards */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-base font-semibold text-white mb-2">Nenhum autenticador</h3>
          <p className="text-sm text-white/35 mb-6 max-w-xs">Adicione seus códigos TOTP para acesso seguro.</p>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Adicionar 2FA
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filtered.map(item => (
              <TOTPCard key={item.id} item={item} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Add from URI Modal */}
      <Modal open={uriOpen} onClose={() => setUriOpen(false)} title="Importar via URI TOTP">
        <div className="space-y-4">
          <p className="text-sm text-white/50">Cole a URI do tipo <code className="text-[#6e56ff]">otpauth://totp/...</code> gerada pelo app.</p>
          <Input
            label="URI TOTP"
            value={uriInput}
            onChange={e => setUriInput(e.target.value)}
            placeholder="otpauth://totp/..."
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setUriOpen(false)} className="flex-1">Cancelar</Button>
            <Button variant="primary" className="flex-1" onClick={() => {
              const parsed = parseTOTPUri(uriInput);
              if (parsed) {
                setUriOpen(false);
                setAddOpen(true);
              }
            }}>
              Importar
            </Button>
          </div>
        </div>
      </Modal>

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} defaultCategory="totp" />
    </div>
  );
}
