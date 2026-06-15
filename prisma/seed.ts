import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ─── Precios ARS con impuestos (tarjeta USD, junio 2026) ─────────────────────
// Fuente: impuestito.org. Actualizar manualmente cuando cambien.
// accessType:
//   "credentials" → admin carga usuario/contraseña al vault
//   "invitation"  → cada miembro se une con su propia cuenta (sin vault)

const SERVICES = [
  {
    name: "Netflix",
    type: "netflix",
    brandColor: "#E50914",
    plans: [
      { name: "Estándar (2 pantallas)",       basePriceArs: 18_449, maxMembers: 2, accessType: "credentials" },
      { name: "Estándar + 1 miembro extra",   basePriceArs: 25_090, maxMembers: 3, accessType: "invitation" },
      { name: "Premium (4 pantallas)",         basePriceArs: 24_599, maxMembers: 4, accessType: "credentials" },
      { name: "Premium + 1 miembro extra",    basePriceArs: 31_240, maxMembers: 5, accessType: "invitation" },
      { name: "Premium + 2 miembros extra",   basePriceArs: 37_880, maxMembers: 6, accessType: "invitation" },
    ],
  },
  {
    name: "Disney+",
    type: "disney_plus",
    brandColor: "#0063E5",
    plans: [
      { name: "Estándar con Anuncios (2 pantallas)", basePriceArs: 12_197, maxMembers: 2, accessType: "credentials" },
      { name: "Estándar (2 pantallas)",              basePriceArs: 15_857, maxMembers: 2, accessType: "credentials" },
      { name: "Premium (4 pantallas)",               basePriceArs: 24_396, maxMembers: 4, accessType: "credentials" },
      { name: "Estándar + 1 miembro extra",         basePriceArs: 25_363, maxMembers: 3, accessType: "invitation" },
      { name: "Premium + 1 miembro extra",          basePriceArs: 36_594, maxMembers: 5, accessType: "invitation" },
    ],
  },
  {
    name: "Max",
    type: "hbo_max",
    brandColor: "#5822B4",
    plans: [
      { name: "Básico con Anuncios (2 pantallas)", basePriceArs:  9_090, maxMembers: 2, accessType: "credentials" },
      { name: "Estándar (2 pantallas)",            basePriceArs: 11_796, maxMembers: 2, accessType: "credentials" },
      { name: "Platino (4 pantallas)",             basePriceArs: 14_133, maxMembers: 4, accessType: "credentials" },
    ],
  },
  {
    name: "Paramount+",
    type: "paramount_plus",
    brandColor: "#0064FF",
    plans: [
      { name: "Estándar (3 pantallas)", basePriceArs: 6_862, maxMembers: 3, accessType: "credentials" },
    ],
  },
  {
    name: "Crunchyroll",
    type: "crunchyroll",
    brandColor: "#F47521",
    plans: [
      { name: "Mega Fan (4 pantallas)", basePriceArs: 7_502, maxMembers: 4, accessType: "credentials" },
    ],
  },
  {
    name: "Spotify",
    type: "spotify",
    brandColor: "#1DB954",
    plans: [
      { name: "Dúo (2 cuentas)",      basePriceArs:  5_411, maxMembers: 2, accessType: "invitation" },
      { name: "Familiar (6 cuentas)", basePriceArs:  6_764, maxMembers: 6, accessType: "invitation" },
    ],
  },
  {
    name: "YouTube Premium",
    type: "youtube_premium",
    brandColor: "#FF0000",
    plans: [
      { name: "Dúo (2 miembros)",            basePriceArs:  8_240, maxMembers: 2, accessType: "invitation" },
      { name: "Familiar (hasta 6 miembros)", basePriceArs: 12_668, maxMembers: 6, accessType: "invitation" },
    ],
  },
  {
    name: "Apple TV+",
    type: "apple_tv_plus",
    brandColor: "#000000",
    plans: [
      { name: "Family Sharing (hasta 6 miembros)", basePriceArs: 12_463, maxMembers: 6, accessType: "invitation" },
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
          serviceId_name: { serviceId: service.id, name: plan.name },
        },
        update: {
          basePriceArs: plan.basePriceArs,
          maxMembers: plan.maxMembers,
          accessType: plan.accessType,
        },
        create: {
          serviceId: service.id,
          name: plan.name,
          basePriceArs: plan.basePriceArs,
          maxMembers: plan.maxMembers,
          accessType: plan.accessType,
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
