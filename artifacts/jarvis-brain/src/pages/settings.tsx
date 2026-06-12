import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Upload, Trash2, Lock, ShieldCheck, Moon, Palette, ChevronRight, LogOut } from "lucide-react";
import { useVault } from "@/contexts/vault-context";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/toast-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

const spring = { type: "spring" as const, mass: 0.5, stiffness: 320, damping: 26 };

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

function SettingRow({ icon, label, desc, action, onClick, danger }: SettingRowProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 bg-[#050505] hover:bg-[#090909] text-left transition-colors ${danger ? "hover:border-[#ff375f]/20" : ""}`}
    >
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-[#ff375f]/12 text-[#ff375f]" : "bg-white/6 text-white/50"}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`text-sm font-medium ${danger ? "text-[#ff375f]" : "text-white"}`}>{label}</div>
        {desc && <div className="text-xs text-white/30 mt-0.5">{desc}</div>}
      </div>
      {action ?? <ChevronRight size={14} className="text-white/20" />}
    </motion.button>
  );
}

export default function SettingsPage() {
  const { exportVault, importVault, items } = useVault();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearInput, setClearInput] = useState("");

  const handleExport = () => {
    const data = exportVault();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `noir-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Cofre exportado com sucesso!");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          importVault(data);
          toast("Cofre importado com sucesso!");
        } catch {
          toast("Arquivo inválido", "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearVault = () => {
    if (clearInput !== "APAGAR") return;
    importVault({ version: 1, items: [], auditLog: [] });
    setClearConfirm(false);
    setClearInput("");
    toast("Cofre limpo!", "error");
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="p-5 rounded-2xl border border-white/5 bg-[#050505] text-center"
      >
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "linear-gradient(135deg, #6e56ff 0%, #9c85ff 100%)" }}>
          <Lock size={20} className="text-white" />
        </div>
        <div className="text-base font-bold text-white">NOIR VAULT</div>
        <div className="text-xs text-white/30 mt-1">v1.0.0 — Zero Knowledge</div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-white/25">
          <span>{items.filter(i => !i.archived).length} itens</span>
          <span>•</span>
          <span>{items.filter(i => i.favorite).length} favoritos</span>
        </div>
      </motion.div>

      {/* Data */}
      <div>
        <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 px-1">Dados</h3>
        <div className="space-y-1.5">
          <SettingRow
            icon={<Download size={15} />}
            label="Exportar Cofre"
            desc="Baixar backup JSON do cofre"
            onClick={handleExport}
          />
          <SettingRow
            icon={<Upload size={15} />}
            label="Importar Cofre"
            desc="Restaurar de backup JSON"
            onClick={handleImport}
          />
        </div>
      </div>

      {/* Security */}
      <div>
        <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 px-1">Segurança</h3>
        <div className="space-y-1.5">
          <SettingRow
            icon={<ShieldCheck size={15} />}
            label="Revisão de Segurança"
            desc="Analise a força das senhas"
            onClick={() => {}}
          />
          <SettingRow
            icon={<Lock size={15} />}
            label="Bloquear Cofre"
            desc="Encerrar sessão atual"
            onClick={logout}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-xs font-semibold text-[#ff375f]/50 uppercase tracking-widest mb-2 px-1">Zona de Perigo</h3>
        <div className="space-y-1.5">
          <SettingRow
            icon={<Trash2 size={15} />}
            label="Limpar Todo o Cofre"
            desc="Apaga permanentemente todos os dados"
            onClick={() => setClearConfirm(true)}
            danger
          />
          <SettingRow
            icon={<LogOut size={15} />}
            label="Sair"
            onClick={logout}
            danger
          />
        </div>
      </div>

      {/* Clear confirm modal */}
      <Modal open={clearConfirm} onClose={() => { setClearConfirm(false); setClearInput(""); }} title="Limpar Cofre">
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Esta ação é <strong className="text-[#ff375f]">irreversível</strong>. Todos os {items.length} itens serão apagados permanentemente.
          </p>
          <Input
            label='Digite "APAGAR" para confirmar'
            value={clearInput}
            onChange={e => setClearInput(e.target.value)}
            placeholder="APAGAR"
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setClearConfirm(false)} className="flex-1">Cancelar</Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={clearInput !== "APAGAR"}
              onClick={handleClearVault}
            >
              Apagar Tudo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
