import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Copy, Check } from "lucide-react";
import { generatePassword, passwordStrength } from "@/lib/crypto";
import { copyToClipboard } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface PasswordGeneratorProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (pwd: string) => void;
}

export function PasswordGenerator({ open, onClose, onSelect }: PasswordGeneratorProps) {
  const [length, setLength] = useState(20);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState(() => generatePassword(20));
  const [copied, setCopied] = useState(false);

  const regen = () => setPassword(generatePassword(length, { upper, lower, numbers, symbols }));

  const handleCopy = async () => {
    await copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = passwordStrength(password);

  return (
    <Modal open={open} onClose={onClose} title="Gerador de Senhas">
      <div className="space-y-5">
        {/* Password display */}
        <div className="relative rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className="font-mono text-lg text-white break-all leading-relaxed">{password}</p>
          <div className="mt-3 h-1 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              animate={{ width: `${(strength.score / 7) * 100}%` }}
              className="h-full rounded-full transition-all"
              style={{ backgroundColor: strength.color }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: strength.color }}>{strength.label}</p>
        </div>

        {/* Length slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Comprimento</span>
            <span className="text-sm font-semibold text-white">{length}</span>
          </div>
          <input
            type="range"
            min={8} max={64}
            value={length}
            onChange={e => { setLength(Number(e.target.value)); regen(); }}
            className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-[#6e56ff]"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Maiúsculas (A-Z)", value: upper, setter: setUpper },
            { label: "Minúsculas (a-z)", value: lower, setter: setLower },
            { label: "Números (0-9)", value: numbers, setter: setNumbers },
            { label: "Símbolos (!@#$)", value: symbols, setter: setSymbols },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => { opt.setter(v => !v); regen(); }}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs transition-all ${
                opt.value
                  ? "border-[#6e56ff]/30 bg-[#6e56ff]/10 text-[#9c85ff]"
                  : "border-white/6 bg-white/3 text-white/40"
              }`}
            >
              <div className={`h-4 w-4 rounded flex items-center justify-center shrink-0 ${opt.value ? "bg-[#6e56ff]" : "bg-white/10"}`}>
                {opt.value && <Check size={10} className="text-white" />}
              </div>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={regen} className="flex-1">
            <RefreshCw size={13} /> Gerar Nova
          </Button>
          <Button variant={copied ? "secondary" : "secondary"} onClick={handleCopy} className="flex-1">
            {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar</>}
          </Button>
          {onSelect && (
            <Button variant="primary" onClick={() => { onSelect(password); onClose(); }} className="flex-1">
              Usar Esta
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
