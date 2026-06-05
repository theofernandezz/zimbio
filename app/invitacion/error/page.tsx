import Link from "next/link";
import { LinkIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const KNOWN_REASONS: Record<string, { title: string; body: string }> = {
  "El grupo ya está completo": {
    title: "El grupo está lleno",
    body: "No quedan lugares disponibles. Pedile al admin que amplíe el grupo o que te mande un nuevo link.",
  },
  "Ya sos miembro de este grupo": {
    title: "Ya sos miembro",
    body: "Ya estás en este grupo. Entrá al dashboard para ver tu estado de pago.",
  },
};

function resolveError(raw: string | undefined) {
  if (!raw) {
    return {
      title: "No se pudo unir al grupo",
      body: "Algo salió mal al procesar tu invitación. Pedile al admin un nuevo link.",
    };
  }
  const decoded = decodeURIComponent(raw);
  return (
    KNOWN_REASONS[decoded] ?? {
      title: "No se pudo unir al grupo",
      body: decoded,
    }
  );
}

export default async function InvitacionErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const { title, body } = resolveError(reason);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="px-6 py-5 border-b border-border">
        <p className="text-lg font-bold text-primary">Zimbio</p>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center space-y-5">

          <div className="flex items-center justify-center mx-auto size-16 rounded-2xl bg-muted">
            <LinkIcon className="size-7 text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button asChild className="w-full gap-2">
              <Link href="/grupos">
                <Users className="size-4" />
                Ir a mis grupos
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/home">Volver al inicio</Link>
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
