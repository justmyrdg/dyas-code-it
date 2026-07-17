# Password Reset — Design

**Date**: 2026-07-17
**Status**: Approved, pending implementation plan

## Context

An audit of "Phase 1: Foundation & Auth" and "Phase 2: Curriculum & Classes" from `docs/DyasCodeIT_PLAN.md` found Phase 2 essentially complete (admin curriculum CRUD, class-code join with 50-student cap, teacher analytics are all built and wired end-to-end). The one confirmed gap in Phase 1 is password reset: no backend routes, no relevant `User` model fields, no email-sending library anywhere in the backend, and a dead `href="#"` "Forgot password?" link in `apps/frontend/src/app/pages/login/login.html`.

This spec covers building that flow only. Email verification on signup was considered and explicitly deferred — out of scope here.

## Data model

Add two nullable columns to `User` (`apps/backend/src/models/User.ts`):

- `passwordResetTokenHash: string | null`
- `passwordResetExpiresAt: Date | null`

The stored value is a SHA-256 hash of the reset token, not the raw token — mirrors how `passwordHash` already protects login credentials, so a DB leak alone can't be used to reset accounts. A migration (in `apps/backend/src/migrations/`, following the existing Umzug pattern) adds these columns.

## Backend flow

### `POST /api/auth/forgot-password`

Request: `{ email: string }`.

1. Look up the user by email.
2. If no user: do nothing.
3. If user exists and `passwordHash` is set (has a real password, not OAuth-only): generate a random 32-byte token (`crypto.randomBytes(32).toString('hex')`), store its SHA-256 hash and an expiry of `now + 1 hour` on the user row, and email a reset link: `{APP_URL}/reset-password?token=<raw token>`.
4. If user exists but `passwordHash` is null (OAuth-only account): email a notice telling them to sign in via GitHub/Google instead — no token is generated.
5. **Response is identical in all three cases**: `200 { message: "If that email exists, we've sent instructions." }`. This prevents the endpoint from being used to enumerate registered emails.

Rate limited via `express-rate-limit` at 5 requests/hour per IP — same pattern as the existing limiter on `POST /api/code/execute` (`apps/backend/src/routes/code.routes.ts`).

### `POST /api/auth/reset-password`

Request: `{ token: string, newPassword: string }`.

1. Hash the incoming token with SHA-256.
2. Look up a user whose `passwordResetTokenHash` matches and whose `passwordResetExpiresAt` is in the future.
3. If found: bcrypt-hash `newPassword` (12 rounds, matching `auth.service.ts`) into `passwordHash`, clear `passwordResetTokenHash`/`passwordResetExpiresAt` (single-use token), respond `200`.
4. If not found or expired: respond `400 { error: 'invalid_or_expired_token' }`.

`newPassword` is validated with the same rules already enforced at registration (checked in `auth.controller.ts`/`auth.service.ts` — reuse rather than duplicate).

## Email delivery

New `apps/backend/src/services/email.service.ts` using `nodemailer` with an SMTP transport. Config via env vars added to `apps/backend/.env.example`:

```
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Left as placeholders — real values (Mailtrap, a transactional provider, etc.) are the user's responsibility to fill in before this flow delivers real mail in dev/prod. Two templates:

- **Reset link email**: subject + body with the reset URL, states the link expires in 1 hour.
- **OAuth-redirect notice**: subject + body telling the recipient they signed up via GitHub/Google and should use that to sign in.

Both are plain-text with a simple HTML variant (nodemailer's `text`/`html` fields on the same message).

## Frontend

- `apps/frontend/src/app/pages/login/login.html`: replace the dead `<a href="#">Forgot password?</a>` with a `routerLink` to `/forgot-password`.
- New page `apps/frontend/src/app/pages/forgot-password/` (standalone component, following the existing `login` component's structure): single email field, submits to the forgot-password endpoint, shows the generic confirmation message on any response (including network-visible errors, to avoid leaking state).
- New page `apps/frontend/src/app/pages/reset-password/`: reads `token` from the query string via `ActivatedRoute`. Form with new-password + confirm-password fields (client-side match check). On submit, calls the reset endpoint:
  - Success → redirect to `/login` with a success toast/message.
  - Failure (`invalid_or_expired_token`) → show an inline error with a link back to `/forgot-password`.
- Both routes registered in `apps/frontend/src/app/app.routes.ts`, gated by the existing `guestGuard` (same guard used on `/login` — a logged-in user shouldn't land here).
- Both pages call through `AuthService` (`apps/frontend/src/app/core` or wherever the existing auth API calls live) via new methods `forgotPassword(email)` and `resetPassword(token, newPassword)`, following the existing `apiFetch` pattern in `core/api.ts`.

## Testing

Backend (vitest, following `services/grading.service.test.ts`'s pattern):

- Token generated and hashed correctly; raw token never stored.
- Expiry enforced (expired token rejected).
- Token is single-use (second reset attempt with the same token fails after a successful reset).
- OAuth-only account triggers the redirect-notice email path, not a token.
- Unknown email and known email both produce the same `200` response shape (enumeration resistance) — assert on response, not on whether email-sending was invoked.
- Email-sending is mocked/stubbed in tests; no real SMTP calls.

Frontend: no existing spec pattern for pages in this repo's Angular test suite was surveyed in depth — implementation plan should follow whatever convention `login.spec.ts`-equivalent (if any) already uses, or skip dedicated specs if the codebase doesn't have a per-page testing convention yet.

## Out of scope

- Email verification on signup.
- Letting OAuth-only users set a password via this flow (explicitly rejected — they're redirected to OAuth instead).
- Any change to session/JWT invalidation on password reset (existing sessions are not explicitly revoked; out of scope for this pass).
