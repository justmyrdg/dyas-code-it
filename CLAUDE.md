# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

DyasCodeIT is a gamified coding-education platform with a UNO-card-game visual theme, and an AI teaching assistant called "Dyas". Full details:

@docs/DyasCodeIT_PROJECT_SUMMARY.md
@docs/DyasCodeIT_ARCHITECTURE.md
@docs/DyasCodeIT_DESIGN_SYSTEM.md

Detailed product spec (subscriptions, sandbox/version history, anti-cheating, certificates, Dyas AI service details): `docs/DyasCodeIT_PLAN.md`.

## Project state

The repo is scaffolded and under active development. Current state per app:

- **`apps/backend`**: a real Express + Sequelize/Postgres API. Auth (email/password + GitHub/Google OAuth), curriculum (topics/chapters/lessons/activities/assessments), classes/enrollment, student progress, grading, code execution (via Piston), and Socket.io realtime are implemented. See Architecture notes below.
- **`apps/landing`**: the public marketing site (hero, features, how-it-works, pricing, CTA, footer). Fully built out and is where most landing-page iteration happens.
- **`apps/frontend`**: the authenticated product app. Has login/register, role-guarded dashboards, and role-scoped pages for admin (topic editor), teacher (class list/detail), and student (my-classes, class-view, lesson-viewer, activity-player, assessment).
- **`shared`**: nearly empty — `src/models/index.ts` has no exported models yet despite `src/index.ts` re-exporting from it. Backend and frontend each define their own model/type files independently (no shared types package is actually used yet).

## Commands

Run from the repo root unless noted.

```bash
npm install                  # installs all four workspaces
npm run dev                  # concurrently: backend (3000) + landing (4200) + frontend (4201)
npm run dev:backend          # backend only
npm run dev:landing          # landing only
npm run dev:frontend         # frontend only
npm run build                # builds backend, landing, frontend in sequence
```

Per-workspace:

```bash
# apps/landing, apps/frontend (Angular)
npm run dev                  # ng serve
npm run build                # ng build
npm test                     # ng test — Angular's @angular/build:unit-test (Vitest-backed), not Karma/Jasmine

# apps/backend
npm run dev                  # nodemon src/server.ts
npm run build                # tsc
npm test                     # vitest run
npm run test:watch           # vitest
npm run db:migrate           # ts-node src/config/migrator.ts up
npm run db:migrate:down      # ts-node src/config/migrator.ts down
```

Angular's `ng test` and the backend's `vitest` both accept a normal path/pattern filter to run a single spec file.

There is no root-level lint/typecheck script and no ESLint config anywhere in the repo currently.

## Architecture notes

- **Two separate Angular projects, not one.** `apps/landing` and `apps/frontend` are independent Angular CLI projects (own `angular.json`, `package.json`, `styles.css`) — not a shared Angular workspace with multiple projects in one `angular.json`. They are linked only at runtime: `apps/landing`'s header/hero/footer/pricing/CTA components read `environment.appUrl` (`http://localhost:4201` in dev) and build plain `<a [href]>` links to `apps/frontend`'s `/login` route — `routerLink` only works for navigation *within* the same Angular app, so cross-app links must be absolute URLs, never `routerLink`.
- **Tailwind config is duplicated on purpose, not shared.** Both `apps/landing/src/styles.css` and `apps/frontend/src/styles.css` independently define the same `@theme` block (`--color-uno-red/yellow/blue/green/black`) and the same `.uno-*` component/utility classes (`.uno-card`, `.uno-btn-*`, `.uno-text-outline`, `.uno-animate-in`, `.uno-float`). When changing the design system, both files need the same edit — there is no shared UI package yet.
- **Tailwind CSS 4, CSS-first config** — `@theme` block directly in each app's `src/styles.css`, no `tailwind.config.js` anywhere.
- Section-level layout convention in `apps/landing`: the outer `<section>`/`<header>`/`<footer>` tag carries no padding; the inner `mx-auto max-w-7xl` content wrapper carries `px-5 sm:px-20` (plus its own `py-*`). Keep new sections consistent with this — don't put padding on both levels.
- Backend `FRONTEND_URL`/`APP_URL` env vars drive CORS origins for both landing (4200) and frontend (4201).

### Backend request/auth flow

- `app.ts`: `helmet()` → `cors({credentials:true})` → `express.json()`/`urlencoded()` → `cookie-parser` → `passport.initialize()`. Auth is **stateless** — no Express sessions. Routes mount at `/api/auth`, `/api/admin`, `/api/teacher`, `/api/student`, `/api/code`, plus `/api/health`, with a central error handler last.
- `server.ts` wraps the Express app in `http.createServer` so Socket.io can share the port, calls `sequelize.authenticate()`, runs migrations on boot (or syncs models directly if `DB_SYNC=true`), then initializes realtime. It also promotes a user matching `ADMIN_EMAIL` to the admin role, since self-registration only allows student/teacher.
- **Auth is a hybrid, collapsed to JWT-in-cookie**: email/password (bcryptjs) and Passport OAuth (GitHub + Google) both end in a signed JWT set as an httpOnly cookie (`services/auth.service.ts`), read by `middleware/auth.middleware.ts` (`requireAuth`) and `middleware/role.middleware.ts` (`requireRole`). OAuth callback account-linking only auto-links by email when the provider reports the email verified (see `config/passport.ts` — this was a deliberate security fix, don't relax it).
- **DB/ORM**: Sequelize (Postgres via `pg`), driven by `DATABASE_URL` (`config/database.ts`). Migrations use a **custom Umzug runner**, not sequelize-cli — `config/migrator.ts` globs `src/migrations/*.{ts,js}` with `SequelizeStorage`; run via the `db:migrate` scripts above, not `sequelize-cli db:migrate`.
- **Models** (`src/models/`, associations centralized in `models/index.ts`): `User`, `Topic`/`Chapter`/`Lesson` (curriculum tree), `Class`/`ClassEnrollment`, `StudentProgress`, `MiniActivity`/`ActivitySubmission`, `ChapterAssessment`/`AssessmentSubmission`.
- **Code execution** (`services/code-execution.service.ts`) calls a hosted **Piston** instance over HTTP (`PISTON_URL`, defaults to the public `emkc.org` instance) rather than sandboxing locally — this is intentional given the no-Docker constraint. Supports python/javascript/cpp/java.
- **Realtime** (`realtime/io.ts`): Socket.io with two namespaces — `/dyas` (AI assistant streaming, not yet built out) and `/projects` (live teacher feedback) — each authenticated via the same JWT cookie, joining a `user:<id>` room.

### Frontend auth/routing

- `core/auth.store.ts`: signal-based `AuthStore` (`user`, `status` signals) with a single-flight `ensureLoaded()` that calls `/auth/me`.
- `core/auth.guards.ts`: `authGuard`, `roleGuard(role)`, `guestGuard` all await `ensureLoaded()` then redirect via `dashboardPathFor`.
- `core/api.ts`: `apiFetch` wrapper using `fetch` with `credentials: 'include'` (cookie-based auth, matches the backend's JWT-in-cookie model) and a typed `ApiError`.
- `app.routes.ts`: role-guarded lazy routes — `/admin`, `/teacher`, `/student` each gated by `authGuard` + `roleGuard(role)`, rendering the `Shell` page (role-scoped layout) with role-specific children; `/login` is gated by `guestGuard`; `/dashboard` (the OAuth callback redirect target) is gated by `authGuard` only and routes to the right role dashboard.
- `apps/frontend/src/app` has no header/footer components (they live only in `apps/landing`); `apps/frontend`'s `app.html` is a bare `<router-outlet />`.

## Resolved decisions (docs disagree — these are the authoritative answers)

- **Monorepo tooling: npm workspaces + `concurrently`**, not NX. `DyasCodeIT_ARCHITECTURE.md` and `DELIVERY_SUMMARY.txt` call this an "NX monorepo," but the actual setup never invokes `nx` — it's plain npm workspaces. Do not add `nx.json` or NX commands.
- **AI provider for Dyas: Claude API only.** The backend `.env.example` intentionally has only `CLAUDE_API_KEY`, no `OPENAI_API_KEY` — some docs still list both; only Claude is used.
- **Auth: OAuth2 (GitHub/Google) *and* email/password, not OAuth-only.** `DyasCodeIT_PROJECT_SUMMARY.md` and `DyasCodeIT_ARCHITECTURE.md` say "OAuth2 only, no passwords stored" — superseded when email/password auth was implemented (bcryptjs, see Architecture notes above).
- **Landing site and authenticated app are separate frontends**, not one Angular app with mixed public/authenticated routes. See Architecture notes above.
- **No Docker** — this is a deliberate, repeated decision in the docs. Do not introduce Docker/docker-compose unless explicitly asked. Code execution is delegated to an external Piston instance instead of local sandboxing for this reason.
- **Backend test runner: Vitest** (`apps/backend/vitest.config.ts`, `npm test` → `vitest run`). Coverage is still sparse (one real spec, `services/grading.service.test.ts`) — don't assume broad test coverage exists.
- Deployment: PM2, Heroku, or AWS EC2 (no single option has been chosen yet — ask before implementing deploy config).

## Design rules

- **No emoji in the UI** — use SVG icons instead. (The docs themselves are emoji-heavy for readability, but that doesn't apply to product UI.)
- UNO card-game aesthetic: bold primary colors (red `#FF4444`, yellow `#FFD700`, blue `#0066FF`, green `#00AA44`, black `#222222`), card-based components, strong `border-2`/`border-4` black borders. Full component specs in `@docs/DyasCodeIT_DESIGN_SYSTEM.md`.
