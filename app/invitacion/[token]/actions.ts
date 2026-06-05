"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { joinGroup } from "@/lib/services/groups";

export async function joinGroupAction(groupId: string): Promise<void> {
  const { userId } = await requireAuth();

  try {
    await joinGroup(groupId, userId);
  } catch (err) {
    // joinGroup lanza si el grupo está lleno o el usuario ya es miembro
    const message =
      err instanceof Error ? err.message : "No se pudo unir al grupo";
    redirect(`/invitacion/error?reason=${encodeURIComponent(message)}`);
  }

  redirect(`/dashboard/participante?groupId=${groupId}`);
}
