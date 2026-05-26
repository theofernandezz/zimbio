"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Link2, ArrowRight, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingShell } from "@/components/layout/onboarding-shell";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { cn } from "@/lib/utils";

// ─── Invite link parser ──────────────────────────────────────────────────────

function extractTokenFromLink(raw: string): string | null {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const parts = url.pathname.split("/").filter(Boolean);
    const joinIdx = parts.indexOf("join");
    if (joinIdx !== -1 && parts[joinIdx + 1]) return parts[joinIdx + 1];
  } catch {
    if (/^[a-zA-Z0-9_-]{4,64}$/.test(raw.trim())) return raw.trim();
  }
  return null;
}

// ─── Choice Card ─────────────────────────────────────────────────────────────

function ChoiceCard({
  icon,
  title,
  description,
  onClick,
  accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border bg-card text-left shadow-sm",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        // Mobile: row; Desktop: column card
        "flex items-center gap-4 px-5 py-5",
        "md:flex-col md:items-start md:gap-5 md:px-6 md:py-7",
        accent
          ? "border-primary/30 bg-primary/5 hover:border-primary/50"
          : "border-border hover:border-primary/20",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center size-12 rounded-xl shrink-0 transition-colors",
          accent
            ? "bg-primary text-white"
            : "bg-secondary text-primary group-hover:bg-primary group-hover:text-white",
        )}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground md:text-base">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
          {description}
        </p>
      </div>

      <ArrowRight className="size-5 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-primary md:self-end" />
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OnboardingHomePage() {
  const router = useRouter();
  const user = useCurrentUser();

  const [modalOpen, setModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const firstName = user?.name?.split(" ")[0] ?? "allá";

  function handleModalOpen() {
    setInviteLink("");
    setLinkError(null);
    setModalOpen(true);
  }

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLinkError(null);

    const token = extractTokenFromLink(inviteLink.trim());
    if (!token) {
      setLinkError("El link no es válido. Pegá el link completo que te compartieron.");
      return;
    }

    setModalOpen(false);
    router.push(`/invitacion/${token}`);
  }

  return (
    <OnboardingShell contentWidth="lg">
      {/* Vertically centered within the shell's flex-1 */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-2xl">

          {/* Welcome copy */}
          <div className="mb-10 text-center md:text-left">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
              ¡Ya estás adentro!
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Hola, {firstName} 👋
            </h1>
            <p className="text-muted-foreground mt-2 text-base md:text-lg">
              ¿Cómo querés empezar?
            </p>
          </div>

          {/* Choice cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChoiceCard
              icon={<Plus className="size-6" />}
              title="Crear un grupo"
              description="Organizá el pago de Netflix, Spotify u otro servicio con personas de confianza"
              onClick={() => router.push("/grupos/crear")}
              accent
            />
            <ChoiceCard
              icon={<Link2 className="size-6" />}
              title="Unirme con link"
              description="Alguien ya armó un grupo y te mandó el link de invitación"
              onClick={handleModalOpen}
            />
          </div>

        </div>
      </div>

      {/* Join via link modal — rendered inside the shell */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <div className="flex items-center justify-center size-12 rounded-xl bg-secondary mx-auto mb-1">
              <Link2 className="size-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-lg">Unirme con link</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Pegá el link de invitación que te compartieron
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinSubmit} className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-link">Link de invitación</Label>
              <Input
                id="invite-link"
                type="url"
                placeholder="zimbio.app/join/..."
                value={inviteLink}
                onChange={(e) => {
                  setInviteLink(e.target.value);
                  setLinkError(null);
                }}
                autoFocus
                aria-invalid={!!linkError}
              />
              {linkError && (
                <div className="flex items-start gap-1.5 text-xs text-destructive">
                  <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                  {linkError}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">
                Unirme al grupo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </OnboardingShell>
  );
}
