"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ─── Update name ──────────────────────────────────────────────────────────────

export type UpdateNameState = { error?: string; success?: boolean };

export async function updateNameAction(
  _prev: UpdateNameState,
  formData: FormData,
): Promise<UpdateNameState> {
  const { userId } = await requireAuth();

  const name = z.string().min(1).max(80).trim().safeParse(formData.get("name"));
  if (!name.success) return { error: "Nombre inválido" };

  await prisma.user.update({ where: { id: userId }, data: { name: name.data } });
  revalidatePath("/settings");
  return { success: true };
}

// ─── Update password ──────────────────────────────────────────────────────────

export type UpdatePasswordState = { error?: string; success?: boolean };

export async function updatePasswordAction(
  _prev: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const { userId } = await requireAuth();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8) return { error: "La contraseña nueva debe tener al menos 8 caracteres" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { error: "Tu cuenta usa Google — no tenés contraseña para cambiar" };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { error: "La contraseña actual no es correcta" };

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
  return { success: true };
}
