"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, AlertCircle } from "lucide-react";

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

function extractTokenFromLink(raw: string): string | null {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const parts = url.pathname.split("/").filter(Boolean);
    const invIdx = parts.indexOf("invitacion");
    if (invIdx !== -1 && parts[invIdx + 1]) return parts[invIdx + 1];
  } catch {
    if (/^[a-zA-Z0-9_-]{4,64}$/.test(raw.trim())) return raw.trim();
  }
  return null;
}

export function JoinViaLinkButton({ variant = "outline" }: { variant?: "outline" | "ghost" | "secondary" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  function handleOpen() {
    setInviteLink("");
    setLinkError(null);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLinkError(null);

    const token = extractTokenFromLink(inviteLink.trim());
    if (!token) {
      setLinkError("El link no es válido. Pegá el link completo que te compartieron.");
      return;
    }

    setOpen(false);
    router.push(`/invitacion/${token}`);
  }

  return (
    <>
      <Button variant={variant} size="sm" className="gap-2 shrink-0" onClick={handleOpen}>
        <Link2 className="size-4" />
        Unirme con link
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
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

          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-link">Link de invitación</Label>
              <Input
                id="invite-link"
                type="url"
                placeholder="zimbio.app/invitacion/..."
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
              <Button type="submit" className="w-full">Unirme al grupo</Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
