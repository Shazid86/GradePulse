# GradePulse

**Personal Academic Performance Command Center**

Track every mark. Understand your progress. Know what comes next.

GradePulse transforms raw academic records — class tests, quizzes, assignments, attendance, midterms, finals, labs, projects — into academic intelligence: current standing, required scores, target achievability, trends, GPA/CGPA.

## Tech stack

- Next.js (App Router) · React · TypeScript
- Tailwind CSS · shadcn/ui · Lucide React · next-themes
- Supabase (PostgreSQL + Auth + Row Level Security)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   copy .env.example .env.local
   ```

   Fill in your Supabase project's URL and anon key (Project Settings → API). Never commit `.env.local`.

3. **Apply the database schema**

   Open your Supabase project → **SQL Editor** → paste and run
   [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql).

   The migration creates all core tables (`semesters`, `courses`, `assessment_categories`, `assessments`, `targets`, `academic_events`), foreign keys, indexes, constraints, `updated_at` triggers, and RLS policies so each user can only access their own data.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000, sign up, confirm your email (or disable email confirmations in Supabase Auth settings for quick local testing), and sign in.

## Scripts

| Command             | Purpose                        |
| ------------------- | ------------------------------ |
| `npm run dev`       | Development server             |
| `npm run build`     | Production build               |
| `npm run start`     | Start production server        |
| `npm run lint`      | ESLint                         |
| `npm run typecheck` | TypeScript type checking       |

## Project structure

```
src/
  app/                  Routes: (auth) login/signup, (app) dashboard, auth/callback
  components/
    auth/               Login/signup forms
    layout/             Shell: sidebar, topbar, nav, theme
    ui/                 shadcn/ui primitives
  features/             Feature logic (auth actions, …)
  lib/
    supabase/           Client/server/proxy session layer + env guard
    utils.ts
  validations/          Zod schemas
  types/                Database row types
  proxy.ts              Session refresh + route protection (Next.js 16)
supabase/migrations/    Versioned SQL migrations
```

## Project status

- ✅ **Phase 1 — Foundation**: project scaffold, Supabase integration, auth, schema, RLS, app shell, navigation, theme
- ⬜ Phase 2+ — academic structure, dashboard, analytics, target engine, GPA/CGPA, calendar, polish

## Security

- Supabase Auth (email/password) with PKCE callback handling
- Row Level Security on every table — the database enforces ownership, not the frontend
- Only `NEXT_PUBLIC_*` (anon) keys ship to the client; no service-role secrets in the repo
