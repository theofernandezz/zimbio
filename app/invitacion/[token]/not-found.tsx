import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvitacionNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-4">
      <div className="p-3 rounded-full bg-muted">
        <LinkIcon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Link inválido o expirado</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Este link de invitación no existe o ya fue usado. Pedile al admin un nuevo link.
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/home">Ir al inicio</Link>
      </Button>
    </div>
  );
}
