import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Share2,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useListVaults } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CreateVaultDialog } from "@/components/create-vault-dialog";

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { data: vaults } = useListVaults();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vaults", label: "Vaults", icon: FolderOpen },
    { href: "/graph", label: "Graph", icon: Share2 },
    { href: "/search", label: "Search", icon: Search },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {!collapsed && (
            <span className="font-semibold text-sm">Jarvis Brain</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-sidebar-accent text-muted-foreground"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon size={18} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </div>
            </Link>
          );
        })}

        {!collapsed && (
          <>
            <div className="pt-4 pb-2 px-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Vaults
              </div>
            </div>
            {vaults?.map((vault) => (
              <Link key={vault.id} href={`/vaults/${vault.id}`}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    location === `/vaults/${vault.id}`
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vault.color || "#6366f1" }}
                  />
                  <span className="text-sm truncate">{vault.name}</span>
                </div>
              </Link>
            ))}
            <div className="px-3 pt-2">
              <CreateVaultDialog />
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
