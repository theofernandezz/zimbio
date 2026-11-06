# Zimbio

Web app for organizing shared streaming subscriptions (Netflix, Spotify, Disney+, etc.). One person creates a group for a shared plan, invites the others with a link, and Zimbio splits the monthly cost, tracks who has paid and shares the account access with the members.

Built as a university project at UADE.

**Live demo:** https://zimbio.vercel.app

## Features

- An admin creates a group for a family or shared plan and invites members with a link.
- The monthly total (21% VAT included) is split evenly among the members.
- Each member is marked as pending, paid or overdue for every billing cycle. The admin starts each new cycle.
- The admin can remove members who haven't paid yet. Participants see their share, the payment details (Mercado Pago alias / CVU) and can leave the group.
- The admin stores the account's login in a vault, encrypted with AES-256-GCM. Only group members can see it.
- Emails are sent when someone joins or leaves a group and when a new cycle starts. A daily cron job reminds members of pending payments before the cycle closes.
- Login with email and password (bcrypt) or Google. Sessions use HMAC-signed cookies.

## Tech stack

- **Framework:** Next.js 16 (App Router, Server Actions) + React 19 + TypeScript
- **Database:** PostgreSQL on Neon (serverless) with Prisma ORM
- **Validation:** Zod
- **UI:** Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion
- **Email:** Resend
- **Deployment:** Vercel, with Vercel Cron for the daily payment reminders

## Project structure

```
app/
  (auth)/          login, register, forgot password
  (app)/           dashboard (admin / participant), groups, vault, settings, FAQ
  api/auth/google  Google OAuth flow
  api/cron/        daily payment reminders
lib/
  services/        data access for users, groups and service plans
  email/           Resend client, templates and notifications
  tax-engine.ts    price and per-member share calculation
  billing-cycle.ts monthly cycle logic
  encryption.ts    AES-256-GCM for the credential vault
prisma/
  schema.prisma    data model
  seed.ts          streaming services and plans
```

## Getting started

Requirements: Node.js 20+, pnpm, and a PostgreSQL database (for example, a free Neon project).

```bash
pnpm install
```

Create a `.env` file:

```bash
DATABASE_URL=postgresql://...            # pooled connection (app)
DATABASE_URL_UNPOOLED=postgresql://...   # direct connection (Prisma migrations)
SESSION_SECRET=<random string>
VAULT_ENCRYPTION_KEY=<64 hex chars, e.g. from `openssl rand -hex 32`>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Google sign-in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional: email notifications (the app keeps working without them)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Protects the cron endpoint
CRON_SECRET=
```

Apply the migrations, load the streaming services and plans, and start the dev server:

```bash
pnpm dlx dotenv-cli -e .env -- pnpm prisma migrate deploy
pnpm dlx dotenv-cli -e .env -- pnpm prisma db seed
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).
