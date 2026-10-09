# KamKarOAI

An AI automation platform where users **bring their own API key** (OpenAI, Anthropic or Google Gemini), pick any model, and build multi-step workflows such as *input → summarize → translate → output*.

## Features

- **Auth:** sign up, log in, log out, change password, forgot/reset password by email, and email verification (Better Auth)
- **BYOK API keys:** stored with AES-256-GCM encryption and never sent back to the browser. A "Test" button checks that a key works.
- **Playground:** send one prompt to any model with any of your keys
- **Workflow builder:** drag-and-drop canvas (React Flow) with Input, AI Prompt, Transform and Output nodes
- **Run history:** see each step's output, timing and token usage
- **Admin panel** (`/admin`): only the `ADMIN_EMAIL` account can open it, and only after that email is verified. It shows platform stats, a user list with search, disable/delete user, and recent runs and errors.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma + PostgreSQL (Neon) · Better Auth · Vercel AI SDK · React Flow · Inngest · Resend · Zod

## Getting started

```bash
npm install
cp .env.example .env        # fill in the values (see comments in the file)
npx prisma migrate dev      # create tables
npm run dev                 # http://localhost:3000
npm run dev:inngest         # in a second terminal: runs workflows in the background
```

1. Create a free Postgres database at [neon.tech](https://neon.tech) and paste its connection string into `DATABASE_URL`.
2. Generate `BETTER_AUTH_SECRET` and `ENCRYPTION_KEY` with the commands in `.env.example`.
3. (Optional) Add a [Resend](https://resend.com) API key so emails actually send. Without it, reset and verification links are printed to the server console.
4. Sign up with `rehanhuzaifa035@gmail.com` and click the verification link. The **Admin** link then appears in the nav.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm test` | Workflow engine unit tests |
| `npm run db:migrate` · `npm run db:deploy` | Prisma migrations (dev · production) |

## Deploying to Vercel

1. Import the repo in Vercel.
2. Add every variable from `.env.example` (plus `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`, without `INNGEST_DEV`), and set `BETTER_AUTH_URL` to your production URL.
3. Set the build command to `prisma migrate deploy && next build`. The project runs `prisma generate` automatically on `postinstall`.

## Project layout

```
src/
  app/(auth)/        login, signup, forgot-password, reset-password
  app/(app)/         dashboard, workflows, runs, playground, settings
  app/admin/         admin panel (server-side gated)
  app/actions/       server actions (keys, workflows, admin)
  app/api/           Better Auth, Inngest, workflow run + status endpoints
  lib/auth.ts        Better Auth config
  lib/crypto.ts      API-key encryption
  lib/ai/            provider factory + model lists
  lib/workflow/      graph schema + execution engine (+ tests)
prisma/schema.prisma
```

## Roadmap

- HTTP/webhook node and conditional branches
- Scheduled runs (Vercel Cron / Inngest)
- Streaming output, per-user rate limits, usage cost estimates
