/**
 * Lógica pura de tokens de sesión — sin dependencias de Next.js.
 * Importable desde Route Handlers sin arrastrar `next/headers`.
 */

import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "zimbio_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no configurado");
  return secret;
}

export function createSessionToken(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): { userId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, timestampStr, sig] = parts;
  const payload = `${userId}.${timestampStr}`;
  const expectedSig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  const sigBuffer = Buffer.from(sig, "hex");
  const expectedBuffer = Buffer.from(expectedSig, "hex");
  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  return { userId };
}
