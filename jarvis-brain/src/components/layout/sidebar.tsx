import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  LayoutDashboard, Key, Shield, Mail, Globe, LayoutGrid,
  Server, FileText, Hash, CreditCard, User, StickyNote,
  Award, Code, Settings, LogOut, Lock, History, ShieldCheck, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { useVault } from "@/contexts/vault-context";

const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/vault", label: "Cofre", icon: Key },
      { path: "/2fa", label: "2FA / TOTP", icon: Shield },
    ],
  },
  {
    label: "Categorias",
    items: [
      { path: "/emails", label: "E-mails", icon: Mail },
      { path: "/sites", label: "Sites", icon: Globe },
      { path: "/apps", label: "Aplicativos", icon: LayoutGrid },
      { path: "/servers", label: "Servidores", icon: Server },
      { path: "/documents", label: "Documentos", icon: FileText },
      { path: "/tokens", label: "Tokens & API Keys", icon: Hash },
      { path: "/cards", label: "Cartões", icon: CreditCard },
      { path: "/identities", label: "Identidades", icon: User },
      { path: "/notes", label: "Notas", icon: StickyNote },
      { path: "/licenses", label: "Licenças", icon: Award },
    ],
  },
  {
    label: "Sistema",
    items: [
      { path: "/security", label: "Segurança", icon: ShieldCheck },
      { path: "/history", label: "Histórico", icon: History },
      { path: "/audit", label: "Auditoria", icon: Lock },
      { path: "/settings", label: "Configurações", icon: Settings },
    ],
  },
];

const spring = { type: "spring" as const, mass: 0.6, stiffness: 320, damping: 28 };

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ open = true, onClose, isMobile = false }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { logout } = useAuth();
  const { stats } = useVault();

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#6e56ff] to-[#9c85ff] flex items-center justify-center shadow-lg shadow-[#6e56ff]/30">
          <Lock size={14} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight">NOIR VAULT</div>
          <div className="text-[10px] text-white/30">{stats.total} itens</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="px-2 mb-1 text-[10px] font-semibold tracking-widest text-white/25 uppercase">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const active = location === item.path || (item.path !== "/" && location.startsWith(item.path));
                return (
                  <motion.button
                    key={item.path}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNav(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-100 text-left",
                      active
                        ? "bg-[#6e56ff]/15 text-[#9c85ff] font-medium"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={15} className={active ? "text-[#6e56ff]" : ""} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="h-1.5 w-1.5 rounded-full bg-[#6e56ff]"
                        transition={spring}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 border-t border-white/5 pt-4 space-y-1">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-[#ff375f] hover:bg-[#ff375f]/8 transition-all duration-100"
        >
          <LogOut size={15} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={spring}
              className="fixed top-0 left-0 bottom-0 w-[280px] glass-panel z-50 pt-[env(safe-area-inset-top)]"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-r border-white/5 bg-[#050505] h-screen sticky top-0">
      {content}
    </aside>
  );
}
