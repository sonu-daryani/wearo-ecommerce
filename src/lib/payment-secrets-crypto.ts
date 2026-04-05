import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

/** 32-byte key for AES-256. Base64 (44 chars), hex (64 chars), or any string (scrypt-derived). */
export function getPaymentEncryptionKey(): Buffer | null {
  const raw = process.env.PAYMENT_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  try {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
  } catch {
    /* ignore */
  }
  return scryptSync(raw, "wearo-payment-secrets-v1", 32);
}

export function encryptPaymentSecret(plaintext: string): string {
  const key = getPaymentEncryptionKey();
  if (!key) {
    throw new Error("PAYMENT_ENCRYPTION_KEY is not set");
  }
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptPaymentSecret(stored: string | null | undefined): string | null {
  if (!stored?.trim()) return null;
  const key = getPaymentEncryptionKey();
  if (!key) return null;
  try {
    const buf = Buffer.from(stored, "base64");
    if (buf.length < IV_LEN + TAG_LEN + 1) return null;
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const data = buf.subarray(IV_LEN + TAG_LEN);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
