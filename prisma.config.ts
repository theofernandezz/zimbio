import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Conexión directa (sin pooler) requerida para migraciones
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
