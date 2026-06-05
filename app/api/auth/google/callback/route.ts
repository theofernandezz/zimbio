import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
} from "@/lib/session-token";
import { userService } from "@/lib/services/users";

// ─── Tipos de Google ──────────────────────────────────────────────────────────

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;   // Google user ID
  name: string;
  email: string;
  email_verified: boolean;
  picture: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function exchangeCode(code: string): Promise<GoogleTokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error("Error al intercambiar código de autorización");
  }

  return res.json() as Promise<GoogleTokenResponse>;
}

async function getGoogleUser(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Error al obtener información de Google");
  }

  return res.json() as Promise<GoogleUserInfo>;
}

function errorRedirect(request: NextRequest, message: string): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

// ─── GET /api/auth/google/callback ───────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // El usuario canceló el consentimiento
  if (errorParam === "access_denied") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!code || !state) {
    return errorRedirect(request, "Respuesta inválida de Google");
  }

  // Verificar state CSRF
  const savedState = request.cookies.get("oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return errorRedirect(request, "Error de seguridad, intentá de nuevo");
  }

  try {
    // Intercambiar code por tokens
    const tokens = await exchangeCode(code);

    // Obtener datos del usuario de Google
    const googleUser = await getGoogleUser(tokens.access_token);

    if (!googleUser.email_verified) {
      return errorRedirect(request, "El email de Google no está verificado");
    }

    // Buscar o crear usuario en la DB
    let userId: string;
    let isNewUser = false;

    const existingByGoogleId = await userService.findByGoogleId(googleUser.sub);

    if (existingByGoogleId) {
      // Caso 1: ya se registró con Google antes → login directo
      userId = existingByGoogleId.id;
    } else {
      const existingByEmail = await userService.findByEmailForGoogle(googleUser.email);

      if (existingByEmail) {
        // Caso 2: email ya registrado con contraseña → vincular googleId y hacer login
        await userService.linkGoogleId(existingByEmail.id, googleUser.sub);
        userId = existingByEmail.id;
      } else {
        // Caso 3: usuario nuevo → crear cuenta y llevar al home/onboarding
        const newUser = await userService.createFromGoogle({
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.sub,
        });
        userId = newUser.id;
        isNewUser = true;
      }
    }

    // Crear token y setear cookie directamente en la response (sin next/headers)
    const token = createSessionToken(userId);
    const destination = isNewUser ? "/home" : "/grupos";
    const response = NextResponse.redirect(new URL(destination, request.url));

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: "/",
    });
    response.cookies.delete("oauth_state");

    return response;

  } catch (err) {
    console.error("[Google OAuth callback]", err);
    return errorRedirect(request, "Algo salió mal, intentá de nuevo");
  }
}
