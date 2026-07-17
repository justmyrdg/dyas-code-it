# DyasCodeIT Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the UNO-themed public landing page (7 sections) plus a `/login` placeholder in the Angular frontend, per `docs/superpowers/specs/2026-07-15-landing-page-design.md`.

**Architecture:** A `Landing` page component assembles six standalone section components; app-level `Header`/`Footer` render around the router outlet in the root `App` component. All CTAs route to `/login` (with optional `role` query param). Styling comes from the existing `.uno-*` classes in `src/styles.css` plus new animation keyframes.

**Tech Stack:** Angular 21 (standalone components, `app-*` selectors, class names without `Component` suffix), Tailwind CSS v4 (CSS-first `@theme` config, already wired), Angular Router with fragment scrolling.

## Global Constraints

- **No emoji anywhere in UI code** — inline SVG icons only (this includes checkmarks: use SVG `m4.5 12.75 6 6 9-13.5` path, never `✓`).
- **Tailwind v4**: `bg-opacity-*`/`text-opacity-*` do not exist — use slash opacity (`text-white/80`); unknown `@apply` utilities fail the build.
- **UNO palette**: red `#FF4444`→`bg-red-600` classes, yellow `#FFD700`→`bg-yellow-400`, blue `#0066FF`→`bg-blue-600`, green `#00AA44`→`bg-green-600`, black `#222222`.
- **No test framework exists** (deliberate open decision — do not add one). Each task's test cycle is: `npm run build -w apps/frontend` passes, plus visual verification in Task 8.
- All commands run from repo root `c:\Users\Justmyr\Documents\DyasCodeIT` unless stated.
- Angular file conventions in this repo: component class `Hero` in `hero.ts` with `templateUrl: './hero.html'`, selector `app-hero`. No `standalone: true` flag (it is the default).
- Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Routing, app shell, and Login placeholder

**Files:**

- Create: `apps/frontend/src/app/pages/landing/landing.ts`
- Create: `apps/frontend/src/app/pages/landing/landing.html`
- Create: `apps/frontend/src/app/pages/login/login.ts`
- Create: `apps/frontend/src/app/pages/login/login.html`
- Modify: `apps/frontend/src/app/app.routes.ts` (whole file)
- Modify: `apps/frontend/src/app/app.config.ts` (whole file)
- Modify: `apps/frontend/src/app/app.html` (replace all 20 kB of boilerplate)
- Modify: `apps/frontend/src/app/app.ts`
- Modify: `apps/frontend/src/index.html` (title)

**Interfaces:**

- Consumes: nothing (first task).
- Produces: routes `/` (Landing) and `/login` (Login); `Landing` class at `pages/landing/landing.ts` whose `imports: []` array and template later tasks extend; root shell where Task 2 inserts Header/Footer.

- [ ] **Step 1: Create the Landing page shell**

`apps/frontend/src/app/pages/landing/landing.ts`:

```typescript
import { Component } from "@angular/core";

@Component({
	selector: "app-landing",
	imports: [],
	templateUrl: "./landing.html",
})
export class Landing {}
```

`apps/frontend/src/app/pages/landing/landing.html`:

```html
<main>
	<!-- Section components are added here by later tasks -->
</main>
```

- [ ] **Step 2: Create the Login placeholder page**

`apps/frontend/src/app/pages/login/login.ts`:

```typescript
import { Component, input, computed } from "@angular/core";

@Component({
	selector: "app-login",
	imports: [],
	templateUrl: "./login.html",
})
export class Login {
	// Bound from the ?role= query param via withComponentInputBinding()
	readonly role = input<string | undefined>();

	readonly heading = computed(() => {
		const role = this.role();
		if (role === "student") return "Sign in to start learning";
		if (role === "teacher") return "Sign in to teach a class";
		return "Sign in to DyasCodeIT";
	});
}
```

`apps/frontend/src/app/pages/login/login.html`:

```html
<main
	class="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
	<div class="uno-card uno-card-blue max-w-md w-full">
		<div class="uno-card-header">
			<span>{{ heading() }}</span>
			<span class="uno-card-badge">Soon</span>
		</div>
		<div class="uno-card-body">
			<p class="text-white text-lg">
				Sign-in with GitHub and Google is coming soon. We are putting the
				finishing touches on secure OAuth login.
			</p>
		</div>
	</div>
</main>
```

- [ ] **Step 3: Define routes with wildcard redirect**

Replace `apps/frontend/src/app/app.routes.ts`:

```typescript
import { Routes } from "@angular/router";

export const routes: Routes = [
	{
		path: "",
		loadComponent: () =>
			import("./pages/landing/landing").then((m) => m.Landing),
	},
	{
		path: "login",
		loadComponent: () => import("./pages/login/login").then((m) => m.Login),
	},
	{ path: "**", redirectTo: "" },
];
```

- [ ] **Step 4: Enable anchor scrolling and component input binding**

Replace `apps/frontend/src/app/app.config.ts`:

```typescript
import {
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import {
	provideRouter,
	withComponentInputBinding,
	withInMemoryScrolling,
} from "@angular/router";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(
			routes,
			withComponentInputBinding(),
			withInMemoryScrolling({
				anchorScrolling: "enabled",
				scrollPositionRestoration: "enabled",
			}),
		),
	],
};
```

- [ ] **Step 5: Replace the root shell and page title**

Replace `apps/frontend/src/app/app.html` entirely with:

```html
<router-outlet />
```

Replace `apps/frontend/src/app/app.ts` (drop the unused `title` signal):

```typescript
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
	selector: "app-root",
	imports: [RouterOutlet],
	templateUrl: "./app.html",
	styleUrl: "./app.css",
})
export class App {}
```

In `apps/frontend/src/index.html`, change `<title>Frontend</title>` to `<title>DyasCodeIT - Learn to Code, Level Up Your Skills</title>`.

- [ ] **Step 6: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: `Application bundle generation complete` with zero errors (lazy chunks for landing and login appear in output).

- [ ] **Step 7: Commit**

```bash
git add apps/frontend
git commit -m "feat: add landing/login routes and app shell"
```

---

### Task 2: Header and Footer components

**Files:**

- Create: `apps/frontend/src/app/components/header/header.ts`
- Create: `apps/frontend/src/app/components/header/header.html`
- Create: `apps/frontend/src/app/components/footer/footer.ts`
- Create: `apps/frontend/src/app/components/footer/footer.html`
- Modify: `apps/frontend/src/app/app.ts`, `apps/frontend/src/app/app.html`

**Interfaces:**

- Consumes: routes `/` and `/login` from Task 1; section fragments `features`, `how-it-works`, `pricing` (section `id`s are created in Tasks 4–6).
- Produces: `Header` (`app-header`) and `Footer` (`app-footer`) rendered on every page via the root shell.

- [ ] **Step 1: Create Header**

`apps/frontend/src/app/components/header/header.ts`:

```typescript
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-header",
	imports: [RouterLink],
	templateUrl: "./header.html",
})
export class Header {}
```

`apps/frontend/src/app/components/header/header.html`:

```html
<header class="bg-white border-b-4 border-black shadow-lg sticky top-0 z-50">
	<nav class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
		<a
			routerLink="/"
			class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600 tracking-tight">
			DyasCodeIT
		</a>

		<div class="hidden md:flex items-center gap-8 font-semibold text-gray-900">
			<a
				routerLink="/"
				fragment="features"
				class="hover:text-blue-600 transition-colors"
				>Features</a
			>
			<a
				routerLink="/"
				fragment="how-it-works"
				class="hover:text-blue-600 transition-colors"
				>How It Works</a
			>
			<a
				routerLink="/"
				fragment="pricing"
				class="hover:text-blue-600 transition-colors"
				>Pricing</a
			>
		</div>

		<a routerLink="/login" class="uno-btn-outline inline-block">Sign In</a>
	</nav>
</header>
```

- [ ] **Step 2: Create Footer**

`apps/frontend/src/app/components/footer/footer.ts`:

```typescript
import { Component } from "@angular/core";

@Component({
	selector: "app-footer",
	imports: [],
	templateUrl: "./footer.html",
})
export class Footer {}
```

`apps/frontend/src/app/components/footer/footer.html`:

```html
<footer class="bg-gray-900 text-white border-t-4 border-black px-8 py-12">
	<div
		class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
		<div>
			<p
				class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600">
				DyasCodeIT
			</p>
			<p class="text-gray-400 mt-2">Learn to Code, Level Up Your Skills</p>
		</div>

		<nav class="grid grid-cols-2 gap-2 font-semibold">
			<a href="#" class="text-gray-300 hover:text-white transition-colors"
				>About</a
			>
			<a href="#" class="text-gray-300 hover:text-white transition-colors"
				>Docs</a
			>
			<a href="#" class="text-gray-300 hover:text-white transition-colors"
				>Blog</a
			>
			<a href="#" class="text-gray-300 hover:text-white transition-colors"
				>Status</a
			>
			<a href="#" class="text-gray-300 hover:text-white transition-colors"
				>Support</a
			>
			<a href="#" class="text-gray-300 hover:text-white transition-colors"
				>Terms</a
			>
			<a href="#" class="text-gray-300 hover:text-white transition-colors"
				>Privacy</a
			>
		</nav>

		<div class="flex gap-4 md:justify-end">
			<a
				href="https://github.com"
				aria-label="GitHub"
				class="text-gray-300 hover:text-white transition-colors">
				<svg
					class="w-6 h-6"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true">
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
				</svg>
			</a>
			<a
				href="https://twitter.com"
				aria-label="Twitter"
				class="text-gray-300 hover:text-white transition-colors">
				<svg
					class="w-6 h-6"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true">
					<path
						d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95-1.174-1.64L4.283 4.13h2.06l4.696 6.56 1.175 1.64 6.06 8.464h-2.06l-4.798-6.67Z" />
				</svg>
			</a>
			<a
				href="https://linkedin.com"
				aria-label="LinkedIn"
				class="text-gray-300 hover:text-white transition-colors">
				<svg
					class="w-6 h-6"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true">
					<path
						d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
				</svg>
			</a>
		</div>
	</div>
	<p class="text-center text-gray-500 mt-10 text-sm">
		DyasCodeIT 2026. All rights reserved.
	</p>
</footer>
```

- [ ] **Step 3: Wire Header/Footer into the root shell**

Replace `apps/frontend/src/app/app.ts`:

```typescript
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";

@Component({
	selector: "app-root",
	imports: [RouterOutlet, Header, Footer],
	templateUrl: "./app.html",
	styleUrl: "./app.css",
})
export class App {}
```

Replace `apps/frontend/src/app/app.html`:

```html
<app-header />
<router-outlet />
<app-footer />
```

- [ ] **Step 4: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: success, no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend
git commit -m "feat: add app header and footer"
```

---

### Task 3: Hero section (+ global animations)

**Files:**

- Create: `apps/frontend/src/app/components/landing/hero/hero.ts`
- Create: `apps/frontend/src/app/components/landing/hero/hero.html`
- Create: `apps/frontend/src/app/components/landing/hero/hero.css`
- Modify: `apps/frontend/src/styles.css` (append keyframes)
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`, `landing.html`

**Interfaces:**

- Consumes: `/login` route (Task 1), `.uno-btn-*` classes (existing `styles.css`).
- Produces: `Hero` (`app-hero`); global `cardSlideIn` keyframes + `.uno-card` entry animation and stagger used by all later card sections.

- [ ] **Step 1: Append animations to global styles**

Append to the END of `apps/frontend/src/styles.css` (after the `@layer components` block):

```css
/* Page-load animations (design system: cardSlideIn with stagger) */
@keyframes cardSlideIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.uno-card {
	animation: cardSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.uno-card:nth-child(1) {
	animation-delay: 0.1s;
}
.uno-card:nth-child(2) {
	animation-delay: 0.2s;
}
.uno-card:nth-child(3) {
	animation-delay: 0.3s;
}
.uno-card:nth-child(4) {
	animation-delay: 0.4s;
}
```

- [ ] **Step 2: Create the Hero component**

`apps/frontend/src/app/components/landing/hero/hero.ts`:

```typescript
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-hero",
	imports: [RouterLink],
	templateUrl: "./hero.html",
	styleUrl: "./hero.css",
})
export class Hero {}
```

`apps/frontend/src/app/components/landing/hero/hero.html`:

```html
<section
	class="min-h-[80vh] bg-white flex flex-col md:flex-row items-center justify-between px-8 py-16 gap-12 max-w-7xl mx-auto">
	<div class="flex-1">
		<h1
			class="text-5xl md:text-6xl font-black mb-4 leading-tight text-gray-900">
			Learn to Code,
			<span
				class="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600">
				Level Up Your Skills
			</span>
		</h1>
		<p class="text-2xl text-gray-700 mb-8">
			Powered by Dyas AI Teaching Assistant. Interactive coding lessons,
			real-time feedback, gamified learning.
		</p>
		<div class="flex flex-wrap gap-4">
			<a
				routerLink="/login"
				[queryParams]="{ role: 'student' }"
				class="uno-btn-primary text-lg px-8 py-4 inline-block">
				Start Learning
			</a>
			<a
				routerLink="/login"
				[queryParams]="{ role: 'teacher' }"
				class="uno-btn-secondary text-lg px-8 py-4 inline-block">
				Teach a Class
			</a>
		</div>
	</div>

	<div class="flex-1 relative h-96 w-full hidden md:block" aria-hidden="true">
		<div class="hero-card hero-card-red"></div>
		<div class="hero-card hero-card-yellow"></div>
		<div class="hero-card hero-card-blue"></div>
		<div class="hero-card hero-card-green"></div>
	</div>
</section>
```

`apps/frontend/src/app/components/landing/hero/hero.css`:

```css
/* Decorative fan of UNO cards with a gentle float */
.hero-card {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 160px;
	height: 240px;
	border: 3px solid #222222;
	border-radius: 24px;
	box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
	animation: heroFloat 4s ease-in-out infinite;
}

.hero-card-red {
	background: #ff4444;
	transform: translate(-50%, -50%) rotate(-24deg) translateX(-90px);
}

.hero-card-yellow {
	background: #ffd700;
	transform: translate(-50%, -50%) rotate(-8deg) translateX(-30px);
	animation-delay: 0.5s;
}

.hero-card-blue {
	background: #0066ff;
	transform: translate(-50%, -50%) rotate(8deg) translateX(30px);
	animation-delay: 1s;
}

.hero-card-green {
	background: #00aa44;
	transform: translate(-50%, -50%) rotate(24deg) translateX(90px);
	animation-delay: 1.5s;
}

@keyframes heroFloat {
	0%,
	100% {
		margin-top: 0;
	}
	50% {
		margin-top: -12px;
	}
}
```

- [ ] **Step 3: Add Hero to the Landing page**

Replace `apps/frontend/src/app/pages/landing/landing.ts`:

```typescript
import { Component } from "@angular/core";
import { Hero } from "../../components/landing/hero/hero";

@Component({
	selector: "app-landing",
	imports: [Hero],
	templateUrl: "./landing.html",
})
export class Landing {}
```

Replace `apps/frontend/src/app/pages/landing/landing.html`:

```html
<main>
	<app-hero />
</main>
```

- [ ] **Step 4: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: success, no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend
git commit -m "feat: add hero section with UNO card fan"
```

---

### Task 4: Features section

**Files:**

- Create: `apps/frontend/src/app/components/landing/features/features.ts`
- Create: `apps/frontend/src/app/components/landing/features/features.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`, `landing.html`

**Interfaces:**

- Consumes: `.uno-card`, `.uno-grid` classes; stagger animation from Task 3.
- Produces: `Features` (`app-features`) with `id="features"` used by the Header fragment link.

- [ ] **Step 1: Create the Features component**

`apps/frontend/src/app/components/landing/features/features.ts`:

```typescript
import { Component } from "@angular/core";

interface Feature {
	title: string;
	badge: string;
	description: string;
	cardClass: string;
	textClass: string;
	iconPath: string;
}

@Component({
	selector: "app-features",
	imports: [],
	templateUrl: "./features.html",
})
export class Features {
	readonly features: Feature[] = [
		{
			title: "Engaging Lessons",
			badge: "Red",
			description:
				"Interactive coding lessons with real code execution. No theory, all practice.",
			cardClass: "uno-card-red",
			textClass: "text-white",
			iconPath:
				"M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5",
		},
		{
			title: "AI Tutor (Dyas)",
			badge: "Yellow",
			description:
				"24/7 AI assistant that guides you without giving answers. Learn at your pace.",
			cardClass: "uno-card-yellow",
			textClass: "text-gray-900",
			iconPath:
				"M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
		},
		{
			title: "Gamified Learning",
			badge: "Blue",
			description:
				"Earn certificates, badges, and build your coding portfolio. Make learning fun!",
			cardClass: "uno-card-blue",
			textClass: "text-white",
			iconPath:
				"M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0",
		},
		{
			title: "Learn Together",
			badge: "Green",
			description:
				"Join classes with peers, get feedback from teachers, share your projects.",
			cardClass: "uno-card-green",
			textClass: "text-white",
			iconPath:
				"M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
		},
	];
}
```

`apps/frontend/src/app/components/landing/features/features.html`:

```html
<section id="features" class="py-20 bg-gray-50 px-8">
	<h2 class="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
		What Makes DyasCodeIT Special
	</h2>

	<div class="uno-grid max-w-7xl mx-auto lg:grid-cols-4">
		@for (feature of features; track feature.title) {
		<div class="uno-card" [class]="feature.cardClass">
			<div class="uno-card-header">
				<span>{{ feature.title }}</span>
				<span class="uno-card-badge">{{ feature.badge }}</span>
			</div>
			<div class="uno-card-body">
				<svg
					class="w-16 h-16 mb-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						[attr.d]="feature.iconPath" />
				</svg>
				<p class="text-lg" [class]="feature.textClass">
					{{ feature.description }}
				</p>
			</div>
		</div>
		}
	</div>
</section>
```

- [ ] **Step 2: Add Features to the Landing page**

Replace `apps/frontend/src/app/pages/landing/landing.ts`:

```typescript
import { Component } from "@angular/core";
import { Hero } from "../../components/landing/hero/hero";
import { Features } from "../../components/landing/features/features";

@Component({
	selector: "app-landing",
	imports: [Hero, Features],
	templateUrl: "./landing.html",
})
export class Landing {}
```

Replace `apps/frontend/src/app/pages/landing/landing.html`:

```html
<main>
	<app-hero />
	<app-features />
</main>
```

- [ ] **Step 3: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: success, no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend
git commit -m "feat: add features section with four UNO cards"
```

---

### Task 5: How It Works section

**Files:**

- Create: `apps/frontend/src/app/components/landing/how-it-works/how-it-works.ts`
- Create: `apps/frontend/src/app/components/landing/how-it-works/how-it-works.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`, `landing.html`

**Interfaces:**

- Consumes: `.uno-card` classes and stagger animation.
- Produces: `HowItWorks` (`app-how-it-works`) with `id="how-it-works"` used by the Header fragment link.

- [ ] **Step 1: Create the HowItWorks component**

`apps/frontend/src/app/components/landing/how-it-works/how-it-works.ts`:

```typescript
import { Component } from "@angular/core";

interface Step {
	badge: string;
	title: string;
	description: string;
	cardClass: string;
	textClass: string;
	iconColorClass: string;
	iconPath: string;
}

@Component({
	selector: "app-how-it-works",
	imports: [],
	templateUrl: "./how-it-works.html",
})
export class HowItWorks {
	readonly steps: Step[] = [
		{
			badge: "Step 1",
			title: "Create a Class",
			description: "Select a topic and create your class in seconds",
			cardClass: "uno-card-red",
			textClass: "text-white",
			iconColorClass: "text-red-600",
			iconPath: "M12 4.5v15m7.5-7.5h-15",
		},
		{
			badge: "Step 2",
			title: "Share Code",
			description: "Get a unique code. Share via email, QR, or link",
			cardClass: "uno-card-yellow",
			textClass: "text-gray-900",
			iconColorClass: "text-yellow-500",
			iconPath:
				"M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z",
		},
		{
			badge: "Step 3",
			title: "Join & Learn",
			description: "Students join, learn, and get help from Dyas AI",
			cardClass: "uno-card-blue",
			textClass: "text-white",
			iconColorClass: "text-blue-600",
			iconPath:
				"M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25",
		},
		{
			badge: "Step 4",
			title: "Get Certificate",
			description: "Earn a QR-verified certificate on completion",
			cardClass: "uno-card-green",
			textClass: "text-white",
			iconColorClass: "text-green-600",
			iconPath:
				"M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z",
		},
	];
}
```

`apps/frontend/src/app/components/landing/how-it-works/how-it-works.html`:

```html
<section id="how-it-works" class="py-20 bg-white px-8">
	<h2 class="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
		Get Started in 4 Easy Steps
	</h2>

	<div class="relative max-w-7xl mx-auto">
		<div
			class="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gray-300"
			aria-hidden="true"></div>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
			@for (step of steps; track step.badge) {
			<div class="uno-card" [class]="step.cardClass">
				<div class="uno-card-header">
					<span class="uno-card-badge">{{ step.badge }}</span>
				</div>
				<div class="uno-card-body flex flex-col items-center text-center">
					<div
						class="w-20 h-20 bg-white rounded-full border-2 border-black flex items-center justify-center mb-4">
						<svg
							class="w-10 h-10"
							[class]="step.iconColorClass"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								[attr.d]="step.iconPath" />
						</svg>
					</div>
					<h3 class="text-2xl font-bold mb-2" [class]="step.textClass">
						{{ step.title }}
					</h3>
					<p [class]="step.textClass">{{ step.description }}</p>
				</div>
			</div>
			}
		</div>
	</div>
</section>
```

- [ ] **Step 2: Add HowItWorks to the Landing page**

Replace `apps/frontend/src/app/pages/landing/landing.ts`:

```typescript
import { Component } from "@angular/core";
import { Hero } from "../../components/landing/hero/hero";
import { Features } from "../../components/landing/features/features";
import { HowItWorks } from "../../components/landing/how-it-works/how-it-works";

@Component({
	selector: "app-landing",
	imports: [Hero, Features, HowItWorks],
	templateUrl: "./landing.html",
})
export class Landing {}
```

Replace `apps/frontend/src/app/pages/landing/landing.html`:

```html
<main>
	<app-hero />
	<app-features />
	<app-how-it-works />
</main>
```

- [ ] **Step 3: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: success, no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend
git commit -m "feat: add how-it-works section with four step cards"
```

---

### Task 6: Pricing section

**Files:**

- Create: `apps/frontend/src/app/components/landing/pricing/pricing.ts`
- Create: `apps/frontend/src/app/components/landing/pricing/pricing.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`, `landing.html`

**Interfaces:**

- Consumes: `/login` route; `.uno-card` classes.
- Produces: `Pricing` (`app-pricing`) with `id="pricing"` used by the Header fragment link.

- [ ] **Step 1: Create the Pricing component**

`apps/frontend/src/app/components/landing/pricing/pricing.ts`:

```typescript
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-pricing",
	imports: [RouterLink],
	templateUrl: "./pricing.html",
})
export class Pricing {
	readonly freeFeatures = [
		"2 Classes",
		"50 Students Per Class",
		"Full Dyas AI Access",
		"Certificates with QR",
	];

	readonly premiumFeatures = [
		"Unlimited Classes",
		"Advanced Analytics",
		"Priority Support",
		"Dyas Priority Queue",
	];
}
```

`apps/frontend/src/app/components/landing/pricing/pricing.html`:

```html
<section id="pricing" class="py-20 bg-gray-50 px-8">
	<h2 class="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
		Simple Pricing, Great Value
	</h2>

	<div
		class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
		<!-- Free tier -->
		<div class="uno-card bg-white border-4 border-black">
			<div class="uno-card-header bg-gray-100">
				<span class="text-gray-900">Free Forever</span>
				<span class="uno-card-badge border-2 border-black">Free</span>
			</div>
			<div class="uno-card-body">
				<p class="text-3xl font-black mb-6 text-gray-900">$0</p>
				<ul class="space-y-3 mb-8">
					@for (feature of freeFeatures; track feature) {
					<li class="flex items-center text-gray-900">
						<svg
							class="w-6 h-6 mr-3 text-green-600 shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2.5"
							stroke="currentColor"
							aria-hidden="true">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m4.5 12.75 6 6 9-13.5" />
						</svg>
						<span class="font-semibold">{{ feature }}</span>
					</li>
					}
				</ul>
				<a routerLink="/login" class="w-full uno-btn-primary block text-center"
					>Get Started Free</a
				>
			</div>
		</div>

		<!-- Premium tier -->
		<div class="uno-card uno-card-blue relative overflow-visible">
			<div class="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
				<span
					class="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-black border-2 border-black whitespace-nowrap">
					MOST POPULAR
				</span>
			</div>
			<div class="uno-card-header">
				<span>Premium</span>
				<span class="uno-card-badge">Pro</span>
			</div>
			<div class="uno-card-body">
				<p class="text-3xl font-black mb-2 text-white">
					$9.99<span class="text-base text-white/80">/month</span>
				</p>
				<p class="text-white/80 mb-6 font-semibold">
					or $99.99/year (save 17%)
				</p>
				<ul class="space-y-3 mb-8 text-white">
					@for (feature of premiumFeatures; track feature) {
					<li class="flex items-center">
						<span
							class="w-6 h-6 mr-3 bg-white text-blue-600 rounded-full flex items-center justify-center shrink-0">
							<svg
								class="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="3"
								stroke="currentColor"
								aria-hidden="true">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="m4.5 12.75 6 6 9-13.5" />
							</svg>
						</span>
						<span class="font-semibold">{{ feature }}</span>
					</li>
					}
				</ul>
				<a
					routerLink="/login"
					class="w-full bg-white text-blue-600 font-bold py-3 rounded-xl border-2 border-black hover:bg-blue-50 block text-center transition-colors">
					Start Free Trial
				</a>
			</div>
		</div>
	</div>
</section>
```

Note: `overflow-visible` on the premium card overrides the `.uno-card` default `overflow-hidden` so the MOST POPULAR badge can hang above the card edge.

- [ ] **Step 2: Add Pricing to the Landing page**

Replace `apps/frontend/src/app/pages/landing/landing.ts`:

```typescript
import { Component } from "@angular/core";
import { Hero } from "../../components/landing/hero/hero";
import { Features } from "../../components/landing/features/features";
import { HowItWorks } from "../../components/landing/how-it-works/how-it-works";
import { Pricing } from "../../components/landing/pricing/pricing";

@Component({
	selector: "app-landing",
	imports: [Hero, Features, HowItWorks, Pricing],
	templateUrl: "./landing.html",
})
export class Landing {}
```

Replace `apps/frontend/src/app/pages/landing/landing.html`:

```html
<main>
	<app-hero />
	<app-features />
	<app-how-it-works />
	<app-pricing />
</main>
```

- [ ] **Step 3: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: success, no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend
git commit -m "feat: add pricing section with free and premium tiers"
```

---

### Task 7: Testimonials and CTA sections

**Files:**

- Create: `apps/frontend/src/app/components/landing/testimonials/testimonials.ts`
- Create: `apps/frontend/src/app/components/landing/testimonials/testimonials.html`
- Create: `apps/frontend/src/app/components/landing/cta-section/cta-section.ts`
- Create: `apps/frontend/src/app/components/landing/cta-section/cta-section.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`, `landing.html`

**Interfaces:**

- Consumes: `/login` route; `.uno-card`/`.uno-btn-*` classes.
- Produces: `Testimonials` (`app-testimonials`), `CtaSection` (`app-cta-section`). Completes the Landing page assembly.

- [ ] **Step 1: Create the Testimonials component (static two cards)**

`apps/frontend/src/app/components/landing/testimonials/testimonials.ts`:

```typescript
import { Component } from "@angular/core";

interface Testimonial {
	quote: string;
	name: string;
	roleLabel: string;
	initial: string;
	cardClass: string;
	textClass: string;
}

@Component({
	selector: "app-testimonials",
	imports: [],
	templateUrl: "./testimonials.html",
})
export class Testimonials {
	readonly testimonials: Testimonial[] = [
		{
			quote:
				"I was stuck on loops for weeks. Dyas helped me understand them without just giving me the answer. The interactive lessons are amazing!",
			name: "Sarah",
			roleLabel: "Student",
			initial: "S",
			cardClass: "uno-card-yellow",
			textClass: "text-gray-900",
		},
		{
			quote:
				"I can create a class and share it in minutes. My students love learning with Dyas. Grading is so much easier with automated feedback!",
			name: "John",
			roleLabel: "Teacher",
			initial: "J",
			cardClass: "uno-card-blue",
			textClass: "text-white",
		},
	];
}
```

`apps/frontend/src/app/components/landing/testimonials/testimonials.html`:

```html
<section class="py-20 bg-white px-8">
	<h2 class="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
		Loved by Students and Teachers
	</h2>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
		@for (t of testimonials; track t.name) {
		<div class="uno-card" [class]="t.cardClass">
			<div class="uno-card-body pt-6">
				<p class="text-lg mb-6" [class]="t.textClass">"{{ t.quote }}"</p>
				<div class="flex items-center gap-3">
					<span
						class="w-12 h-12 bg-white text-gray-900 rounded-full border-2 border-black flex items-center justify-center font-black text-xl">
						{{ t.initial }}
					</span>
					<span class="font-bold" [class]="t.textClass"
						>{{ t.name }}, {{ t.roleLabel }}</span
					>
				</div>
			</div>
		</div>
		}
	</div>
</section>
```

- [ ] **Step 2: Create the CtaSection component**

`apps/frontend/src/app/components/landing/cta-section/cta-section.ts`:

```typescript
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-cta-section",
	imports: [RouterLink],
	templateUrl: "./cta-section.html",
})
export class CtaSection {}
```

`apps/frontend/src/app/components/landing/cta-section/cta-section.html`:

```html
<section class="py-20 bg-gray-900 px-8 text-center">
	<h2 class="text-4xl md:text-5xl font-black text-white mb-8">
		Ready to Code?
	</h2>
	<p class="text-xl text-gray-300 mb-10">
		Pick your side and jump in - it takes less than a minute.
	</p>
	<div class="flex flex-wrap gap-4 justify-center">
		<a
			routerLink="/login"
			[queryParams]="{ role: 'student' }"
			class="uno-btn-primary text-lg px-8 py-4 inline-block">
			I'm a Student
		</a>
		<a
			routerLink="/login"
			[queryParams]="{ role: 'teacher' }"
			class="uno-btn-secondary text-lg px-8 py-4 inline-block">
			I'm a Teacher
		</a>
	</div>
</section>
```

- [ ] **Step 3: Complete the Landing page assembly**

Replace `apps/frontend/src/app/pages/landing/landing.ts`:

```typescript
import { Component } from "@angular/core";
import { Hero } from "../../components/landing/hero/hero";
import { Features } from "../../components/landing/features/features";
import { HowItWorks } from "../../components/landing/how-it-works/how-it-works";
import { Pricing } from "../../components/landing/pricing/pricing";
import { Testimonials } from "../../components/landing/testimonials/testimonials";
import { CtaSection } from "../../components/landing/cta-section/cta-section";

@Component({
	selector: "app-landing",
	imports: [Hero, Features, HowItWorks, Pricing, Testimonials, CtaSection],
	templateUrl: "./landing.html",
})
export class Landing {}
```

Replace `apps/frontend/src/app/pages/landing/landing.html`:

```html
<main>
	<app-hero />
	<app-features />
	<app-how-it-works />
	<app-pricing />
	<app-testimonials />
	<app-cta-section />
</main>
```

- [ ] **Step 4: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: success, no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend
git commit -m "feat: add testimonials and CTA sections, complete landing page"
```

---

### Task 8: End-to-end verification

**Files:**

- No new files. Fixes (if any) touch the files above.

**Interfaces:**

- Consumes: everything from Tasks 1–7.
- Produces: verified, committed landing page.

- [ ] **Step 1: Production build**

Run: `npm run build -w apps/frontend`
Expected: `Application bundle generation complete`, no errors, no budget warnings.

- [ ] **Step 2: Start the dev server and verify routes respond**

Run: `npm run dev:frontend` (background), then:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4200        # expect 200
curl -s http://localhost:4200 | grep -c "app-root"                  # expect 1
```

- [ ] **Step 3: Visual verification (browser or screenshot)**

Check at `http://localhost:4200`:

1. All 7 sections render in order: header, hero, features (4 cards), how-it-works (4 steps), pricing (2 tiers + MOST POPULAR badge visible above the blue card), testimonials (2 cards), CTA, footer.
2. Every CTA and the header "Sign In" navigate to `/login`; "Start Learning" lands on "Sign in to start learning" (role param works).
3. Header nav links scroll to their sections.
4. Narrow the window below 768px: sections stack to one column; hero card fan hides; nav links hide.
5. No emoji anywhere on the page.

Fix anything broken; re-run Step 1 after fixes.

- [ ] **Step 4: Stop the dev server and commit any fixes**

```bash
git add apps/frontend
git commit -m "fix: landing page verification fixes"   # only if fixes were made
```
