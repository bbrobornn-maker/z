import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  masterKey: string;
  isFirstSetup: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  setupMaster: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_SESSION_KEY = "nv_auth";
const MASTER_HASH_KEY = "nv_master_hash";
const SESSION_KEY = "nv_key";

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + "noir-vault-v1-salt");
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuf)));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [isFirstSetup, setIsFirstSetup] = useState(false);

  useEffect(() => {
    const hasHash = Boolean(localStorage.getItem(MASTER_HASH_KEY));
    setIsFirstSetup(!hasHash);
    const auth = sessionStorage.getItem(AUTH_SESSION_KEY);
    const key = sessionStorage.getItem(SESSION_KEY);
    if (auth === "true" && key) {
      setIsAuthenticated(true);
      setMasterKey(key);
    }
  }, []);

  const setupMaster = async (password: string): Promise<void> => {
    const hash = await hashPassword(password);
    localStorage.setItem(MASTER_HASH_KEY, hash);
    sessionStorage.setItem(AUTH_SESSION_KEY, "true");
    sessionStorage.setItem(SESSION_KEY, password);
    setMasterKey(password);
    setIsAuthenticated(true);
    setIsFirstSetup(false);
  };

  const login = async (password: string): Promise<boolean> => {
    const storedHash = localStorage.getItem(MASTER_HASH_KEY);
    if (!storedHash) {
      await setupMaster(password);
      return true;
    }
    const hash = await hashPassword(password);
    if (hash === storedHash) {
      sessionStorage.setItem(AUTH_SESSION_KEY, "true");
      sessionStorage.setItem(SESSION_KEY, password);
      setMasterKey(password);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setMasterKey("");
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, masterKey, isFirstSetup, login, logout, setupMaster }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
