import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVault } from "@/contexts/vault-context";
import { useToast } from "@/components/ui/toast";
import { type VaultCategory, CATEGORY_META } from "@/lib/vault-types";
import { generatePassword } from "@/lib/crypto";
import { RefreshCw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES: VaultCategory[] = [
  "password", "totp", "email", "site", "app", "server",
  "document", "token", "card", "identity", "note", "license", "api_key"
];

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  defaultCategory?: VaultCategory;
}

export function AddItemModal({ open, onClose, defaultCategory = "password" }: AddItemModalProps) {
  const { addItem } = useVault();
  const { toast } = useToast();
  const [category, setCategory] = useState<VaultCategory>(defaultCategory);
  const [form, setForm] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = () => {
    if (!form.name?.trim()) return;
    const baseItem = { category, name: form.name, notes: form.notes };
    const extras = { ...form };
    delete extras.name; delete extras.notes;
    addItem({ ...baseItem, ...extras } as any);
    toast("Item adicionado ao cofre!");
    setForm({});
    onClose();
  };

  const genPwd = () => set("password", generatePassword(20));

  return (
    <Modal open={open} onClose={onClose} title="Novo Item" size="lg">
      <div className="space-y-5">
        {/* Category selector */}
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 block mb-2">Categoria</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {CATEGORIES.map(cat => {
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] transition-all duration-100",
                    category === cat
                      ? "bg-[#6e56ff]/20 border border-[#6e56ff]/30 text-[#9c85ff]"
                      : "border border-white/5 text-white/40 hover:bg-white/5 hover:text-white/70"
                  )}
                >
                  <span className="text-base">{getCatEmoji(cat)}</span>
                  <span className="leading-tight text-center">{meta.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Common fields */}
        <Input label="Nome" value={form.name ?? ""} onChange={e => set("name", e.target.value)} placeholder="Ex: Gmail Pessoal" />

        {/* Category-specific fields */}
        {(category === "password" || category === "site" || category === "app") && (
          <>
            <Input label="Usuário / E-mail" value={form.username ?? ""} onChange={e => set("username", e.target.value)} placeholder="usuario@email.com" />
            <div className="relative">
              <Input
                label="Senha"
                type="password"
                value={form.password ?? ""}
                onChange={e => set("password", e.target.value)}
                placeholder="••••••••••"
                rightElement={
                  <button onClick={genPwd} className="text-white/30 hover:text-[#6e56ff] transition-colors">
                    <Wand2 size={14} />
                  </button>
                }
              />
            </div>
            <Input label="URL" value={form.url ?? ""} onChange={e => set("url", e.target.value)} placeholder="https://exemplo.com" />
          </>
        )}

        {category === "totp" && (
          <>
            <Input label="Emissor" value={form.issuer ?? ""} onChange={e => set("issuer", e.target.value)} placeholder="Google, GitHub..." />
            <Input label="Secret (Base32)" value={form.secret ?? ""} onChange={e => set("secret", e.target.value)} placeholder="JBSWY3DPEHPK3PXP" />
          </>
        )}

        {category === "email" && (
          <>
            <Input label="Endereço de E-mail" type="email" value={form.email ?? ""} onChange={e => set("email", e.target.value)} placeholder="nome@dominio.com" />
            <Input label="Senha" type="password" value={form.password ?? ""} onChange={e => set("password", e.target.value)} />
            <Input label="Host SMTP" value={form.smtpHost ?? ""} onChange={e => set("smtpHost", e.target.value)} placeholder="smtp.gmail.com" />
            <Input label="Host IMAP" value={form.imapHost ?? ""} onChange={e => set("imapHost", e.target.value)} placeholder="imap.gmail.com" />
          </>
        )}

        {category === "server" && (
          <>
            <Input label="Host / IP" value={form.host ?? ""} onChange={e => set("host", e.target.value)} placeholder="192.168.1.1" />
            <Input label="Usuário" value={form.username ?? ""} onChange={e => set("username", e.target.value)} placeholder="root" />
            <Input label="Senha / Chave" type="password" value={form.password ?? ""} onChange={e => set("password", e.target.value)} />
            <Input label="Porta" value={form.port ?? ""} onChange={e => set("port", e.target.value)} placeholder="22" />
          </>
        )}

        {category === "token" && (
          <Input label="Token" value={form.token ?? ""} onChange={e => set("token", e.target.value)} placeholder="ghp_..." />
        )}

        {category === "api_key" && (
          <>
            <Input label="Serviço" value={form.service ?? ""} onChange={e => set("service", e.target.value)} placeholder="OpenAI, Stripe..." />
            <Input label="Chave API" value={form.key ?? ""} onChange={e => set("key", e.target.value)} placeholder="sk-..." />
          </>
        )}

        {category === "card" && (
          <>
            <Input label="Número do Cartão" value={form.cardNumber ?? ""} onChange={e => set("cardNumber", e.target.value)} placeholder="•••• •••• •••• ••••" />
            <Input label="Titular" value={form.cardHolder ?? ""} onChange={e => set("cardHolder", e.target.value)} placeholder="NOME NO CARTÃO" />
            <div className="grid grid-cols-3 gap-3">
              <Input label="Mês" value={form.expiryMonth ?? ""} onChange={e => set("expiryMonth", e.target.value)} placeholder="MM" />
              <Input label="Ano" value={form.expiryYear ?? ""} onChange={e => set("expiryYear", e.target.value)} placeholder="AA" />
              <Input label="CVV" type="password" value={form.cvv ?? ""} onChange={e => set("cvv", e.target.value)} placeholder="•••" />
            </div>
          </>
        )}

        {(category === "note" || category === "document") && (
          <Textarea label="Conteúdo" value={form.content ?? ""} onChange={e => set("content", e.target.value)} placeholder="Escreva aqui..." className="min-h-[140px]" />
        )}

        {category === "license" && (
          <>
            <Input label="Produto" value={form.product ?? ""} onChange={e => set("product", e.target.value)} placeholder="Windows 11, Adobe..." />
            <Input label="Chave de Licença" value={form.key ?? ""} onChange={e => set("key", e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" />
          </>
        )}

        <Textarea label="Notas" value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} placeholder="Observações opcionais..." className="min-h-[80px]" />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1">Salvar Item</Button>
        </div>
      </div>
    </Modal>
  );
}

function getCatEmoji(cat: VaultCategory): string {
  const map: Record<VaultCategory, string> = {
    password: "🔑", totp: "🛡️", email: "📧", site: "🌐", app: "📱",
    server: "🖥️", document: "📄", token: "#️⃣", card: "💳",
    identity: "👤", note: "📝", license: "🏅", api_key: "⚡",
  };
  return map[cat] ?? "📌";
}
