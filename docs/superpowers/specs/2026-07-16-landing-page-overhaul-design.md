# Landing Page Overhaul — Design Spec

**Date**: 2026-07-16
**Status**: Approved (full overhaul: structure refactor + missing spec sections + visual polish + copy rework)
**Supersedes**: `2026-07-15-landing-page-design.md` for page structure; the UNO design-system rules there still apply.

## Goal

Bring the implemented landing page up to the originally approved component architecture, add the sections it's missing, polish the visuals, and rewrite the copy to be punchier. Pure frontend — no backend interaction.

## Current state (what this changes)

- `apps/frontend/src/app/app.html` is a bare `<router-outlet>`; landing and login each carry their own inline header, and the landing footer is minimal.
- `pages/landing/landing.html` is one monolithic template.
- Missing vs. the approved spec: Testimonials section, full footer (links + social icons), how-it-works icon circles and connecting line, `cardSlideIn` entry animations.

## Architecture

### Components (all standalone)

| Component | Path | Purpose |
|-----------|------|---------|
| `Header` | `src/app/components/header/` | Shared nav: tricolor DyasCodeIT logo, section links (Features / How It Works / Pricing via fragment navigation), yellow Sign In button → `/login` |
| `Footer` | `src/app/components/footer/` | Shared footer: About / Docs / Support / Terms / Privacy links, GitHub / Twitter / LinkedIn SVG icons, copyright |
| `Landing` | `src/app/pages/landing/` | Thin page component composing the six section components |
| `Hero` | `src/app/components/landing/hero/` | Diagonal 4-color hero, decorative floating cards, headline + subhead, Start Learning (red) / Teach a Class (blue) CTAs |
| `Features` | `src/app/components/landing/features/` | 4 UNO cards (red / yellow / blue / green) |
| `HowItWorks` | `src/app/components/landing/how-it-works/` | 4 step cards with white SVG icon circles and a connecting line on desktop |
| `Pricing` | `src/app/components/landing/pricing/` | Free (white) + Premium (blue, Most Popular badge) cards |
| `Testimonials` | `src/app/components/landing/testimonials/` | Two static cards: Sarah / student (yellow), John / teacher (blue). No carousel |
| `CtaSection` | `src/app/components/landing/cta-section/` | Dark closing band with Student / Teacher login CTAs |

### App shell & routing

- Root `App` template becomes `<app-header /> <router-outlet /> <app-footer />`.
- Login loses its duplicate inline header (its role cards and OAuth panel are unchanged).
- Router config gains `anchorScrolling: 'enabled'` (plus `scrollPositionRestoration: 'enabled'`) so header fragment links scroll to sections from any route.
- Routes unchanged: `/` → Landing, `/login` → Login, `**` → `/`.

### CTA wiring (unchanged)

All CTAs are `routerLink="/login"`; role-specific ones add `?role=student` / `?role=teacher`.

## Visual polish

- Keep the diagonal 4-color hero, but simplify the overlay gradients (less noise), add a gentle float animation to the decorative cards, and show a third decorative card from `md` up.
- Add `cardSlideIn` keyframes + nth-child stagger to `styles.css`; applied to `.uno-card` and step cards.
- Consistent section rhythm: every section uses the same eyebrow (colored uppercase label) + heading pattern.
- `focus-visible` ring styles on all interactive elements; unified hover lift (`-translate-y-0.5` + shadow).
- No emoji anywhere; inline SVG icons only (heroicons-style paths).

## Copy direction

Benefit-led and shorter. Hero headline: "Learn to code. Play to win." Subhead speaks to students and teachers directly instead of listing platform features. Feature cards, step cards, testimonials, pricing bullets, and CTA copy rewritten in the same voice. Draft copy lives in the implementation plan; user can tweak after seeing it rendered.

## Error handling

None required — static page, no data fetching.

## Testing & verification

No test framework chosen yet (CLAUDE.md open decision) — no unit tests. Verification:

1. `npm run build -w apps/frontend` passes.
2. `npm run dev`; visually confirm all sections render at `http://localhost:4200`, header fragment links scroll, CTAs navigate to `/login` with the right `role` param, login page renders correctly under the shared header/footer, and the page is responsive at mobile width.
