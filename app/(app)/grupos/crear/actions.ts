"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createGroup } from "@/lib/services/groups";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateGroupState = {
  errors?: {
    name?: string[];
    servicePlanIds?: string[];
    maxMembers?: string[];
    paymentMethod?: string[];
    monthlyTotal?: string[];
    alias?: string[];
    cvu?: string[];
    _form?: string[];
  };
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const createGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(80).trim(),
  servicePlanIds: z.array(z.string()).min(1, "Seleccioná al menos un plan"),
  maxMembers: z.coerce.number().int().min(2, "Mínimo 2 miembros"),
  paymentMethod: z.enum(["tarjeta_pesificada", "mercado_pago"]),
  monthlyTotal: z.coerce.number().positive("El monto debe ser mayor a 0"),
  alias: z.string().min(6, "El alias debe tener al menos 6 caracteres").trim(),
  cvu: z
    .string()
    .regex(/^\d{22}$/, "El CVU debe tener exactamente 22 dígitos"),
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function getCurrentBillingCycle(): string {
  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const now = new Date();
  return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function createGroupAction(
  _prevState: CreateGroupState,
  formData: FormData,
): Promise<CreateGroupState> {
  const { userId } = await requireAuth();

  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    servicePlanIds: formData.getAll("servicePlanIds"),
    maxMembers: formData.get("maxMembers"),
    paymentMethod: formData.get("paymentMethod"),
    monthlyTotal: formData.get("monthlyTotal"),
    alias: formData.get("alias"),
    cvu: formData.get("cvu"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, servicePlanIds, maxMembers, paymentMethod, monthlyTotal, alias, cvu } =
    parsed.data;

  const group = await createGroup({
    name,
    adminId: userId,
    servicePlanIds,
    maxMembers,
    paymentMethod,
    monthlyTotal,
    alias,
    cvu,
    billingCycle: getCurrentBillingCycle(),
    inviteToken: randomBytes(16).toString("hex"),
  });

  redirect(`/grupos/creado?id=${group.id}`);
}
