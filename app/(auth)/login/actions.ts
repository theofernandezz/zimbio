"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/auth";
import { userService } from "@/lib/services/users";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
};

// ─── Action ───────────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // 1. Validar input
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  // 2. Buscar usuario
  const user = await userService.findByEmailWithPassword(email);

  // Error genérico — no revelar si el email existe o no
  if (!user || !user.passwordHash) {
    // passwordHash es null si el usuario solo tiene cuenta de Google
    return { errors: { _form: ["Email o contraseña incorrectos"] } };
  }

  // 3. Verificar contraseña
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { errors: { _form: ["Email o contraseña incorrectos"] } };
  }

  // 4. Crear sesión
  await createSession(user.id);

  // 5. Redirigir — solo rutas internas para evitar open redirect
  const redirectTo = formData.get("redirectTo");
  const destination =
    typeof redirectTo === "string" && redirectTo.startsWith("/")
      ? redirectTo
      : "/grupos";

  redirect(destination);
}
