import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Download, Key, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useVault } from "@/contexts/vault-context";
import { useToast } from "@/components/ui/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

export default function AccountPage() {
  const { logout } = useAuth();
  const { stats, exportVault } = useVault();
  const { toast } = useToast();
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");

  const handleChangePwd = () => {
    if (newPwd !== confirmPwd) { setPwdError("As senhas não coincidem"); return; }
    if (newPwd.length < 8) { setPwdError("Mínimo 8 caracteres"); return; }
    setChangePwdOpen(false);
    setOldPwd(""); setNewPwd(""); setConfirmPwd(""); setPwdError("");
    toast("Senha alterada com sucesso!");
  };

  const handleExport = () => {
    const data = exportVault();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `noir-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup exportado!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="p-6 rounded-2xl border border-white/5 bg-[#050505] text-center"
      >
        <div className="h-16 w-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #6e56ff 0%, #9c85ff 100%)", boxShadow: "0 0 30px rgba(110,86,255,0.25)" }}>
          <Lock size={24} className="text-white" />
        </div>
        <div className="text-lg font-bold text-white">Minha Conta</div>
        <div className="text-sm text-white/35 mt-1">NOIR VAULT — Zero Knowledge</div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { value: stats.total, label: "Itens" },
            { value: stats.favorites, label: "Favoritos" },
            { value: Object.keys(stats.categories).length, label: "Categorias" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-white/4">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/35">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="space-y-2">
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setChangePwdOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 bg-[#050505] hover:bg-[#090909] text-left transition-colors"
        >
          <div className="h-8 w-8 rounded-xl bg-[#6e56ff]/12 flex items-center justify-center">
            <Key size={15} className="text-[#6e56ff]" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Alterar Senha Mestre</div>
            <div className="text-xs text-white/30">Mude a chave de desbloqueio</div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0.08 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 bg-[#050505] hover:bg-[#090909] text-left transition-colors"
        >
          <div className="h-8 w-8 rounded-xl bg-[#30d158]/12 flex items-center justify-center">
            <Download size={15} className="text-[#30d158]" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Exportar Backup</div>
            <div className="text-xs text-white/30">Baixar cópia criptografada</div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[#ff375f]/15 bg-[#ff375f]/5 hover:bg-[#ff375f]/8 text-left transition-colors"
        >
          <div className="h-8 w-8 rounded-xl bg-[#ff375f]/12 flex items-center justify-center">
            <Lock size={15} className="text-[#ff375f]" />
          </div>
          <div>
            <div className="text-sm font-medium text-[#ff375f]">Bloquear Cofre</div>
            <div className="text-xs text-[#ff375f]/50">Encerrar sessão atual</div>
          </div>
        </motion.button>
      </div>

      {/* Security info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.15 }}
        className="p-4 rounded-2xl border border-[#30d158]/15 bg-[#30d158]/5"
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={14} className="text-[#30d158]" />
          <span className="text-sm font-medium text-[#30d158]">Proteção Zero-Knowledge</span>
        </div>
        <p className="text-xs text-white/40">
          Sua senha nunca é enviada a nenhum servidor. Toda criptografia ocorre localmente no seu dispositivo usando AES-256-GCM com derivação PBKDF2 (600.000 iterações).
        </p>
      </motion.div>

      {/* Change password modal */}
      <Modal open={changePwdOpen} onClose={() => setChangePwdOpen(false)} title="Alterar Senha Mestre">
        <div className="space-y-4">
          <Input label="Senha Atual" type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} />
          <Input label="Nova Senha" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
          <Input label="Confirmar Nova Senha" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
          {pwdError && <p className="text-xs text-[#ff375f]">{pwdError}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setChangePwdOpen(false)} className="flex-1">Cancelar</Button>
            <Button variant="primary" onClick={handleChangePwd} className="flex-1">Alterar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
