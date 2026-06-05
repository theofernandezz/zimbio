# Zimbio — Roadmap MVP

> Estado actual: build limpio, auth funcional (email/password + Google OAuth), flujo de invitación, dashboards admin y participante conectados a DB, vault y settings operativos.

---

## 🔴 Crítico (bloquea demo)

### 1. Form de creación de grupo — multi-servicio

**Por qué:** La propuesta de valor de Zimbio es poder gestionar *varios* servicios en un mismo grupo. El form actual solo permite un servicio.

**Cambios necesarios:**
- Schema: reemplazar `servicePlanId` (FK) en `Group` por una relación many-to-many con `ServicePlan`, o bien un array de IDs serializado
- Nueva migración Prisma
- Rediseño del form `/grupos/crear` con UX tipo "cards seleccionables" (minimalista, un servicio por card, multi-select)
- Actualizar dashboards para mostrar múltiples servicios

**Archivos a tocar:**
- `prisma/schema.prisma`
- `app/grupos/crear/` (page + actions)
- `components/grupos/`
- `app/dashboard/admin/page.tsx` y `participant-dashboard.tsx`
- `lib/services/groups.ts`

---

## 🟡 Funcionalidad faltante

### 2. Página `/grupos` — vista unificada

Listar todos los grupos del usuario (como admin Y como participante) en una sola vista.
Cada card debería mostrar: nombre del grupo, servicios, estado de pago, rol (Admin / Miembro).

**Archivos:** `app/grupos/page.tsx`

---

### 3. `/grupos/creado` — confirmar contenido

Verificar si la página post-creación tiene contenido real o es placeholder. Si es placeholder, construir una pantalla de éxito con el link de invitación y CTA para compartir por WhatsApp.

**Archivos:** `app/grupos/creado/page.tsx`

---

### 4. Limpiar archivos mock muertos

Estos archivos ya no se usan (la DB reemplaza todo) pero siguen en el repo:

- `lib/mock-data.ts`
- `lib/hooks/use-current-user.ts`
- `lib/hooks/use-all-groups.ts`
- `lib/hooks/use-vault.ts`
- `lib/user-groups.ts`

Antes de borrar, hacer `grep -r` para confirmar que ningún archivo los importa.

---

## 🟢 Mejoras UX

### 5. Error pages

Agregar `error.tsx` y `not-found.tsx` en las rutas dinámicas (`/invitacion/[token]`, `/dashboard/*`).

### 6. Loading states

Agregar `loading.tsx` en rutas con fetch pesado (`/grupos`, `/dashboard/*`, `/vault`).

### 7. Estado vacío mejorado en Vault

Cuando ningún grupo tiene credenciales cargadas, mostrar un estado vacío con instrucciones claras para el admin.

---

## 🔵 Producción / Deploy

### 8. Variables de entorno en Vercel

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de Neon PostgreSQL |
| `SESSION_SECRET` | String aleatorio ≥ 32 chars para HMAC |
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `NEXT_PUBLIC_APP_URL` | URL pública del deploy (ej: `https://zimbio.app`) |

### 9. Callback URL de Google OAuth

En Google Cloud Console → Credenciales → URIs de redireccionamiento autorizados, agregar:
```
https://zimbio.app/api/auth/google/callback
```
(además de la de localhost que ya existe)

### 10. Email de bienvenida

Omitido intencionalmente para el MVP. Retomar cuando haya SMTP/Resend configurado.
Trigger: registro exitoso (`app/(auth)/register/actions.ts`).

---

## ✅ Completado

- [x] Auth email/password con cookies HMAC firmadas
- [x] Google OAuth (manual, sin librerías)
- [x] Middleware de protección de rutas (Edge Runtime compatible)
- [x] Flujo de invitación por link (`/invitacion/[token]`)
- [x] Dashboard admin — toggle de pagos, link de invitación
- [x] Dashboard participante — informar pago, datos de transferencia
- [x] Settings — editar nombre, cambiar contraseña
- [x] Vault — guardar y ver credenciales por grupo
- [x] Onboarding home (`/home`)
- [x] AppShell async Server Component (sidebar + topbar con usuario real)
- [x] Logout via Server Action
- [x] Eliminado todo uso de localStorage y mock data
- [x] Build limpio (TypeScript + Next.js 16.2.6)
