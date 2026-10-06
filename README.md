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

| Command               | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Development server                       |
| `npm run build`       | Production build                         |
| `npm run start`       | Start production server                  |
| `npm run lint`        | ESLint                                   |
| `npm run typecheck`   | TypeScript type checking                 |
| `npm test`            | Unit tests (engine, validation, marketing fixtures) |
| `npm run verify:rls`  | Live persistence + RLS checks (real DB)  |
| `npm run verify:auth-cookie` | Live check that the session cookie stays readable (auth island) |
| `npm run qa:smoke`    | Page smoke, public + authenticated (app on :3000)  |
| `npm run qa:invariants` | Build-time public-surface guards (wired to `prebuild`) |

## Project structure

```
src/
  app/
    (public)/           Marketing site: /, /features, /how-it-works, /about, /contact, /calculator
    (app)/              Private app: /dashboard, /semesters, /courses, /gpa, /calendar
    auth/               /auth/login, /auth/signup, /auth/callback
  calculations/         Pure calculation engine + unit tests (no UI, no DB)
  components/
    analytics/          Charts (Recharts), status badge
    auth/               Login/signup forms
    marketing/          Public site header/footer
    courses/            Course dialogs, summary, grading scale editor
    dashboard/          Stat cards, course cards, semester overview, upcoming events
    events/             Calendar rows, countdown badge, event dialog
    layout/             App shell: sidebar, topbar, nav, theme
    semesters/          Semester dialogs, course list, summary strip
    shared/             Cross-feature UI (confirm dialog)
    structure/          Category/assessment dialogs + cards
    targets/            Target analysis, target form, what-if simulator
    ui/                 shadcn/ui primitives
  features/             Server actions + zod validations + queries per entity
    dashboard/          Dashboard/semester overview data assembly
    events/             Academic-event CRUD + upcoming-event queries
    gpa/                GPA/CGPA + semester history overview
    scores/             DB rows → calculation engine inputs + analytics view-model
    targets/            Target CRUD + data-driven presets
  lib/
    supabase/           Server/proxy session layer + env guard
    format.ts           Display formatting over engine rounding
    utils.ts
  validations/          Shared validation primitives
  types/                Database row types
  proxy.ts              Session refresh + route protection (Next.js 16)
                        PUBLIC ALLOWLIST: /, /features, /how-it-works,
                        /about, /contact, /calculator, /auth/* —
                        everything else requires a session (default-deny)
scripts/
  verify-rls.mjs        Live RLS + persistence verification (throwaway QA users)
  verify-auth-cookie.mjs Live session-cookie contract check (name, httpOnly, Path, SameSite)
  qa-smoke.mjs          Public + authenticated page assertions (seeded QA data)
  qa-invariants.mjs     Build-time public-surface guards (rules A–F)
supabase/migrations/    Versioned SQL migrations
```

## Typography

Space Grotesk (display headings — geometric, technical) drives all h1–h6 via
`--font-heading`, paired with Manrope (primary UI typeface — refined geometric
sans) and Geist Mono for tabular marks/figures, all loaded via `next/font`.

## Project status

- ✅ **Phase 1 — Foundation**: scaffold, Supabase integration, auth, schema, RLS, app shell, navigation, theme
- ✅ **Phase 2 — Academic structure**: semester/course/category/assessment CRUD, validation, pure calculation engine (47 unit tests)
- ✅ **Phase 3 — Dashboard**: main dashboard, semester overview, course cards, course detail scores, category breakdown, strongest/weakest summaries
- ✅ **Phase 4 — Analytics**: performance-over-time, category comparison, assessment progression, target progress, status (§18), trend analysis (§17)
- ✅ **Phase 5 — Target engine**: target selection (Pass/grading-scale presets/custom), required-score analysis with achieved/achievable/impossible detection, interactive what-if simulator
- ✅ **Phase 6 — GPA/CGPA**: per-course configurable grading scales, letter grades, credit-weighted semester GPA, CGPA across completed semesters, historical semester performance
- ✅ **Phase 6.5 — Public site + app boundary**: marketing pages at `/`, `/features`, `/how-it-works`, `/about`, `/contact` (public allowlist in `lib/supabase/proxy.ts` — **default-deny for everything else**), auth at `/auth/login` + `/auth/signup`, dashboard migrated to `/dashboard`; public and authenticated layouts fully separated
- ✅ **Phase 6.6 — Marketing experience pass**: glass/depth/motion design system in `globals.css` (`gp-glass`, `gp-grid`, `gp-ambient`, reveal/float/drift/fill animations with `prefers-reduced-motion` + `scripting: none` failsafes), motion primitives (`Reveal`, `Float`, `CountUp`, `MetricFill`, `Tilt`), Bloomberg-dense demo visuals driven by one locked fixture (`visuals/demo-data.ts`, engine-verified by unit test), engine-backed public `/calculator`, client-side auth island (SSR renders signed-out; the header swaps Login→Dashboard after hydration from the readable session cookie — **no Supabase import on the public surface**, enforced by `qa:invariants` rule D), nav trimmed to Features/About/Contact with Get Started → `/calculator`, and `qa:smoke` grown to 102 checks covering both anonymous and signed-in public-page behaviour
- ✅ **Phase 7 — Calendar/events**: academic events per course (CT, Quiz, Assignment, Midterm, Final, Presentation, Viva, Project, or free-text Custom) with date, notes and completion state; `/calendar` page (Upcoming + Earlier & completed), countdown badges (Today / Tomorrow / In N days / N days ago, amber ≤3 days, red overdue, green completed), one-click completion toggle, and the "Upcoming assessments" section on the dashboard. Date math is local-date-only and DST-safe in `lib/dates.ts` (rejects impossible dates)
- ✅ **Phase 8 — Production QA pass**: shared `lib/format.ts` date rendering (fixes UTC off-by-one west of UTC) replacing four local copies, ISO date validation round-trip (rejects impossible dates like `2026-02-31`), skip-to-content links in both layouts, branded 404, nav active-state simplification, calendar query error state, dead-code cleanup (unused browser client util + separator component), validation schema tests (107 unit tests total) and smoke suite grown to 85 checks
- ✅ **Phase 9 — AuReUs marketing restructure**: homepage resequenced nav → hero → features → target engine → what-if → GPA → about → FAQ → contact → closing CTA → footer (new `components/marketing/sections/`), anchor nav (Features/About/FAQ → `/#features`/`/#about`/`/#faq`), Space Grotesk headings (`--font-space-grotesk` → `--font-heading`, global `h1–h6`), new AuReUs-shape copy for hero/footer/about/FAQ/contact, interactive FAQ accordion + what-if demo with `aria-expanded`/`aria-controls` semantics, hero demo card locked to the engine chain (60/100 → 62.5% → 25/40), dead visuals removed (assessment timeline, GPA panel, what-if panel); `qa:smoke` grown to 110 checks
- ✅ **Phase 10 — Floating glass cards**: every `gap-px` shared-border "table" grid removed from the marketing surface (homepage features, `/features` modules, `/about` principles, `/how-it-works` workflow flow) and replaced with independent `gp-card` glass cards in real-gap grids (`gap-4 md:gap-5`); per-card hover (150ms lift + 200ms border/background brighten, `gp-card-no-lift` for the what-if slider, `gp-card-accent` for CGPA/62.5% callout), per-card staggered one-shot entrance via new `Reveal variant="card"` (`gp-reveal-card`, 12px rise, 70–80ms steps), `size-10 rounded-lg bg-primary/10` emerald icon tiles with `group-hover` brighten/scale, target-engine split into individual metric cards, FAQ promises + tip as mini-cards, closing CTA wrapped in a card; pure CSS/Tailwind — no JS listeners, no new deps, static prerender and invariants A–F untouched
- ⬜ Notifications — future work

## Security

- Supabase Auth (email/password) with PKCE callback handling
- Row Level Security on every table — the database enforces ownership, not the frontend
- Only `NEXT_PUBLIC_*` (anon) keys ship to the client; no service-role secrets in the repo
