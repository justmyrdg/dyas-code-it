---
name: scaffold
description: Bootstrap the DyasCodeIT monorepo (backend, frontend, shared package) from the planning docs. Only use when the user explicitly runs /scaffold — this creates files and installs dependencies.
disable-model-invocation: true
---

Follow `docs/DyasCodeIT_QUICK_START.md` step by step to create the project structure, with these corrections already applied (see root `CLAUDE.md` for why):

- Use **npm workspaces + `concurrently`** for the monorepo. Do NOT install or configure `nx` even though the guide's Step 1 heading says "Monorepo with NX" — skip that install line, everything else in the guide already uses plain workspaces.
- In the backend `.env.example`, include only `CLAUDE_API_KEY` — omit `OPENAI_API_KEY` entirely.

Steps to execute, in order:

1. **Root structure**: create `apps/frontend`, `apps/backend`, `shared` directories; root `package.json` with npm workspaces (`apps/backend`, `apps/frontend`, `shared`) and the `dev`/`dev:backend`/`dev:frontend`/`build`/`start` scripts; root `.gitignore`; root `README.md`. (Skip `git init` unless the user asks — check `git status` first to see if this is already a repo.)
2. **Backend** (`apps/backend`): `npm init`, install the dependencies listed in the guide (express, cors, helmet, dotenv, jsonwebtoken, bcryptjs, axios, socket.io, pg, sequelize, stripe + dev deps), create `tsconfig.json`, `nodemon.json`, `.env.example` (with the Claude-only correction above), `src/app.ts`, `src/server.ts`, and the `src/{routes,controllers,models,services,middleware,utils,config}` directories.
3. **Frontend** (`apps/frontend`): scaffold with Angular CLI (`ng new . --skip-git --routing --style=css --package-manager=npm`), add Tailwind CSS v4 with `ng add tailwindcss` (wires up PostCSS/build config automatically — no `tailwind.config.js`), update `src/styles.css` with a CSS-first `@theme` block for the UNO color/radius tokens plus the UNO component classes, create `src/environments/environment.ts` and `environment.prod.ts`.
4. **Shared** (`shared`): `package.json`, `tsconfig.json`, `src/index.ts`, `src/models/index.ts` with the shared TypeScript interfaces (User, Topic, Class, Lesson, Certificate) from the guide.
5. **Install root dependencies** (`npm install`) and confirm `npm run dev` starts both servers (frontend on 4200, backend on 3000).

After scaffolding, do not pick a test framework, deployment target, or add Docker — those are open decisions noted in root `CLAUDE.md`; ask the user first.

Report back which steps completed, any command that failed (e.g. Angular CLI not installed, PostgreSQL not running), and what's left to configure manually (`.env` values, OAuth app credentials, Stripe key).
