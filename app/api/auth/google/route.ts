import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

// ─── GET /api/auth/google ─────────────────────────────────────────────────────
// Genera un state CSRF y redirige al consentimiento de Google.

export function GET(): NextResponse {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth no configurado" }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  const response = NextResponse.redirect(googleUrl);

  // Guardar state en cookie httpOnly para verificar en el callback
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutos — el flow debería completarse rápido
    path: "/",
  });

  return response;
}
