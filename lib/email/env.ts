import { z } from "zod";

const emailEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
});

const parsed = emailEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Configuración de email inválida — no se enviarán notificaciones:",
    parsed.error.flatten().fieldErrors,
  );
}

// null cuando falta config: los llamadores deben seguir funcionando sin enviar el email
export const emailEnv = parsed.success ? parsed.data : null;
