import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CrearGrupoForm } from "@/components/grupos/crear-grupo-form";
import { getServicesWithPlans } from "@/lib/services/service-plans";
import { requireAuth } from "@/lib/auth";

export default async function CrearGrupoPage() {
  await requireAuth();
  const services = await getServicesWithPlans();

  return (
    <div className="max-w-lg mx-auto w-full">
      <Link
        href="/grupos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Volver a grupos
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Crear grupo</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configurá tu suscripción compartida en segundos.
        </p>
      </div>

      <CrearGrupoForm services={services} />
    </div>
  );
}
