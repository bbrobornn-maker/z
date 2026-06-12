import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { LayoutDashboard, Key, Shield, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { path: "/", label: "Início", icon: LayoutDashboard },
  { path: "/vault", label: "Cofre", icon: Key },
  { path: "/search", label: "Busca", icon: Search },
  { path: "/2fa", label: "2FA", icon: Shield },
  { path: "/settings", label: "Config", icon: Settings },
];

const spring = { type: "spring" as const, mass: 0.5, stiffness: 380, damping: 28 };

interface BottomBarProps {
  onSearchOpen?: () => void;
}

export function BottomBar({ onSearchOpen }: BottomBarProps) {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="glass border-t border-white/6 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = location === tab.path || (tab.path !== "/" && tab.path !== "/search" && location.startsWith(tab.path));

            return (
              <motion.button
                key={tab.path}
                whileTap={{ scale: 0.88 }}
                transition={spring}
                onClick={() => tab.path === "/search" ? onSearchOpen?.() : navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors duration-100",
                  active ? "text-[#6e56ff]" : "text-white/35"
                )}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                  {active && (
                    <motion.div
                      layoutId="tab-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#6e56ff]"
                      transition={spring}
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
