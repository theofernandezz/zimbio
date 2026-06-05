import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:v1:";

function getKey(): Buffer {
  const hex = process.env.VAULT_ENCRYPTION_KEY;
  if (!hex) throw new Error("VAULT_ENCRYPTION_KEY no está configurada");
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) throw new Error("VAULT_ENCRYPTION_KEY debe ser de 32 bytes (64 chars hex)");
  return key;
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(ciphertext: string): string {
  // Valores sin prefijo se tratan como plaintext (migración desde datos sin encriptar)
  if (!ciphertext.startsWith(PREFIX)) return ciphertext;

  const key = getKey();
  const rest = ciphertext.slice(PREFIX.length);
  const [ivHex, authTagHex, encryptedHex] = rest.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
