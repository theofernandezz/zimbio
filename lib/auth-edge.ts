/**
 * auth-edge.ts — Session verification usando Web Crypto API.
 * Edge Runtime compatible (no importa módulos Node.js).
 */

export const COOKIE_NAME = "zimbio_session";

// ─── Web Crypto helpers ───────────────────────────────────────────────────────

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no configurado");

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

// ─── Token verification ───────────────────────────────────────────────────────

/**
 * Verifica un token de sesión con HMAC-SHA256 (Web Crypto).
 * Formato: {userId}.{timestamp}.{hmacHex}
 */
export async function verifySessionToken(
  token: string,
): Promise<{ userId: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, timestampStr, sigHex] = parts;

  // Validar que el hex tenga la longitud correcta (SHA-256 = 32 bytes = 64 hex chars)
  if (sigHex.length !== 64) return null;

  try {
    const key = await getKey();
    const payload = new TextEncoder().encode(`${userId}.${timestampStr}`);
    const sigBytes = hexToBytes(sigHex);
    // Extraer ArrayBuffer limpio para crypto.subtle.verify
    const sigBuffer = sigBytes.buffer.slice(
      sigBytes.byteOffset,
      sigBytes.byteOffset + sigBytes.byteLength,
    ) as ArrayBuffer;

    // crypto.subtle.verify hace comparación en tiempo constante internamente
    const valid = await crypto.subtle.verify("HMAC", key, sigBuffer, payload);
    return valid ? { userId } : null;
  } catch {
    return null;
  }
}
