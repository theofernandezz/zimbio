"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateMemberPaymentStatus } from "@/lib/services/groups";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

function nextBillingCycle(current: string): string {
  const [monthName, yearStr] = current.split(" ");
  const idx = MONTHS.indexOf(monthName as typeof MONTHS[number]);
  if (idx === -1) {
    // Fallback: si el formato es inesperado, devolver el mes/año actual
    const now = new Date();
    return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }
  const year = parseInt(yearStr, 10);
  const nextIdx = (idx + 1) % 12;
  const nextYear = nextIdx === 0 ? year + 1 : year;
  return `${MONTHS[nextIdx]} ${nextYear}`;
}

export async function togglePaymentAction(
  memberId: string,
  groupId: string,
  newStatus: "paid" | "pending",
): Promise<void> {
  const { userId } = await requireAuth();

  // Verificar que el usuario es admin del grupo
  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
    select: { group: { select: { adminId: true } } },
  });

  if (!member || member.group.adminId !== userId) {
    throw new Error("No autorizado");
  }

  await updateMemberPaymentStatus(memberId, newStatus);
  revalidatePath(`/dashboard/admin?groupId=${groupId}`);
}

const updateTotalSchema = z.object({
  monthlyTotal: z.coerce
    .number()
    .positive("El monto debe ser mayor a 0")
    .max(10_000_000, "El monto parece demasiado alto"),
});

export type UpdateTotalState = {
  error?: string;
  success?: boolean;
};

export async function updateMonthlyTotalAction(
  groupId: string,
  _prev: UpdateTotalState,
  formData: FormData,
): Promise<UpdateTotalState> {
  const { userId } = await requireAuth();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { adminId: true, maxMembers: true },
  });

  if (!group || group.adminId !== userId) {
    return { error: "No autorizado" };
  }

  const parsed = updateTotalSchema.safeParse({
    monthlyTotal: formData.get("monthlyTotal"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { monthlyTotal } = parsed.data;
  const amountDue = Math.round(monthlyTotal / group.maxMembers);

  await prisma.$transaction([
    prisma.group.update({
      where: { id: groupId },
      data: { monthlyTotal },
    }),
    prisma.groupMember.updateMany({
      where: { groupId },
      data: { amountDue },
    }),
  ]);

  revalidatePath(`/dashboard/admin?groupId=${groupId}`);
  return { success: true };
}

export type ResetCycleState = {
  error?: string;
  success?: boolean;
  newCycle?: string;
};

export async function resetBillingCycleAction(
  groupId: string,
  _prev: ResetCycleState,
  _formData: FormData,
): Promise<ResetCycleState> {
  const { userId } = await requireAuth();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { adminId: true, billingCycle: true },
  });

  if (!group || group.adminId !== userId) {
    return { error: "No autorizado" };
  }

  const newCycle = nextBillingCycle(group.billingCycle);

  await prisma.$transaction([
    prisma.group.update({
      where: { id: groupId },
      data: { billingCycle: newCycle },
    }),
    prisma.groupMember.updateMany({
      where: { groupId },
      data: { paymentStatus: "pending", amountPaid: 0 },
    }),
  ]);

  revalidatePath(`/dashboard/admin?groupId=${groupId}`);
  return { success: true, newCycle };
}
