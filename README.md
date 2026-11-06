# Zimbio

Web app for organizing shared streaming subscriptions (Netflix, Spotify, Disney+, etc.). One person creates a group for a shared plan, invites the others with a link, and Zimbio splits the monthly cost, tracks who has paid and shares the account access with the members.

Built as a university project at UADE.

**Live demo:** https://zimbio.vercel.app

## Features

- **Groups and invitations**: an admin creates a group for a family or shared plan and invites members with a unique invite link.
- **Cost splitting**: the monthly total, with 21% VAT included, is split evenly among the members.
- **Payment tracking**: each member is marked as pending, paid or overdue for every monthly billing cycle. The admin starts each new cycle.
- **Two roles**:
  - The **admin** manages members and can remove pending ones (not members who already paid).
  - A **participant** sees their share and payment details (Mercado Pago alias / CVU) and can leave the group.
- **Credential vault**: the admin stores the service's login, encrypted with AES-256-GCM, and only group members can see it.
- **Email notifications**: emails are sent when someone joins or leaves a group and when a new cycle starts. A daily cron job reminds members of pending payments when the cycle is about to close.
- **Authentication**: users sign in with email and password (bcrypt) or with Google OAuth. Sessions use HMAC-signed cookies.

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
