import { useState, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Menu, Search, Command } from "lucide-react";
import { Sidebar } from "./sidebar";
import { BottomBar } from "./bottom-bar";
import { CommandPalette } from "./command-palette";
import { useLocation } from "wouter";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/vault": "Cofre",
  "/2fa": "Autenticação 2FA",
  "/emails": "E-mails",
  "/sites": "Sites",
  "/apps": "Aplicativos",
  "/servers": "Servidores",
  "/documents": "Documentos",
  "/tokens": "Tokens",
  "/cards": "Cartões",
  "/identities": "Identidades",
  "/notes": "Notas",
  "/licenses": "Licenças",
  "/account": "Minha Conta",
  "/search": "Buscar",
  "/security": "Segurança",
  "/history": "Histórico",
  "/audit": "Auditoria",
  "/settings": "Configurações",
};

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const title = PAGE_TITLES[location] ?? "NOIR VAULT";

  return (
    <div className="flex h-screen-safe bg-black overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 h-14 flex items-center justify-between px-4 border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
              >
                <Menu size={18} />
              </button>
            )}
            <h1 className="text-sm font-semibold text-white">{title}</h1>
          </div>
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 h-8 px-3 rounded-xl bg-white/4 border border-white/6 text-white/35 hover:text-white hover:bg-white/8 transition-colors text-xs"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Buscar</span>
            <span className="hidden sm:flex items-center gap-1 ml-1 text-white/20">
              <Command size={11} />K
            </span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      {isMobile && <BottomBar onSearchOpen={() => setCmdOpen(true)} />}

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
