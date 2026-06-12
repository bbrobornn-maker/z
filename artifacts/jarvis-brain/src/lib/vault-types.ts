export type VaultCategory =
  | "password"
  | "totp"
  | "email"
  | "site"
  | "app"
  | "server"
  | "document"
  | "token"
  | "card"
  | "identity"
  | "note"
  | "license"
  | "api_key";

export interface BaseVaultItem {
  id: string;
  category: VaultCategory;
  name: string;
  tags: string[];
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  icon?: string;
  color?: string;
}

export interface PasswordItem extends BaseVaultItem {
  category: "password";
  username: string;
  password: string;
  url?: string;
  totp?: string;
}

export interface TOTPItem extends BaseVaultItem {
  category: "totp";
  secret: string;
  issuer: string;
  algorithm?: string;
  digits?: number;
  period?: number;
}

export interface EmailItem extends BaseVaultItem {
  category: "email";
  email: string;
  password?: string;
  smtpHost?: string;
  smtpPort?: number;
  imapHost?: string;
  imapPort?: number;
  recovery?: string;
}

export interface SiteItem extends BaseVaultItem {
  category: "site";
  url: string;
  username?: string;
  password?: string;
  adminUrl?: string;
  hosting?: string;
}

export interface AppItem extends BaseVaultItem {
  category: "app";
  username?: string;
  password?: string;
  url?: string;
  version?: string;
  license?: string;
}

export interface ServerItem extends BaseVaultItem {
  category: "server";
  host: string;
  port?: number;
  username: string;
  password?: string;
  privateKey?: string;
  protocol?: "ssh" | "rdp" | "ftp" | "sftp" | "other";
}

export interface DocumentItem extends BaseVaultItem {
  category: "document";
  content: string;
  mimeType?: string;
  fileName?: string;
}

export interface TokenItem extends BaseVaultItem {
  category: "token";
  token: string;
  type?: string;
  expiresAt?: string;
  scopes?: string[];
}

export interface CardItem extends BaseVaultItem {
  category: "card";
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv?: string;
  bank?: string;
  type?: "credit" | "debit" | "prepaid";
}

export interface IdentityItem extends BaseVaultItem {
  category: "identity";
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  nationalId?: string;
}

export interface NoteItem extends BaseVaultItem {
  category: "note";
  content: string;
}

export interface LicenseItem extends BaseVaultItem {
  category: "license";
  key: string;
  product: string;
  seats?: number;
  expiresAt?: string;
  vendor?: string;
}

export interface ApiKeyItem extends BaseVaultItem {
  category: "api_key";
  key: string;
  service: string;
  environment?: "production" | "staging" | "development";
  expiresAt?: string;
}

export type VaultItem =
  | PasswordItem
  | TOTPItem
  | EmailItem
  | SiteItem
  | AppItem
  | ServerItem
  | DocumentItem
  | TokenItem
  | CardItem
  | IdentityItem
  | NoteItem
  | LicenseItem
  | ApiKeyItem;

export interface AuditEntry {
  id: string;
  action: "create" | "read" | "update" | "delete" | "export" | "login" | "logout";
  itemId?: string;
  itemName?: string;
  category?: VaultCategory;
  timestamp: string;
  ipAddress?: string;
}

export interface VaultData {
  version: number;
  items: VaultItem[];
  auditLog: AuditEntry[];
}

export const CATEGORY_META: Record<VaultCategory, { label: string; icon: string; color: string }> = {
  password: { label: "Senhas", icon: "key", color: "#6e56ff" },
  totp: { label: "2FA / TOTP", icon: "shield-check", color: "#30d158" },
  email: { label: "E-mails", icon: "mail", color: "#0a84ff" },
  site: { label: "Sites", icon: "globe", color: "#5e5ce6" },
  app: { label: "Aplicativos", icon: "layout-grid", color: "#bf5af2" },
  server: { label: "Servidores", icon: "server", color: "#ff9f0a" },
  document: { label: "Documentos", icon: "file-text", color: "#64d2ff" },
  token: { label: "Tokens", icon: "hash", color: "#ff6b35" },
  card: { label: "Cartões", icon: "credit-card", color: "#ff375f" },
  identity: { label: "Identidades", icon: "user-check", color: "#ffd60a" },
  note: { label: "Notas", icon: "sticky-note", color: "#8e8e93" },
  license: { label: "Licenças", icon: "award", color: "#32ade6" },
  api_key: { label: "API Keys", icon: "code", color: "#ac8e68" },
};
