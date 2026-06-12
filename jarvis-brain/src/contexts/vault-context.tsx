import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type VaultItem, type VaultData, type AuditEntry, type VaultCategory } from "@/lib/vault-types";
import { generateId } from "@/lib/utils";

interface VaultContextType {
  items: VaultItem[];
  auditLog: AuditEntry[];
  addItem: (item: Omit<VaultItem, "id" | "createdAt" | "updatedAt" | "archived" | "favorite" | "tags">) => VaultItem;
  updateItem: (id: string, updates: Partial<VaultItem>) => void;
  deleteItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  archiveItem: (id: string) => void;
  getItemsByCategory: (cat: VaultCategory) => VaultItem[];
  searchItems: (q: string) => VaultItem[];
  exportVault: () => VaultData;
  importVault: (data: VaultData) => void;
  stats: { total: number; favorites: number; categories: Record<string, number> };
}

const VaultContext = createContext<VaultContextType | null>(null);

const STORAGE_KEY = "nv_vault_data";

function loadFromStorage(): VaultData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { version: 1, items: [], auditLog: [] };
}

function saveToStorage(data: VaultData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaultData, setVaultData] = useState<VaultData>(() => loadFromStorage());

  const persist = useCallback((data: VaultData) => {
    setVaultData(data);
    saveToStorage(data);
  }, []);

  const logAudit = useCallback((entry: Omit<AuditEntry, "id" | "timestamp">) => {
    const newEntry: AuditEntry = { ...entry, id: generateId(), timestamp: new Date().toISOString() };
    setVaultData(prev => {
      const updated = { ...prev, auditLog: [newEntry, ...prev.auditLog].slice(0, 500) };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addItem = useCallback((itemData: Omit<VaultItem, "id" | "createdAt" | "updatedAt" | "archived" | "favorite" | "tags">) => {
    const now = new Date().toISOString();
    const item: VaultItem = {
      ...itemData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      archived: false,
      favorite: false,
      tags: [],
    } as VaultItem;
    setVaultData(prev => {
      const updated = { ...prev, items: [...prev.items, item] };
      saveToStorage(updated);
      return updated;
    });
    logAudit({ action: "create", itemId: item.id, itemName: item.name, category: item.category });
    return item;
  }, [logAudit]);

  const updateItem = useCallback((id: string, updates: Partial<VaultItem>) => {
    setVaultData(prev => {
      const updated = {
        ...prev,
        items: prev.items.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i),
      };
      saveToStorage(updated);
      return updated;
    });
    logAudit({ action: "update", itemId: id });
  }, [logAudit]);

  const deleteItem = useCallback((id: string) => {
    const item = vaultData.items.find(i => i.id === id);
    setVaultData(prev => {
      const updated = { ...prev, items: prev.items.filter(i => i.id !== id) };
      saveToStorage(updated);
      return updated;
    });
    if (item) logAudit({ action: "delete", itemId: id, itemName: item.name, category: item.category });
  }, [vaultData.items, logAudit]);

  const toggleFavorite = useCallback((id: string) => {
    setVaultData(prev => {
      const updated = {
        ...prev,
        items: prev.items.map(i => i.id === id ? { ...i, favorite: !i.favorite, updatedAt: new Date().toISOString() } : i),
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const archiveItem = useCallback((id: string) => {
    setVaultData(prev => {
      const updated = {
        ...prev,
        items: prev.items.map(i => i.id === id ? { ...i, archived: !i.archived, updatedAt: new Date().toISOString() } : i),
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const getItemsByCategory = useCallback((cat: VaultCategory) => {
    return vaultData.items.filter(i => i.category === cat && !i.archived);
  }, [vaultData.items]);

  const searchItems = useCallback((q: string) => {
    const query = q.toLowerCase().trim();
    if (!query) return vaultData.items.filter(i => !i.archived);
    return vaultData.items.filter(i => {
      if (i.archived) return false;
      if (i.name.toLowerCase().includes(query)) return true;
      if (i.tags.some(t => t.toLowerCase().includes(query))) return true;
      if (i.category === "password" && (i as any).username?.toLowerCase().includes(query)) return true;
      if (i.category === "email" && (i as any).email?.toLowerCase().includes(query)) return true;
      return false;
    });
  }, [vaultData.items]);

  const exportVault = useCallback((): VaultData => {
    logAudit({ action: "export" });
    return vaultData;
  }, [vaultData, logAudit]);

  const importVault = useCallback((data: VaultData) => {
    persist(data);
  }, [persist]);

  const stats = {
    total: vaultData.items.filter(i => !i.archived).length,
    favorites: vaultData.items.filter(i => i.favorite && !i.archived).length,
    categories: vaultData.items.reduce((acc, i) => {
      if (!i.archived) acc[i.category] = (acc[i.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <VaultContext.Provider value={{
      items: vaultData.items,
      auditLog: vaultData.auditLog,
      addItem, updateItem, deleteItem,
      toggleFavorite, archiveItem,
      getItemsByCategory, searchItems,
      exportVault, importVault, stats,
    }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
