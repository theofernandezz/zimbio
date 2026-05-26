import { AcceptInvitationCard } from "@/components/invitacion/accept-invitation-card";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvitacionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="px-6 py-5 border-b border-border">
        <p className="text-lg font-bold text-primary">Zimbio</p>
      </header>

      {/* Centered content */}
      <main
        className="flex-1 flex items-center justify-center px-4 py-10"
        id="main-content"
      >
        <AcceptInvitationCard token={token} />
      </main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border px-6 py-5">
        <div className="max-w-md mx-auto space-y-2 text-center">
          <p className="text-sm font-bold text-primary">Zimbio</p>
          <p className="text-xs text-muted-foreground">
            © 2026 Zimbio. Todos los derechos reservados.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <button
              type="button"
              className="hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Términos y Condiciones
            </button>
            <span aria-hidden="true">|</span>
            <button
              type="button"
              className="hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Políticas de Privacidad
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
