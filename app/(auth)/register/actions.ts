"use server";

import { redirect } from "next/navigation";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword, createSession } from "@/lib/auth";
import { userService } from "@/lib/services/users";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    _form?: string[];
  };
};

// ─── Action ───────────────────────────────────────────────────────────────────

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // 1. Validar input
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  // 2. Verificar que el email no esté en uso
  const emailTaken = await userService.existsByEmail(email);
  if (emailTaken) {
    return { errors: { email: ["Este email ya está registrado"] } };
  }

  // 3. Crear usuario
  const passwordHash = await hashPassword(password);
  const user = await userService.create({ name, email, passwordHash });

  // 4. Crear sesión
  await createSession(user.id);

  // 5. Redirigir — usuarios nuevos van al onboarding, salvo que vengan de un link de invitación
  const redirectTo = formData.get("redirectTo");
  const destination =
    typeof redirectTo === "string" && redirectTo.startsWith("/")
      ? redirectTo
      : "/home";

  redirect(destination);
}
