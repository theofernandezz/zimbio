import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

const serviceWithPlansSelect = {
  id: true,
  name: true,
  type: true,
  brandColor: true,
  plans: {
    select: {
      id: true,
      name: true,
      basePriceArs: true,
      maxMembers: true,
    },
    orderBy: { maxMembers: "asc" as const },
  },
} satisfies Prisma.ServiceSelect;

export type ServiceWithPlans = Prisma.ServiceGetPayload<{
  select: typeof serviceWithPlansSelect;
}>;

export type PlanOption = ServiceWithPlans["plans"][number];

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getServicesWithPlans(): Promise<ServiceWithPlans[]> {
  return prisma.service.findMany({
    select: serviceWithPlansSelect,
    orderBy: { name: "asc" },
  });
}
