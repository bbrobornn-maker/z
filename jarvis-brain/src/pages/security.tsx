import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, Eye, RefreshCw, Key } from "lucide-react";
import { useVault } from "@/contexts/vault-context";
import { passwordStrength } from "@/lib/crypto";
import { type PasswordItem } from "@/lib/vault-types";
import { Badge } from "@/components/ui/badge";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

export default function SecurityPage() {
  const { items } = useVault();
  const passwords = items.filter(i => i.category === "password" && !i.archived) as PasswordItem[];

  const analysis = passwords.map(item => {
    const s = passwordStrength(item.password || "");
    return { item, strength: s };
  });

  const weak = analysis.filter(a => a.strength.score <= 2);
  const medium = analysis.filter(a => a.strength.score >= 3 && a.strength.score <= 4);
  const strong = analysis.filter(a => a.strength.score >= 5);

  const score = passwords.length
    ? Math.round((strong.length / passwords.length) * 100)
    : 100;

  const checks = [
    {
      label: "Senhas fortes",
      desc: `${strong.length} de ${passwords.length} senhas são fortes`,
      ok: weak.length === 0,
      icon: Key,
    },
    {
      label: "2FA habilitado",
      desc: "Configure autenticação em dois fatores",
      ok: items.filter(i => i.category === "totp" && !i.archived).length > 0,
      icon: ShieldCheck,
    },
    {
      label: "Itens arquivados",
      desc: `${items.filter(i => i.archived).length} itens arquivados`,
      ok: true,
      icon: Lock,
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      {/* Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
        className="p-6 rounded-2xl border border-white/5 bg-[#050505] text-center"
      >
        <div className="relative inline-flex">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="50"
              fill="none" strokeWidth="8" strokeLinecap="round"
              stroke={score >= 80 ? "#30d158" : score >= 50 ? "#ffd60a" : "#ff375f"}
              strokeDasharray={`${2 * Math.PI * 50}`}
              initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - score / 100)}` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-white"
            >
              {score}
            </motion.span>
            <span className="text-xs text-white/40">/ 100</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mt-4">Pontuação de Segurança</h3>
        <p className="text-sm text-white/35 mt-1">
          {score >= 80 ? "Excelente! Seu cofre está bem protegido." :
           score >= 50 ? "Médio. Revise as senhas fracas." :
           "Atenção! Várias senhas precisam ser melhoradas."}
        </p>
      </motion.div>

      {/* Checks */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">Verificações</h3>
        {checks.map((check, i) => {
          const Icon = check.icon;
          return (
            <motion.div
              key={check.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: i * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-[#050505]"
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${check.ok ? "bg-[#30d158]/12" : "bg-[#ff375f]/12"}`}>
                <Icon size={16} className={check.ok ? "text-[#30d158]" : "text-[#ff375f]"} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{check.label}</div>
                <div className="text-xs text-white/35">{check.desc}</div>
              </div>
              {check.ok
                ? <CheckCircle2 size={16} className="text-[#30d158]" />
                : <AlertTriangle size={16} className="text-[#ffd60a]" />
              }
            </motion.div>
          );
        })}
      </div>

      {/* Weak passwords */}
      {weak.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#ff375f]/70 uppercase tracking-widest">Senhas Fracas ({weak.length})</h3>
          {weak.map(({ item }, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.04 }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-[#ff375f]/15 bg-[#ff375f]/5"
            >
              <AlertTriangle size={14} className="text-[#ff375f] shrink-0" />
              <span className="text-sm text-white flex-1">{item.name}</span>
              <Badge variant="danger">Fraca</Badge>
            </motion.div>
          ))}
        </div>
      )}

      {/* Strong */}
      {strong.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#30d158]/70 uppercase tracking-widest">Senhas Fortes ({strong.length})</h3>
          {strong.slice(0, 5).map(({ item }, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.04 }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-[#30d158]/10 bg-[#30d158]/5"
            >
              <CheckCircle2 size={14} className="text-[#30d158] shrink-0" />
              <span className="text-sm text-white flex-1">{item.name}</span>
              <Badge variant="success">Forte</Badge>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
