// Zero-knowledge crypto using WebCrypto API
// AES-256-GCM encryption + PBKDF2 key derivation

const PBKDF2_ITERATIONS = 600_000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(ciphertextB64: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

export function saltToB64(salt: Uint8Array): string {
  return btoa(String.fromCharCode(...salt));
}

export function saltFromB64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

export function generatePassword(length = 20, opts = { upper: true, lower: true, numbers: true, symbols: true }): string {
  const chars = [
    opts.lower ? "abcdefghijkmnopqrstuvwxyz" : "",
    opts.upper ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "",
    opts.numbers ? "23456789" : "",
    opts.symbols ? "!@#$%^&*-_=+?" : "",
  ].join("");
  if (!chars) return "";
  const arr = crypto.getRandomValues(new Uint8Array(length * 2));
  let result = "";
  for (let i = 0; i < arr.length && result.length < length; i++) {
    const idx = arr[i] % chars.length;
    result += chars[idx];
  }
  return result;
}

export function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { score, label: "Fraca", color: "#ff375f" };
  if (score <= 4) return { score, label: "Média", color: "#ffd60a" };
  if (score <= 5) return { score, label: "Boa", color: "#30d158" };
  return { score, label: "Forte", color: "#30d158" };
}
