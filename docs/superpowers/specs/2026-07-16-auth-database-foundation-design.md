# Auth + Database Foundation — Design Spec

**Date**: 2026-07-16
**Status**: Approved
**Revision**: Register/login/logout switched from server-redirect form posts to an Angular `AuthService` making JSON API calls (fetch), per user request after initial approval. OAuth is unaffected — it still redirects, since that's inherent to the OAuth handshake.
**Scope note**: First sub-project decomposed from `docs/DyasCodeIT_PLAN.md`. That plan describes an entire platform (curriculum, classes, code execution, assessments, practice sandbox, certificates, Dyas AI, payments, anti-cheating) spread across many independent subsystems. This spec covers only the foundation every other subsystem depends on: a real database and working authentication. Later subsystems get their own spec/plan cycles.

## Goal

Turn `apps/backend` from a bare Express skeleton into a service backed by Postgres, with working email/password and GitHub/Google OAuth2 authentication, wired to the already-built `apps/frontend` login page. Prove the whole loop works end-to-end with a minimal placeholder authenticated page.

## Current state (what this changes)

- `apps/backend/src/app.ts` / `server.ts`: bare Express + CORS/Helmet, only `/api/health`. No DB connection, no models, no auth routes.
- `apps/backend/package.json` already lists `pg`, `sequelize`, `bcryptjs`, `jsonwebtoken` as dependencies (unused so far) and `.env.example` already has `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRY`, `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET` placeholders.
- `shared/src/models/index.ts` has no exported models despite `shared/src/index.ts` re-exporting from it.
- `apps/frontend/src/app/pages/login/login.html` already has:
  - `<form method="post" action="/api/auth/login">` and `.../register` — plain HTML form posts, no fetch/AJAX. **This is changing** — see "Form submit style" below.
  - `<a href="/api/auth/google">` / `<a href="/api/auth/github">` — plain links expecting a server-driven OAuth redirect. Unchanged by this revision — OAuth inherently needs a real browser navigation.
  - A hidden `role` field set from `activeRole()` (`'student' | 'teacher'`, driven by the `?role=` query param already bound via `input()`).
- `apps/frontend/src/app/app.routes.ts`: only `login` exists; no authenticated route exists yet.
- Postgres is already installed and running locally (confirmed by user). GitHub and Google OAuth app credentials already exist (confirmed by user).

## Data model

New Sequelize model `User` (`apps/backend/src/models/User.ts`), migration creates `users` table:

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | `defaultValue: DataTypes.UUIDV4` |
| `email` | STRING, unique, not null | normalized lowercase before save |
| `passwordHash` | STRING, nullable | null for OAuth-only accounts |
| `name` | STRING, not null | |
| `role` | ENUM('student','teacher','admin'), not null | server-side clamps client input to `student`/`teacher` only — `admin` is never client-assignable |
| `githubId` | STRING, nullable, unique | |
| `googleId` | STRING, nullable, unique | |
| `avatarUrl` | STRING, nullable | from OAuth provider profile, if present |
| `createdAt` / `updatedAt` | Sequelize defaults | |

Plain TS interface mirroring the public shape (`AuthUser`, omitting `passwordHash`) goes in `shared/src/types/user.types.ts`, importable by both `apps/backend` and `apps/frontend`.

Admin users are not self-registrable; they'd be created via a future seed script (out of scope here).

## Backend architecture

New files under `apps/backend/src/`:

- `config/database.ts` — Sequelize instance from `DATABASE_URL`
- `models/User.ts` — the model above
- `middleware/auth.middleware.ts` — reads the JWT cookie, verifies it, attaches `req.user`; a second `requireAuth` guard for protected routes
- `services/auth.service.ts` — password hashing/verification (bcrypt), JWT sign/verify, find-or-create-by-provider logic
- `config/passport.ts` — Passport `GitHubStrategy` and `GoogleStrategy`, `session: false` (no passport sessions — we mint our own JWT in the callback and set it as a cookie manually)
- `routes/auth.routes.ts` + `controllers/auth.controller.ts`:
  - `POST /api/auth/register` (JSON body: `name`, `email`, `password`, `role`) — validates, `409 { error: { code: 'email_taken', message } }` if email exists, hashes password, creates user, sets cookie, `200 { user: AuthUser }`
  - `POST /api/auth/login` (JSON body: `email`, `password`) — looks up by email; `401 { error: { code: 'oauth_only', ... } }` if `passwordHash` is null; `401 { error: { code: 'invalid_credentials', ... } }` on bad password; else sets cookie, `200 { user: AuthUser }`
  - `POST /api/auth/logout` — clears the cookie, `200 { ok: true }` (called via the frontend's `AuthService`, not a form post — nothing to redirect since there's no full-page navigation to return from)
  - `GET /api/auth/me` — `requireAuth`, returns `200 { user: AuthUser }` or `401` if not authenticated
  - `GET /api/auth/google` / `GET /api/auth/github` — accept `?role=`, pass through as OAuth `state`, redirect to provider. **Still redirect-based** — these are real browser navigations to the provider, not `AuthService` calls, so this part of the flow is unchanged by the revision.
  - `GET /api/auth/google/callback` / `GET /api/auth/github/callback` — Passport verifies; find user by provider ID, falling back to matching by email (linking the provider ID onto the existing account); create if neither matches, using `state` for role; set cookie; redirect to `/dashboard`; redirect to `/login?error=oauth_failed` on failure. **Still redirect-based**, for the same reason.

Cookie: `httpOnly`, `sameSite: 'lax'`, `secure: NODE_ENV === 'production'`, `maxAge` matching `JWT_EXPIRY` (7d). `apps/backend/src/app.ts` CORS config gets `credentials: true`, origin restricted to the frontend app's URL (need to add a second allowed origin or a distinct env var alongside the existing `FRONTEND_URL`, since that currently only covers the landing site on 4200 — the app runs on 4201).

`app.ts` already has `express.json()` (used for the register/login/logout bodies) and `express.urlencoded({ extended: true })` (no longer needed by auth routes after this revision, but left as-is — harmless, and OAuth GET routes don't parse a body at all).

**New backend dependencies** (none of these are in `apps/backend/package.json` yet): `passport`, `passport-github2`, `passport-google-oauth20`, `cookie-parser`, plus their `@types/*` dev-dependency counterparts.

## Frontend changes

- New `apps/frontend/src/app/services/auth.service.ts`: an injectable `AuthService` wrapping plain `fetch` (matching the codebase's current convention — no `HttpClient`/`provideHttpClient` exists anywhere yet, and this is the only consumer, so introducing the whole `@angular/common/http` provider chain for one service would be pure YAGNI) with `register()`, `login()`, `logout()`, and `me()` methods, all `credentials: 'include'`, all typed against `AuthUser`.
- `apps/frontend/src/app/pages/login/login.ts`: drop the route-bound `error` input (there's no more redirect-with-query-param to read). Add an `errorMessage` signal set directly from the `AuthService` call's rejection, and a `submitting` signal for button disabled-state. The sign-in and register forms' `(ngSubmit)` handlers call `AuthService.login()`/`.register()`, and on success navigate to `/dashboard` via `Router.navigate()` instead of relying on a server redirect.
- `apps/frontend/src/app/pages/login/login.html`: forms lose `method="post" action="..."` (no longer real form posts); render `errorMessage()` in a small banner above the form when present. The two OAuth `<a href>` values still point at `/api/auth/google?role=...` / `/api/auth/github?role=...` — unchanged, since OAuth still needs a real redirect.
- New `apps/frontend/src/app/pages/dashboard/` (standalone component, added to `app.routes.ts`): on init, calls `AuthService.me()`; shows "Welcome, {name}" + role + a logout button that calls `AuthService.logout()` then navigates to `/login`. This is explicitly throwaway scaffolding to prove the loop works, not the real product dashboard.
- `apps/frontend/src/app/app.routes.ts`: add the `dashboard` route.

## Error handling

- Register/login/logout failures come back as JSON error responses (`{ error: { code, message } }`) with an appropriate HTTP status; `AuthService` throws, and the Login component catches and displays the message via the `errorMessage` signal — no page reload involved.
- OAuth failures (Passport strategy errors, DB errors during the callback) still redirect to `/login?error=oauth_failed`, since the OAuth callback is a real browser navigation with no JS in the loop to catch a rejected promise. The Login component keeps a small amount of query-param handling *only* for this one OAuth-failure case (reads `?error=oauth_failed` on init and shows the same banner via the same `errorMessage` signal, sourced from either the API-call path or this one redirect path).
- Sequelize connection failure at boot: fail fast and log clearly (crash rather than serve with a broken DB layer) — consistent with there being no fallback data store.

## Explicitly out of scope

Email verification, password reset flow, linking multiple OAuth providers onto one already-logged-in account (auto-link-by-email on first sight is in scope; a dedicated "connect another provider" UI is not), refresh-token rotation (single 7-day JWT is enough for now), rate limiting on auth endpoints, admin account creation/seed script, the real dashboard/product shell.

## Testing & verification

No backend test framework chosen yet (open item in CLAUDE.md — not decided as part of this sub-project). Verification is manual:

1. `npm run build -w apps/backend` and `-w apps/frontend` both pass.
2. `npm run dev`; register a new student account via the form, confirm a row appears in `users` with a bcrypt hash and land on `/dashboard` showing the right name/role.
3. Log out, log back in with the same credentials; confirm wrong password shows the friendly inline error.
4. Complete the GitHub OAuth flow and the Google OAuth flow each at least once against the real provider credentials; confirm account creation and that a second login via the same provider reuses the existing row instead of creating a duplicate.
5. Confirm the httpOnly cookie is set (visible in DevTools Application tab, not readable from `document.cookie` in the console).
