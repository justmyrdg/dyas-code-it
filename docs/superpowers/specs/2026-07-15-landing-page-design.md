# Landing Page — Design Spec

**Date**: 2026-07-15
**Status**: Approved (Option B — composed components)
**Source content spec**: `docs/DyasCodeIT_LANDING_PAGE.md` (section content, copy, and Tailwind structures come from there; this doc defines the code architecture and deviations)

## Goal

Build the DyasCodeIT public landing page in the Angular frontend (`apps/frontend`), using the UNO design system classes already defined in `src/styles.css`. No backend interaction — pure frontend.

## Architecture

### Components (all standalone, Angular 21)

| Component | Path | Purpose |
|-----------|------|---------|
| `Header` | `src/app/components/header/` | App-level nav: gradient DyasCodeIT logo, section nav links, "Sign In" outline button → `/login` |
| `Footer` | `src/app/components/footer/` | App-level footer: About/Docs/Blog/Status/Support/Terms/Privacy links, GitHub/Twitter/LinkedIn SVG icons, copyright |
| `Landing` | `src/app/pages/landing/` | Page component; assembles the six section components |
| `Hero` | `src/app/components/landing/hero/` | Headline with gradient span, subheadline, Start Learning (red) + Teach a Class (blue) CTAs, decorative CSS card fan |
| `Features` | `src/app/components/landing/features/` | "What Makes DyasCodeIT Special" — 4 UNO cards (red/yellow/blue/green) in `.uno-grid` |
| `HowItWorks` | `src/app/components/landing/how-it-works/` | "Get Started in 4 Easy Steps" — 4 step cards with white icon circles, connecting line on desktop |
| `Pricing` | `src/app/components/landing/pricing/` | Free (white/black border) + Premium (blue, MOST POPULAR badge) cards |
| `Testimonials` | `src/app/components/landing/testimonials/` | Static two cards: Sarah/student (yellow), John/teacher (blue). No carousel — only 2 testimonials (decision: YAGNI; upgrade later if more are added) |
| `CtaSection` | `src/app/components/landing/cta-section/` | "Ready to Code?" — "I'm a Student" (red) + "I'm a Teacher" (blue) buttons |
| `Login` | `src/app/pages/login/` | Placeholder: single UNO card, "Sign in — coming soon" message, reads `role` query param. Replaced when OAuth is built |

### Routing

- `/` → `Landing`
- `/login` → `Login` (placeholder)
- Root `App` template: `<app-header>` + `<router-outlet>` + `<app-footer>`

### CTA wiring

All CTAs are `routerLink="/login"`. Role-specific CTAs add a query param:
- "Start Learning", "I'm a Student" → `/login?role=student`
- "Teach a Class", "I'm a Teacher" → `/login?role=teacher`
- "Get Started Free", "Start Free Trial", header "Sign In" → `/login`

Header nav links (Features, How It Works, Pricing) scroll to sections via fragment navigation (`routerLink="/"` + `fragment`, with `anchorScrolling: 'enabled'` in the router config).

## Visual rules & deviations from the content spec

- **No emoji anywhere** (CLAUDE.md rule). Inline SVG icons (heroicons-style paths): graduation cap, lightbulb, trophy, people, plus, share, book, certificate, checkmark. The content spec's literal `✓` characters in pricing lists become SVG checkmarks.
- **Tailwind v4 fixes**: the content spec predates v4. `text-opacity-80` → `text-white/80`; no `tailwind.config.js` (theme tokens already live in the `@theme` block in `styles.css`).
- **Hero visual**: decorative fan of 4 rotated UNO-colored CSS cards with a subtle float animation. Pure CSS, no images.
- **Animations**: add the spec's `cardSlideIn` keyframes + nth-child stagger to `styles.css`. Hover/active effects already exist in `.uno-card`/`.uno-btn-*`.
- **Responsive**: mobile-first; grids collapse to 1 column < 768px, 2 columns on tablet, 3–4 on desktop; buttons ≥ 44px touch height.

## Error handling

None required — static page, no data fetching. A wildcard route (`**`) redirects unknown URLs to `/`.

## Testing & verification

No test framework is chosen yet (CLAUDE.md open decision) — no unit tests in this task. Verification:
1. `npm run build -w apps/frontend` passes.
2. `npm run dev`, visually confirm all 7 sections render at `http://localhost:4200`, CTAs navigate to `/login`, page is responsive at mobile width.
