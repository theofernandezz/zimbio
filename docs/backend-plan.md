# Plan de Backend — Zimbio MVP

> Documento de referencia para la migración de mock (localStorage) a base de datos real.
> Seguir en orden. Cada sección tiene verificación explícita antes de continuar.

---

## Stack

| Capa | Tecnología | Razón |
|---|---|---|
| Base de datos | **Neon** (PostgreSQL serverless) | Cuenta ya existente, free tier generoso |
| ORM | **Prisma** | Type-safe, migraciones, seed incluido |
| Auth | **bcrypt + cookie de sesión** | Sin overhead de NextAuth, control total |
| Backend | **Next.js Server Actions** | Sin API routes innecesarias |
| Hosting | Vercel (ya integrado con Neon) | Deploy automático |

---

## Esquema de base de datos

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String   @map("password_hash")
  avatarColor  String   @map("avatar_color")
  createdAt    DateTime @default(now()) @map("created_at")

  adminOf  Group[]       @relation("GroupAdmin")
  memberships GroupMember[]
  payments Payment[]

  @@map("users")
}

// Servicios de streaming — se cargan via seed, no se crean desde la app
model Service {
  id           String  @id @default(cuid())
  name         String
  type         String  @unique  // "netflix" | "spotify" | etc.
  basePriceUsd Float   @map("base_price_usd")
  brandColor   String  @map("brand_color")

  groupServices GroupService[]

  @@map("services")
}

model Group {
  id           String   @id @default(cuid())
  name         String
  adminId      String   @map("admin_id")
  maxMembers   Int      @map("max_members")
  alias        String   // Mercado Pago alias
  cvu          String   // CVU para transferencias
  billingCycle String   @map("billing_cycle")  // "Mayo 2026"
  inviteToken  String   @unique @map("invite_token")
  createdAt    DateTime @default(now()) @map("created_at")

  admin    User           @relation("GroupAdmin", fields: [adminId], references: [id])
  services GroupService[]
  members  GroupMember[]
  vault    VaultEntry?
  payments Payment[]

  @@map("groups")
}

// Relación many-to-many: un grupo puede tener varios servicios
model GroupService {
  groupId   String @map("group_id")
  serviceId String @map("service_id")

  group   Group   @relation(fields: [groupId], references: [id], onDelete: Cascade)
  service Service @relation(fields: [serviceId], references: [id])

  @@id([groupId, serviceId])
  @@map("group_services")
}

model GroupMember {
  id            String   @id @default(cuid())
  groupId       String   @map("group_id")
  userId        String   @map("user_id")
  paymentStatus String   @default("pending") @map("payment_status")  // "pending" | "paid" | "overdue"
  amountDue     Float    @map("amount_due")    // ARS
  amountPaid    Float    @default(0) @map("amount_paid")  // ARS
  joinedAt      DateTime @default(now()) @map("joined_at")

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])

  @@unique([groupId, userId])
  @@map("group_members")
}

// Credenciales del servicio que el admin carga para los participantes
// TODO: encriptar email y password antes de guardar en producción (AES-256 o similar)
model VaultEntry {
  id       String @id @default(cuid())
  groupId  String @unique @map("group_id")
  email    String
  password String  // ⚠️ plaintext por ahora — encriptar antes de producción real

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@map("vault_entries")
}

model Payment {
  id        String    @id @default(cuid())
  groupId   String    @map("group_id")
  userId    String    @map("user_id")
  amountArs Float     @map("amount_ars")
  month     String    // "Mayo 2026"
  status    String    @default("pending")  // "pending" | "paid"
  paidAt    DateTime? @map("paid_at")

  group Group @relation(fields: [groupId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@map("payments")
}
```

---

## Estructura de carpetas

```
zimbio/
├── prisma/
│   ├── schema.prisma       ← esquema completo (arriba)
│   └── seed.ts             ← carga los servicios de streaming
│
├── lib/
│   ├── db.ts               ← singleton del Prisma client
│   ├── auth.ts             ← hash password, verify, crear/leer cookie de sesión
│   └── services/           ← lógica de negocio, llamada desde Server Actions
│       ├── users.ts        ← createUser, getUserByEmail, getUserById
│       ├── groups.ts       ← createGroup, getGroupsByUser, getGroupById, updateMemberPayment
│       └── vault.ts        ← getVaultEntry, upsertVaultEntry
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx    ← ya existe, conectar con Server Action
│   │   │   └── actions.ts  ← loginAction: verifica email+pass, crea cookie
│   │   └── register/
│   │       ├── page.tsx    ← ya existe
│   │       └── actions.ts  ← registerAction: hashea pass, crea user, crea cookie
│   │
│   ├── grupos/
│   │   ├── page.tsx        ← conectar con getGroupsByUser()
│   │   └── crear/
│   │       ├── page.tsx    ← ya existe
│   │       └── actions.ts  ← createGroupAction: crea group + miembros placeholder
│   │
│   ├── dashboard/
│   │   ├── admin/
│   │   │   ├── page.tsx    ← conectar con getGroupById()
│   │   │   └── actions.ts  ← updatePaymentStatusAction
│   │   └── participante/
│   │       ├── page.tsx    ← conectar con getGroupById()
│   │       └── actions.ts  ← reportPaymentAction
│   │
│   ├── vault/
│   │   ├── page.tsx        ← conectar con getVaultEntry()
│   │   └── actions.ts      ← upsertVaultAction
│   │
│   └── settings/
│       ├── page.tsx        ← conectar con updateUser()
│       └── actions.ts      ← updateNameAction, updatePasswordAction
│
└── middleware.ts            ← proteger rutas autenticadas, redirigir si no hay sesión
```

---

## Variables de entorno

```env
# .env.local

DATABASE_URL="postgresql://..."   # connection string de Neon (pooled)
DATABASE_URL_UNPOOLED="..."       # para migraciones (direct connection)

SESSION_SECRET="..."              # string random de 32+ chars para firmar la cookie
```

---

## Pasos de implementación (en orden)

### 1. Setup inicial
- [ ] `npm install prisma @prisma/client bcryptjs`
- [ ] `npm install -D @types/bcryptjs`
- [ ] `npx prisma init` → genera `prisma/schema.prisma`
- [ ] Pegar esquema completo en `schema.prisma`
- [ ] Configurar `DATABASE_URL` en `.env.local` con la connection string de Neon
- [ ] `npx prisma migrate dev --name init` → crea tablas en Neon
- [ ] Verificar tablas en el dashboard de Neon ✓

### 2. Seed de servicios
- [ ] Escribir `prisma/seed.ts` con los 6 servicios (Netflix, Spotify, Disney+, HBO, YouTube, Apple Music)
- [ ] `npx prisma db seed`
- [ ] Verificar en Neon que la tabla `services` tiene los 6 registros ✓

### 3. Prisma client singleton
- [ ] Crear `lib/db.ts`
- [ ] Verificar que no hay múltiples instancias en dev (hot reload) ✓

### 4. Auth
- [ ] Crear `lib/auth.ts` con `hashPassword`, `verifyPassword`, `createSession`, `getSession`
- [ ] Sesión = cookie HTTP-only con el `userId` firmado con `SESSION_SECRET`
- [ ] Crear `app/(auth)/login/actions.ts` → `loginAction`
- [ ] Crear `app/(auth)/register/actions.ts` → `registerAction`
- [ ] Conectar ambas páginas con sus Server Actions (reemplazar lógica localStorage)
- [ ] Crear `middleware.ts` para proteger `/grupos`, `/vault`, `/settings`, `/dashboard/*`
- [ ] Verificar: login → redirige a `/home`, sin sesión → redirige a `/login` ✓

### 5. Grupos
- [ ] Crear `lib/services/groups.ts`
- [ ] Crear `app/grupos/crear/actions.ts` → `createGroupAction`
- [ ] Conectar `app/grupos/page.tsx` para leer de DB en lugar de localStorage
- [ ] Conectar `app/grupos/creado/page.tsx`
- [ ] Verificar: crear grupo → aparece en `/grupos` ✓

### 6. Dashboard admin + participante
- [ ] Conectar `app/dashboard/admin/page.tsx` con DB
- [ ] Crear `updatePaymentStatusAction` en admin
- [ ] Conectar `app/dashboard/participante/page.tsx`
- [ ] Verificar: toggle de pago persiste tras recargar ✓

### 7. Vault
- [ ] Crear `lib/services/vault.ts`
- [ ] Crear `app/vault/actions.ts` → `upsertVaultAction`
- [ ] Conectar `app/vault/page.tsx` para leer/escribir de DB
- [ ] Verificar: admin guarda credenciales → participante las ve ✓

### 8. Settings
- [ ] Crear `app/settings/actions.ts` → `updateNameAction`, `updatePasswordAction`
- [ ] Conectar `app/settings/page.tsx`
- [ ] Verificar: cambio de nombre refleja en sidebar sin recargar ✓

### 9. Limpieza final
- [ ] Eliminar `lib/mock-data.ts` (o dejar como fallback de desarrollo)
- [ ] Eliminar `lib/user-groups.ts`
- [ ] Eliminar hooks que leen de localStorage (`use-all-groups`, `use-current-user`, `use-vault`)
- [ ] Asegurarse de que ningún componente importa de mock-data

---

## Decisiones pendientes / TODO para producción

- **Encriptación del vault**: las contraseñas de servicios están en texto plano. Antes de producción real implementar AES-256 con una `VAULT_SECRET` en env vars.
- **Invite token**: actualmente es un string random. Evaluar expiración y uso único.
- **Rate limiting**: en login/register para evitar fuerza bruta.
- **Refresh de sesión**: la cookie no expira automáticamente — definir TTL.

---

*Última actualización: Mayo 2026*
