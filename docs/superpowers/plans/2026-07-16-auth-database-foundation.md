# Auth + Database Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `apps/backend` from a bare Express skeleton into a service backed by Postgres with working email/password and GitHub/Google OAuth2 authentication, wired to the already-built `apps/frontend` login page, with a minimal placeholder dashboard proving the whole loop works.

**Architecture:** Express + Sequelize (Postgres) backend issues an httpOnly JWT cookie on register/login/OAuth-callback; a `requireAuth` middleware protects `/api/auth/me`. Register/login/logout are called from the frontend via a new `AuthService` (`fetch`, JSON, `credentials: 'include'`) instead of native form posts — the backend returns `200`/`4xx` JSON with a human-readable `error.message` the Login component shows inline, and on success the component navigates to `/dashboard` itself via `Router`. OAuth (`<a href>` links to `GET /api/auth/google` / `/github`) is the one part that stays redirect-based, since it's a real browser round trip to the provider; its one failure path (`?error=oauth_failed`) is still read via a route-bound `input()`, same pattern already used for `role`.

**Tech Stack:** Express, Sequelize + `pg` (Postgres), `bcryptjs`, `jsonwebtoken`, `passport` + `passport-github2` + `passport-google-oauth20`, `cookie-parser`. Angular 21 standalone components, signals, `input()` route-binding (already configured via `withComponentInputBinding()`).

## Global Constraints

- **Never run `npm run <script>` or `npx ng *` yourself.** The user runs their own dev servers (root `npm run dev`, which starts backend/landing/frontend together via `concurrently`; nodemon auto-restarts the backend on file save). Before any verification step that needs a server running, ask the user to confirm their dev server(s) are up — do not start them yourself. Plain `npm install` (adding a dependency) is fine; `npm run` is not.
- **Never take browser screenshots.** For any check that requires looking at rendered UI, ask the user to look and report back what they see.
- Postgres is already installed and running locally; GitHub and Google OAuth app credentials already exist. The user fills real secret values into `apps/backend/.env` themselves (never ask them to paste secrets into chat, and never commit `.env` — it's already gitignored).
- JWT cookie name: `dyas_token`. Cookie flags: `httpOnly: true`, `sameSite: 'lax'`, `secure: NODE_ENV === 'production'`, 7-day `maxAge` (matches `.env.example`'s `JWT_EXPIRY=7d`).
- `role` from client input (form field or OAuth `state`) is always clamped server-side to `'student' | 'teacher'` — `'admin'` is never client-assignable. Admin accounts are out of scope for this plan (future seed script).
- `apps/backend` uses `sequelize.sync()` at boot instead of hand-written migrations for this pass — the schema is still moving and migrations are a follow-up once it stabilizes.
- The `AuthUser` shape is duplicated between `apps/backend/src/types/auth.types.ts` and `apps/frontend/src/app/models/auth-user.model.ts` rather than routed through the `shared` workspace package. `shared`'s `package.json` points `main` at `dist/index.js`, which needs an `npm run build -w shared` before any other workspace can import it — exactly the command this plan can't run. This matches the project's existing "duplicate for now, no shared package yet" convention already used for the Tailwind theme between `apps/landing` and `apps/frontend`.
- CORS allows both `http://localhost:4200` (landing, via `FRONTEND_URL`) and `http://localhost:4201` (the authenticated app, via a new `APP_URL` env var) with `credentials: true`. Cookies set by `localhost:3000` are sent on cross-origin requests from `localhost:4200`/`:4201` because browsers treat different ports on `localhost` as the same "site" for `SameSite=Lax` purposes (same reasoning applies in production once landing/app/api are subdomains of one registrable domain) — no `SameSite=None` needed.

---

### Task 1: `AuthUser` type (backend + frontend)

**Files:**
- Create: `apps/backend/src/types/auth.types.ts`
- Create: `apps/frontend/src/app/models/auth-user.model.ts`

**Interfaces:**
- Produces: `UserRole` (`'student' | 'teacher' | 'admin'`) and `AuthUser` (`{ id, email, name, role, avatarUrl }`) in both files — every later task that needs the public user shape imports from here.

- [ ] **Step 1: Create the backend type**

`apps/backend/src/types/auth.types.ts`:
```ts
export type UserRole = 'student' | 'teacher' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
}
```

- [ ] **Step 2: Create the matching frontend model**

`apps/frontend/src/app/models/auth-user.model.ts`:
```ts
export type UserRole = 'student' | 'teacher' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/types/auth.types.ts apps/frontend/src/app/models/auth-user.model.ts
git commit -m "feat: add AuthUser type to backend and frontend"
```

---

### Task 2: Backend auth dependencies + env additions

**Files:**
- Modify: `apps/backend/package.json`
- Modify: `apps/backend/.env.example`

**Interfaces:**
- Produces: `passport`, `passport-github2`, `passport-google-oauth20`, `cookie-parser` available as imports for Tasks 3–8. `APP_URL` env var available for redirect targets.

- [ ] **Step 1: Add the new dependencies**

Run in the repo root (this is `npm install`, not `npm run` — safe to run):

```bash
npm install --workspace=apps/backend passport passport-github2 passport-google-oauth20 cookie-parser
npm install --workspace=apps/backend -D @types/passport @types/passport-github2 @types/passport-google-oauth20 @types/cookie-parser
```

- [ ] **Step 2: Verify they landed in `apps/backend/package.json`**

Read the file and confirm `dependencies` now includes `passport`, `passport-github2`, `passport-google-oauth20`, `cookie-parser`, and `devDependencies` includes the four `@types/*` packages.

- [ ] **Step 3: Add `APP_URL` to the env example**

In `apps/backend/.env.example`, after the `FRONTEND_URL=http://localhost:4200` line, add:

```
# Authenticated app (separate from the landing site above)
APP_URL=http://localhost:4201
```

- [ ] **Step 4: Tell the user to update their real `.env`**

Ask the user to add `APP_URL=http://localhost:4201` to their actual `apps/backend/.env` (not `.env.example`) and confirm their `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`/`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`JWT_SECRET`/`DATABASE_URL` are already filled in there. Do not ask them to paste the values into chat — just ask them to confirm the file is filled in.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/package.json package-lock.json apps/backend/.env.example
git commit -m "chore: add passport and cookie-parser dependencies for auth"
```

---

### Task 3: Database connection + `User` model

**Files:**
- Create: `apps/backend/src/config/database.ts`
- Create: `apps/backend/src/models/User.ts`
- Modify: `apps/backend/src/server.ts`

**Interfaces:**
- Consumes: `UserRole` from `../types/auth.types` (Task 1).
- Produces: `sequelize` (Sequelize instance) from `config/database.ts`; `User` model class from `models/User.ts` with fields `id, email, passwordHash, name, role, githubId, googleId, avatarUrl, createdAt, updatedAt` — every controller/service task after this imports `User` from here.

- [ ] **Step 1: Create the Sequelize connection**

`apps/backend/src/config/database.ts`:
```ts
import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and configure it.');
}

export const sequelize = new Sequelize(databaseUrl, {
  logging: false,
});
```

- [ ] **Step 2: Create the `User` model**

`apps/backend/src/models/User.ts`:
```ts
import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';
import type { UserRole } from '../types/auth.types';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare passwordHash: string | null;
  declare name: string;
  declare role: UserRole;
  declare githubId: string | null;
  declare googleId: string | null;
  declare avatarUrl: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      allowNull: false,
    },
    githubId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  },
);
```

- [ ] **Step 3: Connect and sync at boot, failing fast on error**

Replace `apps/backend/src/server.ts` entirely with:
```ts
import app from './app';
import { sequelize } from './config/database';
import './models/User';

const PORT = process.env.PORT || 3000;

async function start(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    // MVP: sync directly instead of migrations while the schema is still moving.
    await sequelize.sync();
    console.log('Database synced.');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`DyasCodeIT API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
```

- [ ] **Step 4: Verify**

Ask the user to confirm their backend dev server is running (root `npm run dev`, or `npm run dev:backend` from `apps/backend`) — nodemon will auto-restart on this file save. Ask them to check the backend terminal output and confirm they see, in order:
```
Database connection established.
Database synced.
DyasCodeIT API running on http://localhost:3000
```
with no errors in between. If `DATABASE_URL` in their `.env` is wrong, this will fail loudly here — that's expected behavior, not a bug.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/config/database.ts apps/backend/src/models/User.ts apps/backend/src/server.ts
git commit -m "feat: add Postgres connection and User model"
```

---

### Task 4: Auth service + register/login endpoints

**Files:**
- Create: `apps/backend/src/services/auth.service.ts`
- Create: `apps/backend/src/controllers/auth.controller.ts`
- Create: `apps/backend/src/routes/auth.routes.ts`
- Modify: `apps/backend/src/app.ts`

**Interfaces:**
- Consumes: `User` model (Task 3).
- Produces: `AUTH_COOKIE_NAME`, `hashPassword`, `verifyPassword`, `signAuthToken`, `verifyAuthToken`, `setAuthCookie`, `clearAuthCookie`, `AuthTokenPayload` from `services/auth.service.ts` — Task 5 and Task 8 both import these. `authRouter` mounted at `/api/auth` in `app.ts` — Task 5 and Task 8 add routes to this same router.

Register/login/logout respond with JSON (not redirects) — Task 6's frontend `AuthService` calls them directly via `fetch` and handles the response in TypeScript. OAuth (Task 8) is unaffected and stays redirect-based, since it's a real browser navigation to the provider and back.

- [ ] **Step 1: Write the auth service**

`apps/backend/src/services/auth.service.ts`:
```ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import type { User } from '../models/User';
import type { UserRole } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // keep in sync with JWT_EXPIRY default above

export const AUTH_COOKIE_NAME = 'dyas_token';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(user: User): string {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
```

- [ ] **Step 2: Write the register/login/logout controllers**

`apps/backend/src/controllers/auth.controller.ts`:
```ts
import type { Request, Response } from 'express';
import { User } from '../models/User';
import type { AuthUser, UserRole } from '../types/auth.types';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  setAuthCookie,
  clearAuthCookie,
} from '../services/auth.service';

function sendError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message } });
}

function clampRole(role: unknown): Exclude<UserRole, 'admin'> {
  return role === 'teacher' ? 'teacher' : 'student';
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password) {
    sendError(res, 400, 'missing_fields', 'Please fill in all fields.');
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    sendError(res, 409, 'email_taken', 'An account with that email already exists.');
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    name,
    role: clampRole(role),
    githubId: null,
    googleId: null,
    avatarUrl: null,
  });

  setAuthCookie(res, signAuthToken(user));
  res.status(200).json({ user: toAuthUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    sendError(res, 400, 'missing_fields', 'Please fill in all fields.');
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    sendError(res, 401, 'invalid_credentials', 'Incorrect email or password.');
    return;
  }

  if (!user.passwordHash) {
    sendError(
      res,
      401,
      'oauth_only',
      'That account was created with Google or GitHub. Use the matching button below.',
    );
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    sendError(res, 401, 'invalid_credentials', 'Incorrect email or password.');
    return;
  }

  setAuthCookie(res, signAuthToken(user));
  res.status(200).json({ user: toAuthUser(user) });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.status(200).json({ ok: true });
}

export { toAuthUser };
```

- [ ] **Step 3: Wire the router**

`apps/backend/src/routes/auth.routes.ts`:
```ts
import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
```

- [ ] **Step 4: Mount it in `app.ts` with cookie support and multi-origin CORS**

Replace `apps/backend/src/app.ts` entirely with:
```ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes';

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:4200',
  process.env.APP_URL || 'http://localhost:4201',
];

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
});

export default app;
```

- [ ] **Step 5: Verify with curl**

Ask the user to confirm the backend dev server is running and has picked up these changes (nodemon auto-restarts on save; ask them to check the terminal shows the Task 3 boot log again with no errors).

From the repo root, run (this is `curl`, not `npm run` — safe to run yourself):

```bash
curl -i -c dyas-cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"password123","role":"student"}'
```
Expected: `HTTP/1.1 200 OK`, JSON body `{"user":{"id":"...","email":"ada@example.com","name":"Ada Lovelace","role":"student","avatarUrl":null}}`, and a `Set-Cookie: dyas_token=...; Path=/; HttpOnly` header.

```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"password123","role":"student"}'
```
Expected: `HTTP/1.1 409`, JSON body `{"error":{"code":"email_taken","message":"..."}}`, no `Set-Cookie`.

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"wrongpassword"}'
```
Expected: `HTTP/1.1 401`, JSON body `{"error":{"code":"invalid_credentials","message":"..."}}`.

```bash
curl -i -c dyas-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"password123"}'
```
Expected: `HTTP/1.1 200`, JSON user body, `Set-Cookie` present. Keep `dyas-cookies.txt` — Task 5 reuses it.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/services/auth.service.ts apps/backend/src/controllers/auth.controller.ts apps/backend/src/routes/auth.routes.ts apps/backend/src/app.ts
git commit -m "feat: add register/login endpoints with httpOnly JWT cookie"
```

---

### Task 5: `requireAuth` middleware + `/me` + `/logout` verification

**Files:**
- Create: `apps/backend/src/middleware/auth.middleware.ts`
- Modify: `apps/backend/src/controllers/auth.controller.ts`
- Modify: `apps/backend/src/routes/auth.routes.ts`

**Interfaces:**
- Consumes: `AUTH_COOKIE_NAME`, `verifyAuthToken`, `AuthTokenPayload` (Task 4); `User`, `toAuthUser` (Task 3/4).
- Produces: `requireAuth` middleware — Task 8's OAuth callback routes don't need it (they set the cookie directly), but any future protected route reuses it. `req.user: AuthTokenPayload | undefined` available after this middleware runs.

- [ ] **Step 1: Write the middleware**

`apps/backend/src/middleware/auth.middleware.ts`:
```ts
import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME, verifyAuthToken, type AuthTokenPayload } from '../services/auth.service';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: { message: 'Not authenticated', status: 401 } });
    return;
  }

  try {
    req.user = verifyAuthToken(token);
    next();
  } catch {
    res.status(401).json({ error: { message: 'Invalid or expired session', status: 401 } });
  }
}
```

- [ ] **Step 2: Add the `me` controller**

In `apps/backend/src/controllers/auth.controller.ts`, add this function (keep everything already in the file from Task 4):
```ts
export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findByPk(req.user!.sub);
  if (!user) {
    res.status(401).json({ error: { message: 'Not authenticated', status: 401 } });
    return;
  }
  res.json({ user: toAuthUser(user) });
}
```

- [ ] **Step 3: Add the routes**

In `apps/backend/src/routes/auth.routes.ts`, replace the whole file with:
```ts
import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
```

- [ ] **Step 4: Verify with curl**

Ask the user to confirm the backend dev server picked up the change (nodemon auto-restart; check terminal for the boot log with no errors).

```bash
curl -i -b dyas-cookies.txt http://localhost:3000/api/auth/me
```
Expected: `HTTP/1.1 200 OK`, JSON body like `{"user":{"id":"...","email":"ada@example.com","name":"Ada Lovelace","role":"student","avatarUrl":null}}`.

```bash
curl -i -b dyas-cookies.txt -c dyas-cookies.txt -X POST http://localhost:3000/api/auth/logout
```
Expected: `HTTP/1.1 200 OK`, JSON body `{"ok":true}`, and a `Set-Cookie: dyas_token=;` header clearing the cookie (empty value / past expiry).

```bash
curl -i -b dyas-cookies.txt http://localhost:3000/api/auth/me
```
Expected: `HTTP/1.1 401`, JSON error body (cookie was cleared by the previous step).

Clean up: `rm -f dyas-cookies.txt`

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/middleware/auth.middleware.ts apps/backend/src/controllers/auth.controller.ts apps/backend/src/routes/auth.routes.ts
git commit -m "feat: add requireAuth middleware and /api/auth/me, /api/auth/logout"
```

---

### Task 6: `AuthService` + frontend login page wiring

**Files:**
- Create: `apps/frontend/src/app/services/auth.service.ts`
- Modify: `apps/frontend/src/app/pages/login/login.ts`
- Modify: `apps/frontend/src/app/pages/login/login.html`

**Interfaces:**
- Consumes: `environment.apiUrl` (already `'http://localhost:3000/api'` in `apps/frontend/src/environments/environment.ts`); `AuthUser`, `UserRole` from `../models/auth-user.model` (Task 1).
- Produces: `AuthService` with `register(payload): Promise<AuthUser>`, `login(payload): Promise<AuthUser>`, `logout(): Promise<void>`, `me(): Promise<AuthUser | null>` — Task 7's dashboard consumes `logout()` and `me()`. Rejections from `register`/`login` are plain `Error`s whose `.message` is already the backend's human-readable message (no error-code mapping needed on the frontend for these two).

- [ ] **Step 1: Write the `AuthService`**

`apps/frontend/src/app/services/auth.service.ts`:
```ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type { AuthUser, UserRole } from '../models/auth-user.model';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  register(payload: RegisterPayload): Promise<AuthUser> {
    return this.request('/auth/register', payload);
  }

  login(payload: LoginPayload): Promise<AuthUser> {
    return this.request('/auth/login', payload);
  }

  async logout(): Promise<void> {
    await fetch(`${this.apiUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  async me(): Promise<AuthUser | null> {
    const response = await fetch(`${this.apiUrl}/auth/me`, { credentials: 'include' });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as { user: AuthUser };
    return body.user;
  }

  private async request(path: string, payload: unknown): Promise<AuthUser> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as {
      user?: AuthUser;
      error?: { code: string; message: string };
    };

    if (!response.ok || !body.user) {
      throw new Error(body.error?.message ?? 'Something went wrong. Please try again.');
    }

    return body.user;
  }
}
```

- [ ] **Step 2: Wire `login.ts` to call the service instead of submitting a native form**

In `apps/frontend/src/app/pages/login/login.ts`, change the top imports from:
```ts
import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
```
to:
```ts
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
```

Right after the existing `readonly role = input<string | undefined>();` line (keep everything else in the file as-is for now), add:
```ts
  // Bound from ?error=oauth_failed on the redirect back from a failed OAuth attempt.
  // Register/login failures are handled by submitError below instead — they're AJAX calls, not redirects.
  readonly error = input<string | undefined>();

  readonly apiUrl = environment.apiUrl;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly submitError = signal<string | undefined>(undefined);

  readonly errorMessage = computed(() => {
    if (this.submitError()) {
      return this.submitError();
    }
    if (this.error() === 'oauth_failed') {
      return 'Something went wrong signing in with that provider. Please try again.';
    }
    return undefined;
  });
```

Replace the existing `onRegisterSubmit` method (currently `onRegisterSubmit(event: Event): void { ... }`) with these two methods:
```ts
  async onSignInSubmit(): Promise<void> {
    this.submitError.set(undefined);
    this.submitting.set(true);
    try {
      await this.authService.login({ email: this.signInEmail, password: this.signInPassword });
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  async onRegisterSubmit(): Promise<void> {
    if (this.registerPassword !== this.registerConfirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }
    this.passwordMismatch.set(false);
    this.submitError.set(undefined);
    this.submitting.set(true);
    try {
      await this.authService.register({
        name: this.registerName,
        email: this.registerEmail,
        password: this.registerPassword,
        role: this.activeRole(),
      });
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
```

- [ ] **Step 3: Update `login.html`: drop the native form posts, wire the submit handlers, show the error banner**

In `apps/frontend/src/app/pages/login/login.html`:

Change the Google link (currently `href="/api/auth/google"`) to — this one still needs the full backend origin since it's a real redirect (`AuthService` isn't involved), so it uses the same `apiUrl` field the service uses internally:
```html
[href]="apiUrl + '/auth/google?role=' + activeRole()"
```
Change the GitHub link (currently `href="/api/auth/github"`) the same way:
```html
[href]="apiUrl + '/auth/github?role=' + activeRole()"
```

On the sign-in `<form>`, remove `method="post" action="/api/auth/login"` and add `(ngSubmit)="onSignInSubmit()"`, so the opening tag becomes:
```html
<form (ngSubmit)="onSignInSubmit()" class="space-y-4" autocomplete="on">
```
Delete the `<input type="hidden" name="role" [value]="activeRole()" />` line inside this form — it was only needed for the native POST, and login doesn't take a role.

On the sign-in submit button, add a disabled state:
```html
<button
  type="submit"
  [disabled]="submitting()"
  class="w-full rounded-xl border-2 border-black bg-blue-600 px-5 py-3 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50"
>
  {{ submitting() ? 'Signing in...' : 'Sign in' }}
</button>
```

On the register `<form>`, remove `method="post" action="/api/auth/register"` and change `(ngSubmit)="onRegisterSubmit($event)"` to `(ngSubmit)="onRegisterSubmit()"`, so the opening tag becomes:
```html
<form (ngSubmit)="onRegisterSubmit()" class="space-y-4" autocomplete="on">
```
Delete its `<input type="hidden" name="role" [value]="activeRole()" />` line too — `activeRole()` is now passed directly in the `AuthService.register()` call in `login.ts`, not through a form field.

On the register submit button, add the same disabled state:
```html
<button
  type="submit"
  [disabled]="submitting()"
  class="w-full rounded-xl border-2 border-black bg-red-600 px-5 py-3 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50"
>
  {{ submitting() ? 'Creating account...' : 'Create account' }}
</button>
```

Add an error banner right after the opening `<div class="mt-6 space-y-4">` (before the `@if (!showEmailForm())` block):
```html
@if (errorMessage(); as message) {
  <div class="rounded-xl border-2 border-black bg-red-50 px-5 py-3 text-sm font-bold text-red-700">
    {{ message }}
  </div>
}
```

- [ ] **Step 4: Verify**

Ask the user to confirm the frontend app dev server is running (root `npm run dev`, or `npm run dev:frontend`), and the backend dev server too. Ask them to open `http://localhost:4201/login` in their browser and report back:
1. Fill in the "Create account" form with a new email and submit — the page should *not* reload; since `/dashboard` doesn't exist as a route yet (Task 7 adds it), `Router.navigate(['/dashboard'])` will hit `app.routes.ts`'s wildcard and land back on `/login` client-side. Confirm there's no full-page reload (e.g. by checking the button briefly reads "Creating account..." before it redirects).
2. Go back to `/login`, switch to "Sign in", try a wrong password — do they see the red "Incorrect email or password." banner without the page reloading?
3. Confirm the two OAuth buttons still point at `http://localhost:3000/api/auth/google?role=...` and `.../github?role=...` (hover or view source).

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app/services/auth.service.ts apps/frontend/src/app/pages/login/login.ts apps/frontend/src/app/pages/login/login.html
git commit -m "feat: add AuthService and wire login page to it via AJAX"
```

---

### Task 7: Frontend dashboard placeholder page

**Files:**
- Create: `apps/frontend/src/app/pages/dashboard/dashboard.ts`
- Create: `apps/frontend/src/app/pages/dashboard/dashboard.html`
- Modify: `apps/frontend/src/app/app.routes.ts`

**Interfaces:**
- Consumes: `AuthUser` from `../../models/auth-user.model` (Task 1); `AuthService` (Task 6) — specifically `me()` and `logout()`.
- Produces: `/dashboard` route — this is the redirect target Task 8's OAuth callbacks still point at, and the client-side navigation target Task 6's `login.ts` calls `router.navigate(['/dashboard'])` on success.

- [ ] **Step 1: Write the dashboard component**

`apps/frontend/src/app/pages/dashboard/dashboard.ts`:
```ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { AuthUser } from '../../models/auth-user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.loadUser();
  }

  private async loadUser(): Promise<void> {
    try {
      this.user.set(await this.authService.me());
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
```

`AuthService.me()` already collapses "not authenticated" (401) into `null`, so there's no separate `loadError` signal needed here — `!user()` covers both "never logged in" and "session expired" the same way.

- [ ] **Step 2: Write the template**

`apps/frontend/src/app/pages/dashboard/dashboard.html`:
```html
<main class="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-16 sm:px-20">
  <div class="w-full max-w-lg rounded-2xl border-2 border-black bg-white p-8 text-center shadow-lg">
    @if (loading()) {
      <p class="font-bold text-gray-500">Loading...</p>
    } @else if (!user()) {
      <p class="font-bold text-red-600">You're not signed in.</p>
      <a
        routerLink="/login"
        class="mt-6 inline-flex rounded-xl border-2 border-black bg-red-600 px-5 py-3 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >Go to login</a
      >
    } @else {
      <p class="text-sm font-black uppercase text-green-600">Signed in</p>
      <h1 class="mt-2 text-3xl font-black">Welcome, {{ user()!.name }}</h1>
      <p class="mt-2 font-semibold text-gray-600">{{ user()!.email }} &middot; {{ user()!.role }}</p>
      <button
        type="button"
        (click)="logout()"
        class="mt-8 inline-flex rounded-xl border-2 border-black bg-white px-5 py-3 font-black text-gray-950 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        Log out
      </button>
    }
  </div>
</main>
```

The logout control calls `AuthService.logout()` (a `fetch` POST) rather than submitting a form — consistent with the rest of this task's AJAX approach, and it lets the button navigate to `/login` via `Router` afterward instead of relying on a server redirect.

- [ ] **Step 3: Register the route**

Replace `apps/frontend/src/app/app.routes.ts` entirely with:
```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
```

- [ ] **Step 4: Verify end-to-end**

Ask the user to confirm both dev servers (backend + frontend app) are running, then walk through this in their browser and report back:
1. Go to `http://localhost:4201/login`, register a new account (any email not used in the Task 4 curl tests). Confirm they land on `/dashboard` showing "Welcome, {name}" with the right email and role.
2. Click "Log out". Confirm they're redirected to `/login`.
3. Sign back in with the same email/password on the sign-in form. Confirm they land on `/dashboard` again.
4. Navigate directly to `http://localhost:4201/dashboard` after logging out (or in a private/incognito window). Confirm it shows "You're not signed in." rather than crashing or hanging.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app/pages/dashboard apps/frontend/src/app/app.routes.ts
git commit -m "feat: add placeholder dashboard page to verify the auth loop"
```

---

### Task 8: GitHub + Google OAuth2

**Files:**
- Create: `apps/backend/src/config/passport.ts`
- Modify: `apps/backend/src/routes/auth.routes.ts`
- Modify: `apps/backend/src/app.ts`

**Interfaces:**
- Consumes: `User` model (Task 3); `signAuthToken`, `setAuthCookie` (Task 4); `UserRole` (Task 1).
- Produces: `GET /api/auth/github`, `GET /api/auth/github/callback`, `GET /api/auth/google`, `GET /api/auth/google/callback` on the same `authRouter` — nothing later in this plan depends on new exports from this task.

- [ ] **Step 1: Before writing code, check the OAuth app callback URLs**

Ask the user to confirm, in their GitHub OAuth App settings and Google Cloud OAuth Client settings, that the authorized callback/redirect URLs are exactly:
- GitHub: `http://localhost:3000/api/auth/github/callback`
- Google: `http://localhost:3000/api/auth/google/callback`

If they don't match, the provider will reject the callback with an error — ask the user to update them before testing.

- [ ] **Step 2: Write the Passport strategies**

`apps/backend/src/config/passport.ts`:
```ts
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import type { UserRole } from '../types/auth.types';

const PORT = process.env.PORT || 3000;
const BACKEND_URL = `http://localhost:${PORT}`;

function clampRole(role: unknown): Exclude<UserRole, 'admin'> {
  return role === 'teacher' ? 'teacher' : 'student';
}

interface OAuthProfileInput {
  providerIdField: 'githubId' | 'googleId';
  providerId: string;
  email: string | undefined;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
}

async function findOrCreateOAuthUser(input: OAuthProfileInput): Promise<User> {
  const { providerIdField, providerId, email, name, avatarUrl, role } = input;

  const existingByProvider = await User.findOne({ where: { [providerIdField]: providerId } });
  if (existingByProvider) {
    return existingByProvider;
  }

  if (email) {
    const normalizedEmail = email.toLowerCase();
    const existingByEmail = await User.findOne({ where: { email: normalizedEmail } });
    if (existingByEmail) {
      existingByEmail[providerIdField] = providerId;
      await existingByEmail.save();
      return existingByEmail;
    }
  }

  return User.create({
    email: (email ?? `${providerId}@${providerIdField}.dyascodeit.local`).toLowerCase(),
    passwordHash: null,
    name,
    role,
    githubId: providerIdField === 'githubId' ? providerId : null,
    googleId: providerIdField === 'googleId' ? providerId : null,
    avatarUrl,
  });
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
      passReqToCallback: true,
    },
    // Community typings for passport-github2's Profile are incomplete for `emails`/`photos`; loosened deliberately.
    (req: any, _accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: User) => void) => {
      const role = clampRole(req.query.state);
      findOrCreateOAuthUser({
        providerIdField: 'githubId',
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName || profile.username || 'GitHub User',
        avatarUrl: profile.photos?.[0]?.value ?? null,
        role,
      })
        .then((user) => done(null, user))
        .catch((err) => done(err));
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    (req: any, _accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: User) => void) => {
      const role = clampRole(req.query.state);
      findOrCreateOAuthUser({
        providerIdField: 'googleId',
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName || 'Google User',
        avatarUrl: profile.photos?.[0]?.value ?? null,
        role,
      })
        .then((user) => done(null, user))
        .catch((err) => done(err));
    },
  ),
);

export default passport;
```

- [ ] **Step 3: Add the OAuth routes**

In `apps/backend/src/routes/auth.routes.ts`, replace the whole file with:
```ts
import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import passport from '../config/passport';
import { User } from '../models/User';
import { signAuthToken, setAuthCookie } from '../services/auth.service';

const APP_URL = process.env.APP_URL || 'http://localhost:4201';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);

authRouter.get('/github', (req, res, next) => {
  const role = req.query.role === 'teacher' ? 'teacher' : 'student';
  passport.authenticate('github', { session: false, scope: ['user:email'], state: role })(req, res, next);
});

authRouter.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err: unknown, user: User | false) => {
    if (err || !user) {
      res.redirect(`${APP_URL}/login?error=oauth_failed`);
      return;
    }
    setAuthCookie(res, signAuthToken(user));
    res.redirect(`${APP_URL}/dashboard`);
  })(req, res, next);
});

authRouter.get('/google', (req, res, next) => {
  const role = req.query.role === 'teacher' ? 'teacher' : 'student';
  passport.authenticate('google', { session: false, scope: ['profile', 'email'], state: role })(req, res, next);
});

authRouter.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err: unknown, user: User | false) => {
    if (err || !user) {
      res.redirect(`${APP_URL}/login?error=oauth_failed`);
      return;
    }
    setAuthCookie(res, signAuthToken(user));
    res.redirect(`${APP_URL}/dashboard`);
  })(req, res, next);
});
```

- [ ] **Step 4: Initialize Passport in `app.ts`**

In `apps/backend/src/app.ts`, add the import `import passport from './config/passport';` alongside the other imports, and add `app.use(passport.initialize());` right after `app.use(cookieParser());`.

- [ ] **Step 5: Verify with a real browser OAuth flow**

Ask the user to confirm both dev servers are running, then:
1. Open `http://localhost:4201/login` in their browser, click "Continue with GitHub", complete the real GitHub authorization, and report whether they land on `/dashboard` showing their GitHub display name.
2. Repeat with "Continue with Google".
3. Ask them to try the same GitHub button a second time (already-authorized) and confirm they land on `/dashboard` again without a duplicate account being created — this can be double-checked by them signing in with email/password using the same email afterward and confirming the inline banner reads "That account was created with Google or GitHub. Use the matching button below." (the `oauth_only` case from Task 4's login endpoint — surfaced via `AuthService`, not a redirect, since login is now AJAX).

If either OAuth flow itself fails (as opposed to the email/password check above), the browser lands back on `/login?error=oauth_failed` and shows the generic "Something went wrong signing in with that provider" banner — ask the user to check the backend terminal for a logged error in that case; the callback URL mismatch from Step 1 is the most common cause.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/config/passport.ts apps/backend/src/routes/auth.routes.ts apps/backend/src/app.ts
git commit -m "feat: add GitHub and Google OAuth2 login"
```
