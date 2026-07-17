# Landing Page Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the monolithic landing page into composed section components, add the missing spec sections (Testimonials, full footer, how-it-works icons/line), polish visuals with entry/float animations, and ship punchier copy.

**Architecture:** Shared `Header`/`Footer` components move into the root `App` shell around `<router-outlet>`. The landing page becomes a thin composition of six standalone section components (`Hero`, `Features`, `HowItWorks`, `Pricing`, `Testimonials`, `CtaSection`). Each task progressively replaces one section of the existing monolith so the page keeps working after every commit.

**Tech Stack:** Angular (standalone components, `templateUrl`), Tailwind CSS v4 (`@theme` in `styles.css`, no config file), no test framework (per CLAUDE.md — verification is `ng build` + visual check).

**Spec:** `docs/superpowers/specs/2026-07-16-landing-page-overhaul-design.md`

## Global Constraints

- **No emoji anywhere in UI** — inline SVG icons only (CLAUDE.md rule).
- UNO palette: red `#FF4444`, yellow `#FFD700`, blue `#0066FF`, green `#00AA44`, black `#222222`; 2px+ black borders, rounded corners, shadow+lift on hover.
- Tailwind v4: utility classes only, no `tailwind.config.js`; theme tokens live in the `@theme` block of `apps/frontend/src/styles.css`.
- All CTAs `routerLink="/login"`; role CTAs add `[queryParams]="{ role: 'student' }"` or `{ role: 'teacher' }"`.
- Component files follow existing convention: class without suffix (`Hero`), `templateUrl` pointing at sibling `.html`, selector `app-*`.
- Build verification command (from repo root): `npm run build -w apps/frontend` — expected to end with "Application bundle generation complete."
- Router `anchorScrolling` is ALREADY enabled in `app.config.ts` — do not touch that file.
- The working tree starts with uncommitted WIP on landing/login — Task 1 commits it as a baseline first.

---

### Task 1: Baseline commit + animation/focus styles

**Files:**

- Modify: `apps/frontend/src/styles.css`

**Interfaces:**

- Produces: CSS classes `.uno-animate-in` (slide-in with nth-child stagger) and `.uno-float` (gentle vertical float honoring a `--card-rot` CSS var), used by Tasks 3–8. Global `:focus-visible` ring on links/buttons.

- [ ] **Step 1: Commit the existing WIP as a baseline**

```bash
git add apps/frontend/src/app/pages/landing apps/frontend/src/app/pages/login apps/frontend/src/styles.css
git commit -m "feat: landing and login first pass (pre-overhaul baseline)"
```

- [ ] **Step 2: Add focus-visible ring to the base layer**

In `apps/frontend/src/styles.css`, inside the existing `@layer base` block, after the `html` rule, add:

```css
a:focus-visible,
button:focus-visible {
	outline: 3px solid var(--color-uno-blue);
	outline-offset: 2px;
}
```

- [ ] **Step 3: Add animation keyframes and helper classes**

Append at the end of `apps/frontend/src/styles.css`:

```css
/* Entry + float animations */
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

@keyframes cardFloat {
	0%,
	100% {
		transform: translateY(0) rotate(var(--card-rot, 0deg));
	}
	50% {
		transform: translateY(-12px) rotate(var(--card-rot, 0deg));
	}
}

@layer components {
	.uno-animate-in {
		animation: cardSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	.uno-animate-in:nth-child(1) {
		animation-delay: 0.1s;
	}
	.uno-animate-in:nth-child(2) {
		animation-delay: 0.2s;
	}
	.uno-animate-in:nth-child(3) {
		animation-delay: 0.3s;
	}
	.uno-animate-in:nth-child(4) {
		animation-delay: 0.4s;
	}

	.uno-float {
		animation: cardFloat 6s ease-in-out infinite;
	}
}

@media (prefers-reduced-motion: reduce) {
	.uno-animate-in,
	.uno-float {
		animation: none;
	}
}
```

- [ ] **Step 4: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: "Application bundle generation complete."

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/styles.css
git commit -m "feat: add entry/float animations and focus-visible ring"
```

---

### Task 2: Shared Header + Footer in the app shell

**Files:**

- Create: `apps/frontend/src/app/components/header/header.ts`
- Create: `apps/frontend/src/app/components/header/header.html`
- Create: `apps/frontend/src/app/components/footer/footer.ts`
- Create: `apps/frontend/src/app/components/footer/footer.html`
- Modify: `apps/frontend/src/app/app.ts`
- Modify: `apps/frontend/src/app/app.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.html` (remove inline header + footer)
- Modify: `apps/frontend/src/app/pages/login/login.html` (remove inline header)

**Interfaces:**

- Produces: `<app-header />` (class `Header`) and `<app-footer />` (class `Footer`), rendered globally by `App`. Header fragment links target section ids `features`, `workflow`, `pricing` which the landing sections keep.

- [ ] **Step 1: Create the Header component**

`apps/frontend/src/app/components/header/header.ts`:

```ts
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
<header
	class="sticky top-0 z-40 border-b-4 border-black bg-white/95 text-gray-950 shadow-lg backdrop-blur">
	<nav
		class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
		<a routerLink="/" class="text-2xl font-black sm:text-3xl">
			<span class="text-red-600">Dyas</span
			><span class="text-blue-600">Code</span
			><span class="text-green-600">IT</span>
		</a>
		<div class="hidden items-center gap-6 text-sm font-black md:flex">
			<a
				routerLink="/"
				fragment="features"
				class="transition hover:text-red-600"
				>Features</a
			>
			<a
				routerLink="/"
				fragment="workflow"
				class="transition hover:text-blue-600"
				>How It Works</a
			>
			<a
				routerLink="/"
				fragment="pricing"
				class="transition hover:text-green-600"
				>Pricing</a
			>
		</div>
		<a
			routerLink="/login"
			class="rounded-xl border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-black shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
			Sign In
		</a>
	</nav>
</header>
```

- [ ] **Step 2: Create the Footer component**

`apps/frontend/src/app/components/footer/footer.ts`:

```ts
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-footer",
	imports: [RouterLink],
	templateUrl: "./footer.html",
})
export class Footer {}
```

`apps/frontend/src/app/components/footer/footer.html`:

```html
<footer
	class="border-t-4 border-black bg-gray-950 px-5 py-12 text-white sm:px-8">
	<div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
		<div>
			<p class="text-2xl font-black">
				<span class="text-red-500">Dyas</span
				><span class="text-blue-400">Code</span
				><span class="text-green-400">IT</span>
			</p>
			<p class="mt-3 max-w-sm text-sm font-semibold leading-6 text-gray-300">
				The classroom coding platform where lessons run, hints teach, and
				certificates prove it.
			</p>
			<div class="mt-5 flex gap-3">
				<a
					href="https://github.com"
					aria-label="GitHub"
					class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-950 transition hover:-translate-y-0.5 hover:bg-gray-800">
					<svg
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true">
						<path
							d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.11.79-.25.79-.56v-2.02c-3.22.7-3.9-1.38-3.9-1.38-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.45-2.3 1.2-3.11-.12-.29-.52-1.47.11-3.07 0 0 .98-.31 3.2 1.19a11.1 11.1 0 0 1 5.82 0c2.22-1.5 3.19-1.19 3.19-1.19.64 1.6.24 2.78.12 3.07.75.81 1.2 1.84 1.2 3.11 0 4.46-2.71 5.43-5.29 5.72.42.36.79 1.08.79 2.18v3.22c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z" />
					</svg>
				</a>
				<a
					href="https://twitter.com"
					aria-label="Twitter"
					class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-950 transition hover:-translate-y-0.5 hover:bg-gray-800">
					<svg
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true">
						<path
							d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
					</svg>
				</a>
				<a
					href="https://linkedin.com"
					aria-label="LinkedIn"
					class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-950 transition hover:-translate-y-0.5 hover:bg-gray-800">
					<svg
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true">
						<path
							d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
						<rect width="4" height="12" x="2" y="9" />
						<circle cx="4" cy="4" r="2" />
					</svg>
				</a>
			</div>
		</div>
		<nav aria-label="Platform">
			<p class="text-sm font-black uppercase text-yellow-400">Platform</p>
			<ul class="mt-4 space-y-2 text-sm font-bold text-gray-300">
				<li>
					<a
						routerLink="/"
						fragment="features"
						class="transition hover:text-white"
						>Features</a
					>
				</li>
				<li>
					<a
						routerLink="/"
						fragment="workflow"
						class="transition hover:text-white"
						>How It Works</a
					>
				</li>
				<li>
					<a
						routerLink="/"
						fragment="pricing"
						class="transition hover:text-white"
						>Pricing</a
					>
				</li>
				<li>
					<a routerLink="/login" class="transition hover:text-white">Sign In</a>
				</li>
			</ul>
		</nav>
		<nav aria-label="Company">
			<p class="text-sm font-black uppercase text-yellow-400">Company</p>
			<ul class="mt-4 space-y-2 text-sm font-bold text-gray-300">
				<li><a href="#" class="transition hover:text-white">About</a></li>
				<li><a href="#" class="transition hover:text-white">Docs</a></li>
				<li><a href="#" class="transition hover:text-white">Support</a></li>
				<li><a href="#" class="transition hover:text-white">Terms</a></li>
				<li><a href="#" class="transition hover:text-white">Privacy</a></li>
			</ul>
		</nav>
	</div>
	<div
		class="mx-auto mt-10 max-w-7xl border-t-2 border-gray-800 pt-6 text-sm font-semibold text-gray-400">
		&copy; 2026 DyasCodeIT. All rights reserved.
	</div>
</footer>
```

- [ ] **Step 3: Render Header/Footer from the App shell**

Replace `apps/frontend/src/app/app.ts` with:

```ts
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

Replace `apps/frontend/src/app/app.html` with:

```html
<app-header />
<router-outlet />
<app-footer />
```

- [ ] **Step 4: Remove the now-duplicate inline header and footer from landing**

In `apps/frontend/src/app/pages/landing/landing.html`:

1. Delete the entire `<header class="relative z-10 border-b-4 ...">…</header>` block (currently lines 47–65).
2. In the hero content wrapper div directly below it, change `min-h-[calc(100vh-116px)]` to `min-h-[calc(100vh-73px)]` (the shared sticky header is ~73px tall).
3. Delete the entire `<footer class="border-t-4 border-black bg-white ...">…</footer>` block at the bottom of the file (the shared footer replaces it).

- [ ] **Step 5: Remove the inline header from login**

In `apps/frontend/src/app/pages/login/login.html`:

1. Delete the entire `<header class="relative z-10 border-b-4 ...">…</header>` block (currently lines 18–27), including its "Back to Home" link (the shared header's logo covers navigation home).
2. In the grid wrapper below it, change `min-h-[calc(100vh-76px)]` to `min-h-[calc(100vh-73px)]`.

- [ ] **Step 6: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: "Application bundle generation complete."

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/app
git commit -m "feat: shared header and footer components in app shell"
```

---

### Task 3: Hero section component

**Files:**

- Create: `apps/frontend/src/app/components/landing/hero/hero.ts`
- Create: `apps/frontend/src/app/components/landing/hero/hero.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`
- Modify: `apps/frontend/src/app/pages/landing/landing.html` (replace hero section with `<app-hero />`)

**Interfaces:**

- Consumes: `.uno-float` from Task 1.
- Produces: `<app-hero />` (class `Hero`).

- [ ] **Step 1: Create the Hero component**

`apps/frontend/src/app/components/landing/hero/hero.ts`:

```ts
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-hero",
	imports: [RouterLink],
	templateUrl: "./hero.html",
})
export class Hero {}
```

`apps/frontend/src/app/components/landing/hero/hero.html`:

```html
<section
	class="relative overflow-hidden border-b-4 border-black bg-gray-950 text-white">
	<div class="absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 bg-[linear-gradient(110deg,#ff4444_0%,#ff4444_23%,#ffd700_23%,#ffd700_45%,#0066ff_45%,#0066ff_72%,#00aa44_72%,#00aa44_100%)]"></div>
		<div
			class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.18),rgba(0,0,0,0.55))]"></div>

		<div
			class="uno-float select-none absolute left-[6%] top-[16%] hidden w-72 rounded-2xl border-4 border-black bg-white text-gray-950 shadow-2xl lg:block"
			style="--card-rot: -7deg">
			<div
				class="rounded-t-2xl border-b-4 border-black bg-gray-100 px-5 py-3 font-black">
				Lesson 1.1
			</div>
			<pre
				class="overflow-hidden p-5 text-sm font-bold leading-7"><code>name = "Dyas"
for skill in skills:
    print(skill)</code></pre>
		</div>

		<div
			class="uno-float select-none absolute right-[7%] top-[14%] hidden w-80 rounded-2xl border-4 border-black bg-gray-950 text-white shadow-2xl md:block"
			style="--card-rot: 6deg; animation-delay: 1.5s">
			<div
				class="flex items-center justify-between rounded-t-2xl border-b-4 border-black bg-blue-600 px-5 py-3 font-black">
				<span>Code Runner</span>
				<span class="rounded-full bg-white px-3 py-1 text-xs text-gray-950"
					>RUN</span
				>
			</div>
			<pre
				class="overflow-hidden p-5 text-sm leading-7 text-green-200"><code>&gt; python variables.py
Variables saved
Score: 100%</code></pre>
		</div>

		<div
			class="uno-float select-none absolute bottom-[10%] right-[16%] hidden w-72 rounded-2xl border-4 border-black bg-yellow-400 text-gray-950 shadow-2xl md:block"
			style="--card-rot: -4deg; animation-delay: 3s">
			<div class="rounded-t-2xl border-b-4 border-black px-5 py-3 font-black">
				Dyas Hint
			</div>
			<p class="p-5 text-sm font-bold leading-6">
				What condition would prove your loop stops at the right value?
			</p>
		</div>
	</div>

	<div
		class="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-5 py-14 sm:px-8 lg:py-20">
		<div class="max-w-4xl">
			<p
				class="mb-6 inline-flex rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black text-gray-950 shadow-md">
				Classroom coding with an UNO twist
			</p>
			<h1 class="text-5xl font-black leading-none sm:text-7xl lg:text-8xl">
				Learn to code.<br />Play to win.
			</h1>
			<p class="mt-6 max-w-2xl text-lg font-semibold leading-8 sm:text-xl">
				Runnable lessons, an AI tutor that makes you think, and certificates you
				can prove. DyasCodeIT turns coding class into a game everyone wants to
				play.
			</p>
			<div class="mt-10 flex flex-col gap-4 sm:flex-row">
				<a
					routerLink="/login"
					[queryParams]="{ role: 'student' }"
					class="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border-2 border-black bg-red-600 px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95">
					<svg
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						aria-hidden="true">
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
						<path
							d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
					</svg>
					Start Learning
				</a>
				<a
					routerLink="/login"
					[queryParams]="{ role: 'teacher' }"
					class="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border-2 border-black bg-blue-600 px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95">
					<svg
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						aria-hidden="true">
						<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
						<path d="M16 3.13a4 4 0 0 1 0 7.75" />
					</svg>
					Teach a Class
				</a>
			</div>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Wire Hero into the landing page**

In `apps/frontend/src/app/pages/landing/landing.ts`, import and register `Hero`:

```ts
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

import { Hero } from "../../components/landing/hero/hero";

@Component({
	selector: "app-landing",
	imports: [RouterLink, Hero],
	templateUrl: "./landing.html",
})
export class Landing {}
```

In `apps/frontend/src/app/pages/landing/landing.html`, delete the entire first `<section class="relative min-h-[calc(100vh-32px)] ...">…</section>` block (everything from the opening section tag through its closing tag, i.e. the hero backgrounds, decorative cards, and hero content) and replace it with:

```html
<app-hero />
```

- [ ] **Step 3: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: "Application bundle generation complete."

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app
git commit -m "feat: extract hero into component with new copy and float animation"
```

---

### Task 4: Features section component

**Files:**

- Create: `apps/frontend/src/app/components/landing/features/features.ts`
- Create: `apps/frontend/src/app/components/landing/features/features.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`
- Modify: `apps/frontend/src/app/pages/landing/landing.html` (replace `#features` section with `<app-features />`)

**Interfaces:**

- Consumes: `.uno-card`, `.uno-card-{red,yellow,blue,green}`, `.uno-card-header`, `.uno-card-badge`, `.uno-card-body` from `styles.css`; `.uno-animate-in` from Task 1.
- Produces: `<app-features />` (class `Features`). Keeps section id `features` for header fragment links.

- [ ] **Step 1: Create the Features component**

`apps/frontend/src/app/components/landing/features/features.ts`:

```ts
import { Component } from "@angular/core";

@Component({
	selector: "app-features",
	templateUrl: "./features.html",
})
export class Features {}
```

`apps/frontend/src/app/components/landing/features/features.html`:

```html
<section id="features" class="bg-gray-50 px-5 py-16 sm:px-8 lg:py-8">
	<div class="mx-auto max-w-7xl">
		<div class="mb-12 max-w-3xl">
			<p class="text-sm font-black uppercase text-red-600">Why DyasCodeIT</p>
			<h2 class="mt-2 text-4xl font-black leading-tight sm:text-5xl">
				Built like a game. Serious about code.
			</h2>
		</div>
		<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
			<article class="uno-card uno-card-red uno-animate-in">
				<div class="uno-card-header">
					<span>Interactive Lessons</span
					><span class="uno-card-badge">Code</span>
				</div>
				<div class="uno-card-body">
					<svg
						class="mb-4 h-8 w-8"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						aria-hidden="true">
						<path d="m16 18 6-6-6-6" />
						<path d="M8 6l-6 6 6 6" />
					</svg>
					<p class="text-lg font-semibold">
						Every lesson runs. Edit real code, hit run, and see results
						instantly — no setup required.
					</p>
				</div>
			</article>
			<article class="uno-card uno-card-yellow uno-animate-in">
				<div class="uno-card-header">
					<span>Dyas AI Tutor</span><span class="uno-card-badge">Hint</span>
				</div>
				<div class="uno-card-body">
					<svg
						class="mb-4 h-8 w-8"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						aria-hidden="true">
						<path d="M9 18h6" />
						<path d="M10 22h4" />
						<path
							d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
					</svg>
					<p class="text-lg font-semibold text-gray-950">
						Stuck? Dyas asks the question that gets you unstuck — so the
						breakthrough is always yours.
					</p>
				</div>
			</article>
			<article class="uno-card uno-card-blue uno-animate-in">
				<div class="uno-card-header">
					<span>Teacher Control</span><span class="uno-card-badge">Class</span>
				</div>
				<div class="uno-card-body">
					<svg
						class="mb-4 h-8 w-8"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						aria-hidden="true">
						<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
						<path d="M16 3.13a4 4 0 0 1 0 7.75" />
					</svg>
					<p class="text-lg font-semibold">
						Spin up a class from ready-made curriculum, share a six-character
						code, and watch progress live.
					</p>
				</div>
			</article>
			<article class="uno-card uno-card-green uno-animate-in">
				<div class="uno-card-header">
					<span>Certificates</span><span class="uno-card-badge">QR</span>
				</div>
				<div class="uno-card-body">
					<svg
						class="mb-4 h-8 w-8"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						aria-hidden="true">
						<circle cx="12" cy="8" r="6" />
						<path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
					</svg>
					<p class="text-lg font-semibold">
						Finish the course, pass the final, and earn a certificate anyone can
						verify with one scan.
					</p>
				</div>
			</article>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Wire Features into the landing page**

In `apps/frontend/src/app/pages/landing/landing.ts` add the import and registration (keeping `Hero`):

```ts
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

import { Hero } from "../../components/landing/hero/hero";
import { Features } from "../../components/landing/features/features";

@Component({
	selector: "app-landing",
	imports: [RouterLink, Hero, Features],
	templateUrl: "./landing.html",
})
export class Landing {}
```

In `apps/frontend/src/app/pages/landing/landing.html`, delete the entire `<section id="features" ...>…</section>` block and replace it with:

```html
<app-features />
```

- [ ] **Step 3: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: "Application bundle generation complete."

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app
git commit -m "feat: extract features section with icons, stagger animation, new copy"
```

---

### Task 5: How-It-Works section component

**Files:**

- Create: `apps/frontend/src/app/components/landing/how-it-works/how-it-works.ts`
- Create: `apps/frontend/src/app/components/landing/how-it-works/how-it-works.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`
- Modify: `apps/frontend/src/app/pages/landing/landing.html` (replace `#workflow` section with `<app-how-it-works />`)

**Interfaces:**

- Consumes: `.uno-animate-in` from Task 1.
- Produces: `<app-how-it-works />` (class `HowItWorks`). Keeps section id `workflow`.

- [ ] **Step 1: Create the HowItWorks component**

`apps/frontend/src/app/components/landing/how-it-works/how-it-works.ts`:

```ts
import { Component } from "@angular/core";

@Component({
	selector: "app-how-it-works",
	templateUrl: "./how-it-works.html",
})
export class HowItWorks {}
```

`apps/frontend/src/app/components/landing/how-it-works/how-it-works.html`:

```html
<section id="workflow" class="bg-white px-5 py-16 sm:px-8 lg:py-8">
	<div class="mx-auto max-w-7xl">
		<div class="mb-12 text-center">
			<p class="text-sm font-black uppercase text-blue-600">How It Works</p>
			<h2 class="mt-2 text-4xl font-black leading-tight sm:text-5xl">
				From zero to class in four cards.
			</h2>
		</div>
		<div class="relative">
			<div
				class="absolute left-[12%] right-[12%] top-14 hidden border-t-4 border-dashed border-black lg:block"
				aria-hidden="true"></div>
			<div class="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<div
					class="uno-animate-in rounded-2xl border-4 border-black bg-red-600 p-6 text-white shadow-lg">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-white text-red-600">
						<svg
							class="h-8 w-8"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							aria-hidden="true">
							<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
							<path
								d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
						</svg>
					</div>
					<p class="mt-5 font-black">Step 1</p>
					<h3 class="mt-1 text-2xl font-black">Curriculum goes live</h3>
					<p class="mt-3 font-semibold">
						Admins publish topics, chapters, and runnable lessons once — every
						teacher can use them.
					</p>
				</div>
				<div
					class="uno-animate-in rounded-2xl border-4 border-black bg-yellow-400 p-6 text-gray-950 shadow-lg">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-white text-gray-950">
						<svg
							class="h-8 w-8"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							aria-hidden="true">
							<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
							<path d="m16 6-4-4-4 4" />
							<path d="M12 2v13" />
						</svg>
					</div>
					<p class="mt-5 font-black">Step 2</p>
					<h3 class="mt-1 text-2xl font-black">Teachers open a class</h3>
					<p class="mt-3 font-semibold">
						Pick a topic, name your class, and share the code it generates.
					</p>
				</div>
				<div
					class="uno-animate-in rounded-2xl border-4 border-black bg-blue-600 p-6 text-white shadow-lg">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-white text-blue-600">
						<svg
							class="h-8 w-8"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							aria-hidden="true">
							<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
					</div>
					<p class="mt-5 font-black">Step 3</p>
					<h3 class="mt-1 text-2xl font-black">Students jump in</h3>
					<p class="mt-3 font-semibold">
						Enter the six-character code and start coding in minutes — no
						installs.
					</p>
				</div>
				<div
					class="uno-animate-in rounded-2xl border-4 border-black bg-green-600 p-6 text-white shadow-lg">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-white text-green-600">
						<svg
							class="h-8 w-8"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							aria-hidden="true">
							<circle cx="12" cy="8" r="6" />
							<path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
						</svg>
					</div>
					<p class="mt-5 font-black">Step 4</p>
					<h3 class="mt-1 text-2xl font-black">Progress becomes proof</h3>
					<p class="mt-3 font-semibold">
						Auto-graded activities, teacher feedback, and verified certificates.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Wire HowItWorks into the landing page**

In `apps/frontend/src/app/pages/landing/landing.ts` add `HowItWorks` (keeping earlier imports):

```ts
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

import { Hero } from "../../components/landing/hero/hero";
import { Features } from "../../components/landing/features/features";
import { HowItWorks } from "../../components/landing/how-it-works/how-it-works";

@Component({
	selector: "app-landing",
	imports: [RouterLink, Hero, Features, HowItWorks],
	templateUrl: "./landing.html",
})
export class Landing {}
```

In `apps/frontend/src/app/pages/landing/landing.html`, delete the entire `<section id="workflow" ...>…</section>` block and replace it with:

```html
<app-how-it-works />
```

- [ ] **Step 3: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: "Application bundle generation complete."

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app
git commit -m "feat: extract how-it-works section with icon circles and connecting line"
```

---

### Task 6: Pricing section component

**Files:**

- Create: `apps/frontend/src/app/components/landing/pricing/pricing.ts`
- Create: `apps/frontend/src/app/components/landing/pricing/pricing.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`
- Modify: `apps/frontend/src/app/pages/landing/landing.html` (replace `#pricing` section with `<app-pricing />`)

**Interfaces:**

- Consumes: `.uno-animate-in` from Task 1.
- Produces: `<app-pricing />` (class `Pricing`). Keeps section id `pricing`.

- [ ] **Step 1: Create the Pricing component**

`apps/frontend/src/app/components/landing/pricing/pricing.ts`:

```ts
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-pricing",
	imports: [RouterLink],
	templateUrl: "./pricing.html",
})
export class Pricing {}
```

`apps/frontend/src/app/components/landing/pricing/pricing.html`:

```html
<section id="pricing" class="bg-gray-50 px-5 py-16 sm:px-8 lg:py-8">
	<div class="mx-auto max-w-5xl">
		<div class="mb-12 text-center">
			<p class="text-sm font-black uppercase text-green-600">Teacher Pricing</p>
			<h2 class="mt-2 text-4xl font-black leading-tight sm:text-5xl">
				Start free. Upgrade when your classes outgrow you.
			</h2>
		</div>
		<div class="grid gap-6 md:grid-cols-2">
			<article
				class="uno-animate-in rounded-2xl border-4 border-black bg-white shadow-lg">
				<div
					class="rounded-t-2xl border-b-4 border-black bg-gray-100 px-6 py-5">
					<h3 class="text-2xl font-black">Free</h3>
				</div>
				<div class="p-6">
					<p class="text-5xl font-black">$0</p>
					<ul class="mt-6 space-y-3 font-bold">
						<li class="flex items-start gap-3">
							<svg
								class="mt-1 h-5 w-5 shrink-0 text-green-600"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							2 active classes
						</li>
						<li class="flex items-start gap-3">
							<svg
								class="mt-1 h-5 w-5 shrink-0 text-green-600"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							50 students per class
						</li>
						<li class="flex items-start gap-3">
							<svg
								class="mt-1 h-5 w-5 shrink-0 text-green-600"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Full curriculum library
						</li>
						<li class="flex items-start gap-3">
							<svg
								class="mt-1 h-5 w-5 shrink-0 text-green-600"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Dyas AI tutor included — free means free
						</li>
					</ul>
					<a
						routerLink="/login"
						[queryParams]="{ role: 'teacher' }"
						class="mt-8 inline-flex w-full justify-center rounded-xl border-2 border-black bg-red-600 px-5 py-3 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
						>Get Started Free</a
					>
				</div>
			</article>
			<article
				class="uno-animate-in relative rounded-2xl border-4 border-black bg-blue-600 text-white shadow-xl">
				<div
					class="absolute right-6 top-6 rounded-full border-2 border-black bg-yellow-400 px-3 py-1 text-xs font-black text-gray-950">
					Most Popular
				</div>
				<div class="border-b-4 border-black px-6 py-5">
					<h3 class="text-2xl font-black">Premium</h3>
				</div>
				<div class="p-6">
					<p class="text-5xl font-black">
						$9.99<span class="text-lg">/mo</span>
					</p>
					<ul class="mt-6 space-y-3 font-bold">
						<li class="flex items-start gap-3">
							<svg
								class="mt-1 h-5 w-5 shrink-0 text-yellow-300"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Unlimited classes
						</li>
						<li class="flex items-start gap-3">
							<svg
								class="mt-1 h-5 w-5 shrink-0 text-yellow-300"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Advanced analytics dashboards
						</li>
						<li class="flex items-start gap-3">
							<svg
								class="mt-1 h-5 w-5 shrink-0 text-yellow-300"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Priority support
						</li>
						<li class="flex items-start gap-3">
							<svg
								class="mt-1 h-5 w-5 shrink-0 text-yellow-300"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Bulk exports and reports
						</li>
					</ul>
					<a
						routerLink="/login"
						[queryParams]="{ role: 'teacher' }"
						class="mt-8 inline-flex w-full justify-center rounded-xl border-2 border-black bg-white px-5 py-3 font-black text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
						>Start Premium</a
					>
				</div>
			</article>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Wire Pricing into the landing page**

In `apps/frontend/src/app/pages/landing/landing.ts` add `Pricing` (keeping earlier imports):

```ts
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

import { Hero } from "../../components/landing/hero/hero";
import { Features } from "../../components/landing/features/features";
import { HowItWorks } from "../../components/landing/how-it-works/how-it-works";
import { Pricing } from "../../components/landing/pricing/pricing";

@Component({
	selector: "app-landing",
	imports: [RouterLink, Hero, Features, HowItWorks, Pricing],
	templateUrl: "./landing.html",
})
export class Landing {}
```

In `apps/frontend/src/app/pages/landing/landing.html`, delete the entire `<section id="pricing" ...>…</section>` block and replace it with:

```html
<app-pricing />
```

- [ ] **Step 3: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: "Application bundle generation complete."

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app
git commit -m "feat: extract pricing section with SVG checkmarks and new copy"
```

---

### Task 7: Testimonials section component (new)

**Files:**

- Create: `apps/frontend/src/app/components/landing/testimonials/testimonials.ts`
- Create: `apps/frontend/src/app/components/landing/testimonials/testimonials.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts`
- Modify: `apps/frontend/src/app/pages/landing/landing.html` (insert `<app-testimonials />` after `<app-pricing />`)

**Interfaces:**

- Consumes: `.uno-animate-in` from Task 1.
- Produces: `<app-testimonials />` (class `Testimonials`).

- [ ] **Step 1: Create the Testimonials component**

`apps/frontend/src/app/components/landing/testimonials/testimonials.ts`:

```ts
import { Component } from "@angular/core";

@Component({
	selector: "app-testimonials",
	templateUrl: "./testimonials.html",
})
export class Testimonials {}
```

`apps/frontend/src/app/components/landing/testimonials/testimonials.html`:

```html
<section id="testimonials" class="bg-white px-5 py-16 sm:px-8 lg:py-8">
	<div class="mx-auto max-w-5xl">
		<div class="mb-12 text-center">
			<p class="text-sm font-black uppercase text-yellow-500">
				Word on the Street
			</p>
			<h2 class="mt-2 text-4xl font-black leading-tight sm:text-5xl">
				Loved by students and teachers.
			</h2>
		</div>
		<div class="grid gap-6 md:grid-cols-2">
			<figure
				class="uno-animate-in rounded-2xl border-4 border-black bg-yellow-400 p-8 text-gray-950 shadow-lg">
				<svg
					class="h-8 w-8"
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true">
					<path
						d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
					<path
						d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
				</svg>
				<blockquote class="mt-4 text-lg font-bold leading-8">
					I actually look forward to homework now. Dyas never just gives me the
					answer — it makes me feel like I figured it out myself.
				</blockquote>
				<figcaption class="mt-6 flex items-center gap-3">
					<span
						class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white font-black"
						aria-hidden="true"
						>S</span
					>
					<span>
						<span class="block font-black">Sarah</span>
						<span class="block text-sm font-bold">Student</span>
					</span>
				</figcaption>
			</figure>
			<figure
				class="uno-animate-in rounded-2xl border-4 border-black bg-blue-600 p-8 text-white shadow-lg">
				<svg
					class="h-8 w-8"
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true">
					<path
						d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
					<path
						d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
				</svg>
				<blockquote class="mt-4 text-lg font-bold leading-8">
					I set up my first class in five minutes. The dashboard shows me who's
					stuck before they even raise a hand.
				</blockquote>
				<figcaption class="mt-6 flex items-center gap-3">
					<span
						class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white font-black text-blue-700"
						aria-hidden="true"
						>J</span
					>
					<span>
						<span class="block font-black">John</span>
						<span class="block text-sm font-bold">Teacher</span>
					</span>
				</figcaption>
			</figure>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Wire Testimonials into the landing page**

In `apps/frontend/src/app/pages/landing/landing.ts` add `Testimonials` (keeping earlier imports):

```ts
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

import { Hero } from "../../components/landing/hero/hero";
import { Features } from "../../components/landing/features/features";
import { HowItWorks } from "../../components/landing/how-it-works/how-it-works";
import { Pricing } from "../../components/landing/pricing/pricing";
import { Testimonials } from "../../components/landing/testimonials/testimonials";

@Component({
	selector: "app-landing",
	imports: [RouterLink, Hero, Features, HowItWorks, Pricing, Testimonials],
	templateUrl: "./landing.html",
})
export class Landing {}
```

In `apps/frontend/src/app/pages/landing/landing.html`, directly after the `<app-pricing />` line, insert:

```html
<app-testimonials />
```

- [ ] **Step 3: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: "Application bundle generation complete."

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app
git commit -m "feat: add testimonials section (Sarah/student, John/teacher)"
```

---

### Task 8: CTA section component + final landing composition

**Files:**

- Create: `apps/frontend/src/app/components/landing/cta-section/cta-section.ts`
- Create: `apps/frontend/src/app/components/landing/cta-section/cta-section.html`
- Modify: `apps/frontend/src/app/pages/landing/landing.ts` (final form — drops `RouterLink`)
- Modify: `apps/frontend/src/app/pages/landing/landing.html` (final form — pure composition)

**Interfaces:**

- Produces: `<app-cta-section />` (class `CtaSection`). Landing page reaches its final composed form.

- [ ] **Step 1: Create the CtaSection component**

`apps/frontend/src/app/components/landing/cta-section/cta-section.ts`:

```ts
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
<section class="bg-gray-950 px-5 py-16 text-white sm:px-8 lg:py-20">
	<div
		class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
		<div>
			<p class="text-sm font-black uppercase text-yellow-400">Ready to play?</p>
			<h2 class="mt-2 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
				Your next class starts with one card.
			</h2>
		</div>
		<div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
			<a
				routerLink="/login"
				[queryParams]="{ role: 'student' }"
				class="inline-flex justify-center rounded-xl border-2 border-white bg-red-600 px-6 py-3 font-black shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
				>I'm a Student</a
			>
			<a
				routerLink="/login"
				[queryParams]="{ role: 'teacher' }"
				class="inline-flex justify-center rounded-xl border-2 border-white bg-blue-600 px-6 py-3 font-black shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
				>I'm a Teacher</a
			>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Finalize the landing page as pure composition**

Replace `apps/frontend/src/app/pages/landing/landing.ts` with:

```ts
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

Replace `apps/frontend/src/app/pages/landing/landing.html` with (the old dark CTA `<section class="bg-gray-950 ...">` block is deleted along with everything else):

```html
<main class="min-h-screen bg-white text-gray-950">
	<app-hero />
	<app-features />
	<app-how-it-works />
	<app-pricing />
	<app-testimonials />
	<app-cta-section />
</main>
```

- [ ] **Step 3: Build to verify**

Run: `npm run build -w apps/frontend`
Expected: "Application bundle generation complete." with no unused-import warnings.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app
git commit -m "feat: extract CTA section; landing page is now pure composition"
```

---

### Task 9: Full visual verification

**Files:**

- No new files — verification only. Fix-ups discovered here are amended into small follow-up commits.

**Interfaces:**

- Consumes: everything from Tasks 1–8.

- [ ] **Step 1: Run the dev server**

Run (background): `npm run dev -w apps/frontend` (or `npx ng serve` from `apps/frontend`)
Expected: serves at `http://localhost:4200`.

- [ ] **Step 2: Verify the landing page**

Checklist at `http://localhost:4200`:

1. Shared sticky header with tricolor logo, three nav links, yellow Sign In button.
2. Hero: diagonal 4-color background, "Learn to code. Play to win." headline, three floating decorative cards on desktop width, both CTAs navigate to `/login?role=student` / `/login?role=teacher`.
3. Features: 4 UNO cards with SVG icons, staggered slide-in on load.
4. How It Works: 4 step cards with white icon circles; dashed connecting line visible at ≥1024px width only.
5. Pricing: Free + Premium cards with SVG checkmarks; both CTAs navigate with `role=teacher`.
6. Testimonials: yellow Sarah/Student and blue John/Teacher cards with quote icons.
7. CTA band: "Your next class starts with one card." with both role buttons.
8. Footer: brand blurb, social icons, Platform + Company link columns, copyright.
9. Header links "Features" / "How It Works" / "Pricing" scroll to their sections — also from `/login`.
10. No emoji anywhere on the page.

- [ ] **Step 3: Verify the login page**

At `http://localhost:4200/login`:

1. Shared header shown (no duplicate inline header, no "Back to Home" button).
2. Role cards + OAuth panel render as before; `?role=teacher` highlights the teacher card.
3. Shared footer shown below the login section.

- [ ] **Step 4: Verify responsive behavior**

In browser devtools at 375px width: single-column layouts, no horizontal scroll, hero decorative cards hidden, touch targets ≥44px.

- [ ] **Step 5: Verify reduced motion**

In devtools, emulate `prefers-reduced-motion: reduce`: no slide-in or float animations.

- [ ] **Step 6: Final commit (if fix-ups were needed)**

```bash
git add apps/frontend/src
git commit -m "fix: visual polish fix-ups from landing verification pass"
```
