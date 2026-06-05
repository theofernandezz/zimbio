import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ─── Precios base SIN IVA (ARS) ───────────────────────────────────────────────
// Verificados en mayo 2026. Actualizar manualmente cuando cambien.
// Solo planes que permiten 2 o más usuarios (no existen planes individuales en Zimbio).

const SERVICES = [
  {
    name: "Netflix",
    type: "netflix",
    brandColor: "#E50914",
    plans: [
      { name: "Estándar + 1 miembro extra", basePriceArs: 20_700, maxMembers: 3 },
      { name: "Premium (4 pantallas)",      basePriceArs: 24_599, maxMembers: 4 },
      { name: "Premium + 1 miembro extra",  basePriceArs: 31_240, maxMembers: 5 },
      { name: "Premium + 2 miembros extra", basePriceArs: 37_880, maxMembers: 6 },
    ],
  },
  {
    name: "Spotify",
    type: "spotify",
    brandColor: "#1DB954",
    plans: [
      { name: "Dúo (2 cuentas)",     basePriceArs: 4_399, maxMembers: 2 },
      { name: "Familiar (6 cuentas)", basePriceArs: 5_299, maxMembers: 6 },
    ],
  },
  {
    name: "Disney+",
    type: "disney_plus",
    brandColor: "#0063E5",
    plans: [
      { name: "Estándar (4 pantallas)", basePriceArs: 7_499, maxMembers: 4 },
    ],
  },
  {
    name: "Max",
    type: "hbo_max",
    brandColor: "#5822B4",
    plans: [
      { name: "Estándar (2 pantallas)",  basePriceArs: 5_699, maxMembers: 2 },
      { name: "Ultimate (4 pantallas)",  basePriceArs: 8_499, maxMembers: 4 },
    ],
  },
  {
    name: "YouTube Premium",
    type: "youtube_premium",
    brandColor: "#FF0000",
    plans: [
      { name: "Familiar (hasta 6 miembros)", basePriceArs: 3_599, maxMembers: 6 },
    ],
  },
  {
    name: "Apple Music",
    type: "apple_music",
    brandColor: "#FC3C44",
    plans: [
      { name: "Familiar (hasta 6 miembros)", basePriceArs: 2_799, maxMembers: 6 },
    ],
  },
] as const;

async function main() {
  console.log("🌱 Seeding servicios y planes...");

  for (const svc of SERVICES) {
    const service = await prisma.service.upsert({
      where: { type: svc.type },
      update: { name: svc.name, brandColor: svc.brandColor },
      create: { name: svc.name, type: svc.type, brandColor: svc.brandColor },
    });

    for (const plan of svc.plans) {
      await prisma.servicePlan.upsert({
        where: {
          // upsert por serviceId + name para evitar duplicados al re-seedear
          serviceId_name: { serviceId: service.id, name: plan.name },
        },
        update: { basePriceArs: plan.basePriceArs, maxMembers: plan.maxMembers },
        create: {
          serviceId: service.id,
          name: plan.name,
          basePriceArs: plan.basePriceArs,
          maxMembers: plan.maxMembers,
        },
      });
    }

    console.log(`  ✓ ${svc.name} (${svc.plans.length} planes)`);
  }

  console.log("✅ Seed completo");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
