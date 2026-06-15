"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

// ─── Guardar accesos ──────────────────────────────────────────────────────────

const accesosSchema = z.object({
  serviceType: z.string().min(1, "El servicio es requerido"),
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
    serviceType: formData.get("serviceType"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { serviceType, email, password } = parsed.data;

  await prisma.vaultEntry.upsert({
    where: { groupId_serviceType: { groupId, serviceType } },
    create: {
      groupId,
      serviceType,
      email: encrypt(email),
      password: encrypt(password),
    },
    update: {
      email: encrypt(email),
      password: encrypt(password),
    },
  });

  revalidatePath("/accesos");
  return { success: true };
}

// ─── Revelar contraseña ───────────────────────────────────────────────────────

export type RevealPasswordResult = { error?: string; password?: string };

export async function revealPasswordAction(
  groupId: string,
  serviceType: string,
): Promise<RevealPasswordResult> {
  const { userId } = await requireAuth();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      adminId: true,
      vaults: { where: { serviceType }, select: { password: true } },
      members: { where: { userId }, select: { id: true } },
    },
  });

  if (!group) return { error: "Grupo no encontrado" };

  const isMember = group.adminId === userId || group.members.length > 0;
  if (!isMember) return { error: "No autorizado" };

  const vault = group.vaults[0];
  if (!vault) return { error: "Sin credenciales guardadas" };

  try {
    return { password: decrypt(vault.password) };
  } catch {
    return { error: "Error al revelar la contraseña" };
  }
}
