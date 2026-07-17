# Password Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working forgot-password / reset-password flow so users with an email+password account can recover access, following the design in `docs/superpowers/specs/2026-07-17-password-reset-design.md`.

**Architecture:** Backend adds two nullable columns to `User` (hashed reset token + expiry), a pure/testable `password-reset.service.ts` for token generation/hashing/expiry logic, a `nodemailer`-backed `email.service.ts`, and two new public `/api/auth` endpoints. Frontend adds `ForgotPassword` and `ResetPassword` pages, two `AuthService` methods, and fixes the dead "Forgot password?" link.

**Tech Stack:** Express + Sequelize + TypeScript (backend), Angular standalone components + signals (frontend), `nodemailer` for SMTP, `vitest` for backend unit tests.

## Global Constraints

- Reset tokens: 32 random bytes (hex-encoded), stored as a SHA-256 hash, never the raw token.
- Token expiry: 1 hour from generation.
- Rate limit: 5 requests/hour per IP on `POST /api/auth/forgot-password`.
- `forgot-password` always returns the same generic `200` response regardless of whether the email exists, whether it's OAuth-only, or whether email sending succeeds — no enumeration signal.
- OAuth-only accounts (`passwordHash === null`) never get a reset token; they get a redirect-to-OAuth notice email instead.
- New password minimum length: 8 characters (matches the existing frontend `minlength="8"` convention on the register form).
- SMTP config is env-var driven (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`), left as placeholders in `.env.example` — no real credentials are provided by this plan.
- No email verification on signup — explicitly out of scope.
- No test-DB integration tests — this repo's only existing backend test (`grading.service.test.ts`) tests pure functions with no DB, and that's the pattern to follow: extract pure logic into `password-reset.service.ts` and unit-test that; controller/DB-touching code is not unit tested (matches `auth.controller.ts` today, which also has no test file).

---

### Task 1: Add password-reset fields to the `User` model + migration

**Files:**
- Modify: `apps/backend/src/models/User.ts`
- Create: `apps/backend/src/migrations/0001-add-password-reset-fields-to-users.ts`

**Interfaces:**
- Produces: `User.passwordResetTokenHash: string | null`, `User.passwordResetExpiresAt: Date | null` — consumed by Task 4's controller code.

- [ ] **Step 1: Add the two fields to the `User` model**

In `apps/backend/src/models/User.ts`, add to the class body (after `declare avatarUrl: string | null;` on line 19):

```typescript
  declare passwordResetTokenHash: string | null;
  declare passwordResetExpiresAt: Date | null;
```

And add to the `User.init({...})` attribute object (after the `avatarUrl` attribute definition, around line 61):

```typescript
    passwordResetTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
```

- [ ] **Step 2: Write the migration**

Create `apps/backend/src/migrations/0001-add-password-reset-fields-to-users.ts`:

```typescript
import { DataTypes } from 'sequelize';
import type { Migration } from '../config/migrator';

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.addColumn('users', 'passwordResetTokenHash', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await queryInterface.addColumn('users', 'passwordResetExpiresAt', {
    type: DataTypes.DATE,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.removeColumn('users', 'passwordResetTokenHash');
  await queryInterface.removeColumn('users', 'passwordResetExpiresAt');
};
```

- [ ] **Step 3: Verify the migration runs**

Run: `cd apps/backend && npm run db:migrate`
Expected: output includes `Applied 1 migration(s): 0001-add-password-reset-fields-to-users.ts` (or `No pending migrations.` only if this migration was already applied in a prior attempt — in that case first run `npm run db:migrate:down` once, then re-run `db:migrate` to confirm a clean apply). Requires a running Postgres reachable via `DATABASE_URL` in `apps/backend/.env` — if unavailable, skip live verification and instead run `cd apps/backend && npx tsc --noEmit` to confirm the migration file compiles without type errors.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/models/User.ts apps/backend/src/migrations/0001-add-password-reset-fields-to-users.ts
git commit -m "feat: add password reset fields to User model"
```

---

### Task 2: Password-reset core logic (token generation/hashing/expiry) with tests

**Files:**
- Create: `apps/backend/src/services/password-reset.service.ts`
- Create: `apps/backend/src/services/password-reset.service.test.ts`

**Interfaces:**
- Consumes: nothing (pure, self-contained — uses only Node's built-in `crypto`).
- Produces: `generateResetToken(now?: Date): { rawToken: string; tokenHash: string; expiresAt: Date }`, `hashResetToken(rawToken: string): string`, `isResetTokenValid(expiresAt: Date | null, now?: Date): boolean` — consumed by Task 4's controller code.

- [ ] **Step 1: Write the failing tests**

Create `apps/backend/src/services/password-reset.service.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateResetToken, hashResetToken, isResetTokenValid } from './password-reset.service';

describe('generateResetToken', () => {
  it('produces a raw token whose hash matches the returned tokenHash', () => {
    const { rawToken, tokenHash } = generateResetToken();
    expect(hashResetToken(rawToken)).toBe(tokenHash);
  });

  it('does not return the raw token as the hash', () => {
    const { rawToken, tokenHash } = generateResetToken();
    expect(tokenHash).not.toBe(rawToken);
  });

  it('sets expiresAt to 1 hour after the given time', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const { expiresAt } = generateResetToken(now);
    expect(expiresAt.getTime()).toBe(now.getTime() + 60 * 60 * 1000);
  });

  it('generates different tokens on each call', () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a.rawToken).not.toBe(b.rawToken);
  });
});

describe('hashResetToken', () => {
  it('is deterministic for the same input', () => {
    expect(hashResetToken('abc')).toBe(hashResetToken('abc'));
  });

  it('produces different hashes for different inputs', () => {
    expect(hashResetToken('abc')).not.toBe(hashResetToken('xyz'));
  });
});

describe('isResetTokenValid', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('is true when expiresAt is in the future', () => {
    const future = new Date(now.getTime() + 1000);
    expect(isResetTokenValid(future, now)).toBe(true);
  });

  it('is false when expiresAt is in the past', () => {
    const past = new Date(now.getTime() - 1000);
    expect(isResetTokenValid(past, now)).toBe(false);
  });

  it('is false when expiresAt is null', () => {
    expect(isResetTokenValid(null, now)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/backend && npx vitest run src/services/password-reset.service.test.ts`
Expected: FAIL — `Cannot find module './password-reset.service'` (the module doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `apps/backend/src/services/password-reset.service.ts`:

```typescript
import crypto from 'crypto';

// 1 hour — matches the design spec (docs/superpowers/specs/2026-07-17-password-reset-design.md).
export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_BYTES = 32;

export interface GeneratedResetToken {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
}

export function hashResetToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function generateResetToken(now: Date = new Date()): GeneratedResetToken {
  const rawToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');
  return {
    rawToken,
    tokenHash: hashResetToken(rawToken),
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_EXPIRY_MS),
  };
}

export function isResetTokenValid(expiresAt: Date | null, now: Date = new Date()): boolean {
  return expiresAt !== null && expiresAt.getTime() > now.getTime();
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/backend && npx vitest run src/services/password-reset.service.test.ts`
Expected: PASS — all 9 tests green.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/services/password-reset.service.ts apps/backend/src/services/password-reset.service.test.ts
git commit -m "feat: add password reset token generation/hashing/expiry logic"
```

---

### Task 3: Email service (nodemailer) + `.env.example` update

**Files:**
- Modify: `apps/backend/package.json`
- Modify: `apps/backend/.env.example`
- Create: `apps/backend/src/services/email.service.ts`

**Interfaces:**
- Consumes: `process.env.SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- Produces: `sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>`, `sendOAuthOnlyNotice(to: string): Promise<void>` — consumed by Task 4's controller code.

- [ ] **Step 1: Add `nodemailer` as a dependency**

In `apps/backend/package.json`, add to `"dependencies"` (alphabetical, after `"jsonwebtoken"` and before `"passport"`):

```json
    "nodemailer": "^6.9.16",
```

Add to `"devDependencies"` (alphabetical, after `"@types/node"` and before `"@types/passport"`):

```json
    "@types/nodemailer": "^6.4.16",
```

- [ ] **Step 2: Install**

Run: `cd apps/backend && npm install`
Expected: `nodemailer` and `@types/nodemailer` appear in `node_modules` and `package-lock.json` is updated; exit code 0.

- [ ] **Step 3: Replace the stale SendGrid placeholder in `.env.example` with SMTP vars**

In `apps/backend/.env.example`, replace lines 39-41:

```
# Email
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
```

with:

```
# Email (SMTP — used for password reset emails)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

- [ ] **Step 4: Write the email service**

Create `apps/backend/src/services/email.service.ts`:

```typescript
import nodemailer from 'nodemailer';

// SMTP credentials are left unset in .env.example — fill them in before this
// service can actually deliver mail (see docs/superpowers/specs/2026-07-17-password-reset-design.md).
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const FROM = process.env.SMTP_FROM || 'no-reply@dyascodeit.com';

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Reset your DyasCodeIT password',
    text: `We received a request to reset your password. This link expires in 1 hour:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>We received a request to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}

export async function sendOAuthOnlyNotice(to: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'About your DyasCodeIT sign-in',
    text: 'You requested a password reset, but this account was created using GitHub or Google sign-in and has no password. Please use the "Continue with GitHub" or "Continue with Google" button on the login page instead.',
    html: '<p>You requested a password reset, but this account was created using GitHub or Google sign-in and has no password.</p><p>Please use the "Continue with GitHub" or "Continue with Google" button on the login page instead.</p>',
  });
}
```

- [ ] **Step 5: Verify it compiles**

Run: `cd apps/backend && npx tsc --noEmit`
Expected: no errors referencing `email.service.ts`.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/package.json apps/backend/package-lock.json apps/backend/.env.example apps/backend/src/services/email.service.ts
git commit -m "feat: add nodemailer-backed email service for password reset"
```

---

### Task 4: `forgot-password` / `reset-password` endpoints

**Files:**
- Modify: `apps/backend/src/controllers/auth.controller.ts`
- Modify: `apps/backend/src/routes/auth.routes.ts`
- Modify: `apps/backend/src/config/limits.ts`

**Interfaces:**
- Consumes: `generateResetToken`, `hashResetToken`, `isResetTokenValid` (Task 2); `sendPasswordResetEmail`, `sendOAuthOnlyNotice` (Task 3); `hashPassword` (existing, `auth.service.ts`); `User.passwordResetTokenHash`/`passwordResetExpiresAt` (Task 1).
- Produces: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` — consumed by Task 5's frontend `AuthService`.

- [ ] **Step 1: Add the rate-limit constant**

In `apps/backend/src/config/limits.ts`, add after the existing `CODE_EXECUTION_RATE_PER_MIN` line:

```typescript

// Password reset request throttling.
export const PASSWORD_RESET_RATE_PER_HOUR = 5;
```

- [ ] **Step 2: Add the controller handlers**

In `apps/backend/src/controllers/auth.controller.ts`, add these imports at the top (after the existing `auth.service` import block):

```typescript
import { generateResetToken, hashResetToken, isResetTokenValid } from '../services/password-reset.service';
import { sendPasswordResetEmail, sendOAuthOnlyNotice } from '../services/email.service';

const APP_URL = process.env.APP_URL || 'http://localhost:4201';
```

Then add these two exported functions before the final `export { toAuthUser };` line:

```typescript
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      sendError(res, 400, 'missing_fields', 'Please enter your email.');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (user?.passwordHash) {
      const { rawToken, tokenHash, expiresAt } = generateResetToken();
      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpiresAt = expiresAt;
      await user.save();
      const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    } else if (user && !user.passwordHash) {
      await sendOAuthOnlyNotice(user.email);
    }

    // Same response whether or not the email exists, is OAuth-only, or sending
    // failed — avoids leaking which emails are registered.
    res.status(200).json({ message: "If that email exists, we've sent instructions." });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword || newPassword.length < 8) {
      sendError(
        res,
        400,
        'invalid_or_expired_token',
        'Please provide a valid token and a password of at least 8 characters.',
      );
      return;
    }

    const tokenHash = hashResetToken(token);
    const user = await User.findOne({ where: { passwordResetTokenHash: tokenHash } });

    if (!user || !isResetTokenValid(user.passwordResetExpiresAt)) {
      sendError(res, 400, 'invalid_or_expired_token', 'This reset link is invalid or has expired.');
      return;
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
```

- [ ] **Step 3: Wire the routes**

In `apps/backend/src/routes/auth.routes.ts`, update the imports at the top:

```typescript
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import passport from '../config/passport';
import { User } from '../models/User';
import { signAuthToken, setAuthCookie } from '../services/auth.service';
import { PASSWORD_RESET_RATE_PER_HOUR } from '../config/limits';
```

Then add, after the existing `authRouter.get('/me', requireAuth, me);` line:

```typescript

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: PASSWORD_RESET_RATE_PER_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'anonymous',
  handler: (req, res) => {
    res.status(429).json({
      error: { code: 'rate_limited', message: 'Too many requests. Please try again later.' },
    });
  },
});

authRouter.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
authRouter.post('/reset-password', resetPassword);
```

- [ ] **Step 4: Verify it compiles and existing tests still pass**

Run: `cd apps/backend && npx tsc --noEmit && npx vitest run`
Expected: no type errors; all existing tests (including the new `password-reset.service.test.ts` from Task 2) pass.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/controllers/auth.controller.ts apps/backend/src/routes/auth.routes.ts apps/backend/src/config/limits.ts
git commit -m "feat: add forgot-password and reset-password endpoints"
```

---

### Task 5: Frontend `AuthService` methods

**Files:**
- Modify: `apps/frontend/src/app/services/auth.service.ts`

**Interfaces:**
- Consumes: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` (Task 4).
- Produces: `AuthService.forgotPassword(payload: ForgotPasswordPayload): Promise<void>`, `AuthService.resetPassword(payload: ResetPasswordPayload): Promise<void>` — consumed by Tasks 6 and 7.

- [ ] **Step 1: Add the payload types and methods**

In `apps/frontend/src/app/services/auth.service.ts`, add after the existing `LoginPayload` interface:

```typescript
export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
```

Then add these two methods inside the `AuthService` class, after the existing `me()` method and before the private `request()` helper:

```typescript
  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    // The backend always returns 200 with the same generic message, whether or
    // not the email is registered — nothing to branch on here.
    await fetch(`${this.apiUrl}/auth/forgot-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    const response = await fetch(`${this.apiUrl}/auth/reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: { code: string; message: string } };
      throw new Error(body.error?.message ?? 'This reset link is invalid or has expired.');
    }
  }
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/frontend && npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors. (If `tsconfig.app.json` doesn't exist under that name, use whichever app tsconfig `ng build` uses — check `apps/frontend/angular.json`'s `tsConfig` value first.)

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/services/auth.service.ts
git commit -m "feat: add forgotPassword/resetPassword methods to AuthService"
```

---

### Task 6: `ForgotPassword` page + route

**Files:**
- Create: `apps/frontend/src/app/pages/forgot-password/forgot-password.ts`
- Create: `apps/frontend/src/app/pages/forgot-password/forgot-password.html`
- Modify: `apps/frontend/src/app/app.routes.ts`

**Interfaces:**
- Consumes: `AuthService.forgotPassword` (Task 5).
- Produces: `/forgot-password` route.

- [ ] **Step 1: Write the component**

Create `apps/frontend/src/app/pages/forgot-password/forgot-password.ts`:

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);

  email = '';
  readonly submitting = signal(false);
  readonly submitted = signal(false);

  async onSubmit(): Promise<void> {
    this.submitting.set(true);
    try {
      await this.authService.forgotPassword({ email: this.email });
    } finally {
      this.submitting.set(false);
      this.submitted.set(true);
    }
  }
}
```

- [ ] **Step 2: Write the template**

Create `apps/frontend/src/app/pages/forgot-password/forgot-password.html`:

```html
<main class="flex min-h-screen items-center justify-center bg-white px-5 py-16 text-gray-950 sm:px-20">
  <div class="w-full max-w-md">
    <p class="uno-text-outline inline-block text-2xl font-black">
      <span class="text-red-500">Dyas</span><span class="text-blue-400">Code</span
      ><span class="text-green-400">IT</span>
    </p>

    @if (!submitted()) {
      <h1 class="mt-6 text-3xl font-black">Forgot your password?</h1>
      <p class="mt-2 font-semibold text-gray-600">
        Enter your email and we'll send you a link to reset it.
      </p>
      <form (ngSubmit)="onSubmit()" class="mt-6 space-y-4" autocomplete="on">
        <div>
          <label for="forgot-email" class="text-sm font-bold text-gray-700">Email</label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            required
            autocomplete="email"
            [(ngModel)]="email"
            class="mt-1 w-full rounded-xl border-2 border-black px-5 py-3 font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-blue-600/25"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          [disabled]="submitting()"
          class="w-full rounded-xl border-2 border-black bg-blue-600 px-5 py-3 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50"
        >
          {{ submitting() ? 'Sending...' : 'Send reset link' }}
        </button>
      </form>
    } @else {
      <div class="mt-6 rounded-xl border-2 border-black bg-green-50 px-5 py-4 font-semibold text-green-800">
        If that email exists, we've sent instructions to reset your password.
      </div>
    }

    <a
      routerLink="/login"
      class="mt-6 inline-flex items-center gap-2 text-sm font-black text-gray-500 transition hover:text-gray-950"
    >
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back to sign in
    </a>
  </div>
</main>
```

- [ ] **Step 3: Add the route**

In `apps/frontend/src/app/app.routes.ts`, add this route object right after the existing `login` route (before the `dashboard` route):

```typescript
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
```

- [ ] **Step 4: Verify it compiles**

Run: `cd apps/frontend && npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app/pages/forgot-password apps/frontend/src/app/app.routes.ts
git commit -m "feat: add forgot-password page"
```

---

### Task 7: `ResetPassword` page + route, and fix the dead login link

**Files:**
- Create: `apps/frontend/src/app/pages/reset-password/reset-password.ts`
- Create: `apps/frontend/src/app/pages/reset-password/reset-password.html`
- Modify: `apps/frontend/src/app/app.routes.ts`
- Modify: `apps/frontend/src/app/pages/login/login.ts`
- Modify: `apps/frontend/src/app/pages/login/login.html`

**Interfaces:**
- Consumes: `AuthService.resetPassword` (Task 5).
- Produces: `/reset-password` route; login page shows a success banner after a completed reset.

- [ ] **Step 1: Write the component**

Create `apps/frontend/src/app/pages/reset-password/reset-password.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  // Bound from the ?token= query param via withComponentInputBinding().
  readonly token = input<string | undefined>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly submitError = signal<string | undefined>(undefined);
  readonly passwordMismatch = signal(false);

  newPassword = '';
  confirmPassword = '';

  readonly hasToken = computed(() => !!this.token());

  async onSubmit(): Promise<void> {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }
    this.passwordMismatch.set(false);
    this.submitError.set(undefined);

    const token = this.token();
    if (!token) {
      this.submitError.set('This reset link is invalid or has expired.');
      return;
    }

    this.submitting.set(true);
    try {
      await this.authService.resetPassword({ token, newPassword: this.newPassword });
      await this.router.navigate(['/login'], { queryParams: { reset: 'success' } });
    } catch (err) {
      this.submitError.set(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
```

- [ ] **Step 2: Write the template**

Create `apps/frontend/src/app/pages/reset-password/reset-password.html`:

```html
<main class="flex min-h-screen items-center justify-center bg-white px-5 py-16 text-gray-950 sm:px-20">
  <div class="w-full max-w-md">
    <p class="uno-text-outline inline-block text-2xl font-black">
      <span class="text-red-500">Dyas</span><span class="text-blue-400">Code</span
      ><span class="text-green-400">IT</span>
    </p>

    @if (!hasToken()) {
      <div class="mt-6 rounded-xl border-2 border-black bg-red-50 px-5 py-4 font-semibold text-red-700">
        This reset link is invalid or has expired.
      </div>
      <a routerLink="/forgot-password" class="mt-4 inline-block text-sm font-black text-blue-600 hover:underline">
        Request a new link
      </a>
    } @else {
      <h1 class="mt-6 text-3xl font-black">Choose a new password</h1>

      @if (submitError(); as message) {
        <div class="mt-4 rounded-xl border-2 border-black bg-red-50 px-5 py-3 text-sm font-bold text-red-700">
          {{ message }}
        </div>
        <a routerLink="/forgot-password" class="mt-2 inline-block text-sm font-black text-blue-600 hover:underline">
          Request a new link
        </a>
      }

      <form (ngSubmit)="onSubmit()" class="mt-6 space-y-4" autocomplete="on">
        <div>
          <label for="reset-password" class="text-sm font-bold text-gray-700">New password</label>
          <input
            id="reset-password"
            name="newPassword"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            [(ngModel)]="newPassword"
            class="mt-1 w-full rounded-xl border-2 border-black px-5 py-3 font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-blue-600/25"
            placeholder="••••••••"
          />
          <p class="mt-1 text-xs font-semibold text-gray-500">At least 8 characters.</p>
        </div>
        <div>
          <label for="reset-confirm" class="text-sm font-bold text-gray-700">Confirm password</label>
          <input
            id="reset-confirm"
            name="confirmPassword"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            [(ngModel)]="confirmPassword"
            class="mt-1 w-full rounded-xl border-2 border-black px-5 py-3 font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-blue-600/25"
            placeholder="••••••••"
          />
        </div>
        @if (passwordMismatch()) {
          <p class="text-sm font-bold text-red-600">Passwords don't match.</p>
        }
        <button
          type="submit"
          [disabled]="submitting()"
          class="w-full rounded-xl border-2 border-black bg-blue-600 px-5 py-3 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50"
        >
          {{ submitting() ? 'Resetting...' : 'Reset password' }}
        </button>
      </form>
    }
  </div>
</main>
```

- [ ] **Step 3: Add the route**

In `apps/frontend/src/app/app.routes.ts`, add this route object right after the `forgot-password` route added in Task 6:

```typescript
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
  },
```

- [ ] **Step 4: Fix the dead "Forgot password?" link and add a post-reset success banner**

In `apps/frontend/src/app/pages/login/login.ts`, add a new input after the existing `error` input (after line 22, `readonly error = input<string | undefined>();`):

```typescript
  // Bound from ?reset=success after a completed password reset.
  readonly reset = input<string | undefined>();
```

Then update the `errorMessage` computed (lines 33-41) to leave room for a separate success computed — add this new computed right after `errorMessage`'s closing `});`:

```typescript
  readonly successMessage = computed(() =>
    this.reset() === 'success' ? 'Password updated. Please sign in.' : undefined,
  );
```

In `apps/frontend/src/app/pages/login/login.html`, replace the dead link on lines 259-261:

```html
                    <a href="#" class="text-xs font-bold text-blue-600 hover:underline"
                      >Forgot password?</a
                    >
```

with:

```html
                    <a routerLink="/forgot-password" class="text-xs font-bold text-blue-600 hover:underline"
                      >Forgot password?</a
                    >
```

And add a success banner right after the existing error banner block (lines 154-158, `@if (errorMessage(); as message) { ... }`):

```html
          @if (successMessage(); as message) {
            <div class="rounded-xl border-2 border-black bg-green-50 px-5 py-3 text-sm font-bold text-green-800">
              {{ message }}
            </div>
          }
```

- [ ] **Step 5: Verify it compiles**

Run: `cd apps/frontend && npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 6: Manually verify the flow end-to-end**

With the backend and frontend dev servers running (`npm run dev` from repo root) and a real email/password test account:

1. Visit `http://localhost:4201/login`, click "Forgot password?" — lands on `/forgot-password`.
2. Submit the test account's email — see the generic confirmation message.
3. Check the backend server log / SMTP catch (SMTP isn't configured with real credentials yet per Task 3, so `sendMail` will throw — confirm the error is caught by the route's `try/catch` and the endpoint still responds `200`; this is expected until real SMTP credentials are filled in).
4. Manually construct a reset URL using a token: temporarily log the `rawToken` in `forgotPassword` (or query the DB for `passwordResetTokenHash` and reverse-engineer isn't possible — easiest is to add a temporary `console.log(rawToken)` in `auth.controller.ts`, restart, request a reset, copy the token from the log, then remove the temporary log line). Visit `/reset-password?token=<token>`.
5. Submit a new password — confirm redirect to `/login?reset=success` and the green success banner appears.
6. Sign in with the new password — confirm login succeeds.
7. Revisit the same reset link — confirm it now shows "invalid or has expired" (single-use).

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/app/pages/reset-password apps/frontend/src/app/app.routes.ts apps/frontend/src/app/pages/login/login.ts apps/frontend/src/app/pages/login/login.html
git commit -m "feat: add reset-password page and wire up forgot-password link"
```
