import { KeyRound } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AccesosClient } from "@/components/accesos/accesos-client";
import { decrypt } from "@/lib/encryption";

export default async function AccesosPage() {
  const { userId } = await requireAuth();

  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { adminId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      vaults: { select: { email: true, serviceType: true } },
      servicePlans: {
        include: { service: { select: { name: true, type: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = groups.map((g) => ({
    id: g.id,
    name: g.name,
    services: g.servicePlans.map((sp) => ({ type: sp.service.type, name: sp.service.name })),
    isAdmin: g.adminId === userId,
    vaults: g.vaults.map((v) => ({ serviceType: v.serviceType, email: decrypt(v.email) })),
  }));

  const adminGroups = mapped.filter((g) => g.isAdmin);
  const participantGroups = mapped.filter((g) => !g.isAdmin);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Accesos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Credenciales de acceso de tus suscripciones compartidas
        </p>
      </div>

      {mapped.length > 0 ? (
        <AccesosClient adminGroups={adminGroups} participantGroups={participantGroups} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-secondary">
            <KeyRound className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Sin grupos todavía</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cuando seas parte de un grupo, sus accesos aparecerán acá.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
