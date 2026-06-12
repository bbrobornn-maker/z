import * as OTPAuth from "otpauth";

export interface TOTPEntry {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  algorithm?: string;
  digits?: number;
  period?: number;
  color?: string;
}

export function generateTOTP(entry: TOTPEntry): string {
  const totp = new OTPAuth.TOTP({
    issuer: entry.issuer,
    label: entry.name,
    secret: OTPAuth.Secret.fromBase32(entry.secret.toUpperCase().replace(/\s/g, "")),
    algorithm: (entry.algorithm as "SHA1" | "SHA256" | "SHA512") ?? "SHA1",
    digits: entry.digits ?? 6,
    period: entry.period ?? 30,
  });
  return totp.generate();
}

export function getTimeRemaining(period = 30): number {
  return period - (Math.floor(Date.now() / 1000) % period);
}

export function getTimeProgress(period = 30): number {
  return getTimeRemaining(period) / period;
}

export function parseTOTPUri(uri: string): Partial<TOTPEntry> | null {
  try {
    const totp = OTPAuth.URI.parse(uri) as OTPAuth.TOTP;
    return {
      name: totp.label ?? "",
      issuer: totp.issuer ?? "",
      secret: totp.secret.base32,
      algorithm: totp.algorithm,
      digits: totp.digits,
      period: totp.period,
    };
  } catch {
    return null;
  }
}

export function buildTOTPUri(entry: TOTPEntry): string {
  const totp = new OTPAuth.TOTP({
    issuer: entry.issuer,
    label: entry.name,
    secret: OTPAuth.Secret.fromBase32(entry.secret.toUpperCase().replace(/\s/g, "")),
    algorithm: (entry.algorithm as "SHA1") ?? "SHA1",
    digits: entry.digits ?? 6,
    period: entry.period ?? 30,
  });
  return totp.toString();
}

export function formatCode(code: string): string {
  if (code.length === 6) return `${code.slice(0, 3)} ${code.slice(3)}`;
  if (code.length === 8) return `${code.slice(0, 4)} ${code.slice(4)}`;
  return code;
}
