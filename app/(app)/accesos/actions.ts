"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

// ─── Guardar accesos ──────────────────────────────────────────────────────────

const accesosSchema = z.object({
  email: z.string().min(1, "El usuario es requerido").trim(),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type SaveAccesosState = { error?: string; success?: boolean };

export async function saveAccesosEntryAction(
  groupId: string,
  _prev: SaveAccesosState,
  formData: FormData,
): Promise<SaveAccesosState> {
  const { userId } = await requireAuth();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { adminId: true },
  });
  if (!group || group.adminId !== userId) return { error: "No autorizado" };

  const parsed = accesosSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.vaultEntry.upsert({
    where: { groupId },
    create: {
      groupId,
      email: encrypt(parsed.data.email),
      password: encrypt(parsed.data.password),
    },
    update: {
      email: encrypt(parsed.data.email),
      password: encrypt(parsed.data.password),
    },
  });

  revalidatePath("/accesos");
  return { success: true };
}

// ─── Revelar contraseña ───────────────────────────────────────────────────────

export type RevealPasswordResult = { error?: string; password?: string };

export async function revealPasswordAction(
  groupId: string,
): Promise<RevealPasswordResult> {
  const { userId } = await requireAuth();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      adminId: true,
      vault: { select: { password: true } },
      members: { where: { userId }, select: { id: true } },
    },
  });

  if (!group) return { error: "Grupo no encontrado" };

  const isMember = group.adminId === userId || group.members.length > 0;
  if (!isMember) return { error: "No autorizado" };

  if (!group.vault) return { error: "Sin credenciales guardadas" };

  try {
    return { password: decrypt(group.vault.password) };
  } catch {
    return { error: "Error al revelar la contraseña" };
  }
}
