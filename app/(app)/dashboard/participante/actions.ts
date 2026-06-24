"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function reportPaymentAction(
  memberId: string,
  groupId: string,
): Promise<void> {
  const { userId } = await requireAuth();

  // Verificar que el member pertenece al usuario actual
  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
    select: { userId: true },
  });

  if (!member || member.userId !== userId) {
    throw new Error("No autorizado");
  }

  await prisma.groupMember.update({
    where: { id: memberId },
    data: { paymentStatus: "paid" },
  });

  revalidatePath(`/dashboard/participante?groupId=${groupId}`);
}

export async function leaveGroupAction(memberId: string, groupId: string): Promise<void> {
  const { userId } = await requireAuth();

  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
    select: { userId: true, group: { select: { adminId: true } } },
  });

  if (!member || member.userId !== userId) {
    throw new Error("No autorizado");
  }

  if (member.group.adminId === userId) {
    throw new Error("El admin no puede salirse del grupo");
  }

  await prisma.groupMember.delete({ where: { id: memberId } });

  redirect("/grupos");
}
