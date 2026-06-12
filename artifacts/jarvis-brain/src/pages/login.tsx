import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { passwordStrength } from "@/lib/crypto";

const spring = { type: "spring" as const, mass: 0.6, stiffness: 320, damping: 28 };

export default function LoginPage() {
  const { login, isFirstSetup } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = isFirstSetup && password ? passwordStrength(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isFirstSetup && password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (isFirstSetup && password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (!ok) setError("Senha incorreta");
  };

  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-black px-4" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(110,86,255,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(110,86,255,0.05) 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring}
        className="relative w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, ...spring }}
            className="h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl mb-5"
            style={{ background: "linear-gradient(135deg, #6e56ff 0%, #9c85ff 100%)", boxShadow: "0 0 40px rgba(110,86,255,0.3)" }}
          >
            <Lock size={28} className="text-white" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
            <h1 className="text-2xl font-bold text-white text-center tracking-tight">NOIR VAULT</h1>
            <p className="text-sm text-white/35 text-center mt-1">
              {isFirstSetup ? "Crie sua senha mestre" : "Desbloqueie seu cofre"}
            </p>
          </motion.div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <div className="flex items-center rounded-2xl border border-white/8 bg-white/[0.04] px-4 focus-within:border-[#6e56ff]/50 transition-colors">
              <Lock size={16} className="text-white/30 shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isFirstSetup ? "Crie uma senha forte" : "Senha mestre"}
                className="flex-1 h-14 bg-transparent text-white placeholder:text-white/25 text-base px-4 outline-none"
                autoFocus
                autoComplete={isFirstSetup ? "new-password" : "current-password"}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-white/25 hover:text-white/60 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {strength && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 px-1">
                <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                  <motion.div
                    animate={{ width: `${(strength.score / 7) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: strength.color }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
              </motion.div>
            )}
          </div>

          {isFirstSetup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center rounded-2xl border border-white/8 bg-white/[0.04] px-4 focus-within:border-[#6e56ff]/50 transition-colors"
            >
              <Shield size={16} className="text-white/30 shrink-0" />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirme a senha"
                className="flex-1 h-14 bg-transparent text-white placeholder:text-white/25 text-base px-4 outline-none"
              />
            </motion.div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-[#ff375f] text-center">
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full h-14 text-base rounded-2xl">
            {isFirstSetup ? "Criar Cofre" : "Desbloquear"}
          </Button>
        </motion.form>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center text-xs text-white/20 mt-8">
          🔒 Zero-knowledge — sua senha nunca sai deste dispositivo
        </motion.p>
      </motion.div>
    </div>
  );
}
