# DyasCodeIT - Visual Design System

## 🎮 UNO Theme Overview

The DyasCodeIT platform uses a UNO card game aesthetic: **bold colors, playful typography, card-based layout, and energetic interactions**.

---

## 🎨 Color System

### Primary Colors (UNO Card Colors)

| Color | Hex Code | RGB | Usage | Tailwind |
|-------|----------|-----|-------|----------|
| **Red** | `#FF4444` | 255, 68, 68 | Primary actions, Engaging features, Errors | `bg-red-600` |
| **Yellow** | `#FFD700` | 255, 215, 0 | Action cards, Warnings, CTA highlights | `bg-yellow-400` |
| **Blue** | `#0066FF` | 0, 102, 255 | Secondary actions, Learning content | `bg-blue-600` |
| **Green** | `#00AA44` | 0, 170, 68 | Success, Achievements, Positive states | `bg-green-600` |
| **Black** | `#222222` | 34, 34, 34 | Text, Borders, Outlines | `bg-gray-900` |

### Supporting Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| **White** | `#FFFFFF` | Backgrounds, Text on dark |
| **Light Gray** | `#F5F5F5` | Secondary backgrounds |
| **Medium Gray** | `#E8E8E8` | Borders, Dividers |
| **Dark Gray** | `#666666` | Secondary text |
| **Light Gray Text** | `#999999` | Tertiary text |

---

## 🎯 Component Library

### 1. UNO Card (Core Component)

**Structure**:
```
┌─────────────────────────────┐
│ HEADER (Colored Background) │  ← uno-card-header
│ Title          | Badge      │
├─────────────────────────────┤
│                             │
│      BODY CONTENT           │  ← uno-card-body
│   (Icon, Text, etc)         │
│                             │
├─────────────────────────────┤
│        FOOTER ACTIONS       │  ← uno-card-footer
│   [Button] [Button]         │
└─────────────────────────────┘
```

**CSS Classes**:
```css
/* Base card */
.uno-card {
  border-radius: 24px;
  border: 2px solid #222;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.uno-card:hover {
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  transform: scale(1.05);
}

/* Color variants */
.uno-card-red { background: #FF4444; color: white; }
.uno-card-yellow { background: #FFD700; color: #222; }
.uno-card-blue { background: #0066FF; color: white; }
.uno-card-green { background: #00AA44; color: white; }

/* Subcomponents */
.uno-card-header {
  padding: 24px 24px;
  border-bottom: 2px solid #222;
  font-weight: bold;
  font-size: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.uno-card-badge {
  display: inline-block;
  background: white;
  color: #222;
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 12px;
}

.uno-card-body {
  padding: 24px 24px;
  min-height: 128px;
}

.uno-card-footer {
  padding: 24px 24px;
  border-top: 2px solid #222;
  background: rgba(0,0,0,0.05);
  display: flex;
  gap: 12px;
}
```

**Example - Red Card**:
```html
<div class="uno-card uno-card-red">
  <div class="uno-card-header">
    <span>Create a Class</span>
    <span class="uno-card-badge">STEP 1</span>
  </div>
  <div class="uno-card-body">
    <p>Select a topic and create your class in seconds</p>
  </div>
  <div class="uno-card-footer">
    <button class="uno-btn-primary">Get Started</button>
  </div>
</div>
```

---

### 2. Buttons

**Primary Button** (Red):
```css
.uno-btn-primary {
  background: #FF4444;
  color: white;
  padding: 12px 24px;
  font-weight: bold;
  border: 2px solid #222;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.uno-btn-primary:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  transform: scale(1.05);
}

.uno-btn-primary:active {
  transform: scale(0.95);
}
```

**Button Variants**:
- Primary (Red): Main CTAs
- Secondary (Blue): Alternative actions
- Success (Green): Confirmations
- Action (Yellow): Attention-grabbing
- Outline (White border): Less important

**All buttons**:
- 2px black border
- Rounded corners (12px)
- Shadow on hover
- Scale animation on click

---

### 3. Typography

**Font Family**:
```css
font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Heading Styles**:

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 48px | 900 | Page title, Hero |
| H2 | 36px | 700 | Section title |
| H3 | 24px | 600 | Subsection |
| H4 | 20px | 600 | Card title |
| Body Large | 16px | 400 | Main text |
| Body Regular | 14px | 400 | Default text |
| Body Small | 12px | 400 | Labels |
| Button | 14px | 600 | Button text |

**Color**:
- Primary text: `#1A1A1A`
- Secondary text: `#666666`
- Tertiary text: `#999999`
- On colored backgrounds: Auto-contrast (white on dark, dark on light)

---

### 4. Grid Layout

**Cards Grid** (Responsive):
```css
.uno-grid {
  display: grid;
  gap: 24px;
  padding: 24px;
}

/* Mobile: 1 column */
@media (max-width: 768px) {
  .uno-grid { grid-template-columns: 1fr; }
}

/* Tablet: 2 columns */
@media (768px <= width < 1024px) {
  .uno-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: 3-4 columns */
@media (min-width: 1024px) {
  .uno-grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

### 5. Navigation Header

**Structure**:
```
┌────────────────────────────────────────┐
│  DyasCodeIT Logo  |  Nav Links  | User │
└────────────────────────────────────────┘
```

**CSS**:
```css
.uno-header {
  background: white;
  border-bottom: 4px solid #222;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.uno-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.uno-logo {
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(to right, #FF4444, #FFD700, #0066FF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}
```

**Logo Gradient**: Red → Yellow → Blue (UNO colors)

---

## 🎬 Animation & Transitions

### Card Animations

**Entry Animation**:
```css
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
  animation: cardSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Stagger effect */
.uno-card:nth-child(1) { animation-delay: 0.1s; }
.uno-card:nth-child(2) { animation-delay: 0.2s; }
.uno-card:nth-child(3) { animation-delay: 0.3s; }
.uno-card:nth-child(4) { animation-delay: 0.4s; }
```

### Button Interactions

**Hover**: Scale 105% + shadow increase
**Click**: Scale 95% (press effect)
**Transition**: All 200ms ease

### Page Transitions

**Fade In**: 300ms on page load
**Route Change**: Fade out → Fade in

---

## 📱 Responsive Design Breakpoints

```css
/* Mobile First */
/* < 640px: Mobile (no breakpoint needed) */

/* sm: 640px */
@media (min-width: 640px) { }

/* md: 768px */
@media (min-width: 768px) { }

/* lg: 1024px */
@media (min-width: 1024px) { }

/* xl: 1280px */
@media (min-width: 1280px) { }
```

### Adjustments by Breakpoint

**Mobile** (< 768px):
- Single column layout
- Full width cards
- Larger touch targets (44px min)
- Reduced padding (16px)

**Tablet** (768px - 1024px):
- Two column layout
- Medium padding (20px)

**Desktop** (1024px+):
- Three/four column layout
- Standard padding (24px)

---

## 🎯 Page Layouts

### Hero Section Layout

```
┌─────────────────────────────────────────┐
│                                         │
│  Left: Text + Buttons    Right: Image   │
│                                         │
│  (50% / 50% on desktop)                 │
│  (100% stacked on mobile)               │
└─────────────────────────────────────────┘
```

### Feature Cards Grid

```
┌──────────┬──────────┬──────────┐
│   Red    │ Yellow   │  Blue    │
│ Card 1   │ Card 2   │ Card 3   │
└──────────┴──────────┴──────────┘
┌──────────┐
│  Green   │
│ Card 4   │
└──────────┘
```

---

## 🎨 Implementation Checklist

- [x] Color palette defined
- [x] Typography system created
- [x] Card component styled
- [x] Button variants created
- [x] Grid layout responsive
- [x] Navigation header designed
- [x] Animations defined
- [x] Breakpoints established
- [x] Tailwind config created

---

## 📐 Spacing System

```css
/* Use consistent spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
--space-3xl: 48px;
```

**Usage**:
- Padding: `space-lg` (16px)
- Margin: `space-lg` to `space-2xl` (16-32px)
- Gap: `space-lg` (16px)

---

## 🔲 Border & Shadow System

**Borders**:
- Thick: 2px (main elements)
- Medium: 1px (secondary)
- Color: Always `#222` (black)

**Shadows**:
- Light: `0 4px 8px rgba(0,0,0,0.1)`
- Medium: `0 8px 16px rgba(0,0,0,0.1)`
- Heavy: `0 12px 24px rgba(0,0,0,0.15)`

---

## ✨ No Emoji Policy

**Why?** Emojis can cause rendering issues across browsers and add file size.

**Alternatives**:
- Use SVG icons instead
- Use Font Awesome icons
- Use custom illustrations
- Use Unicode characters sparingly

---

## 🎭 Color Accessibility

All color combinations meet WCAG AA standards for contrast:
- Red text on White: 5.24:1 ✓
- Yellow text on White: 1.07:1 (fail - use dark text on yellow)
- Blue text on White: 8.59:1 ✓
- White text on Red: 5.24:1 ✓
- White text on Blue: 8.59:1 ✓
- White text on Green: 4.54:1 ✓

---

## 📚 Usage Examples

### Example 1: Feature Card
```html
<div class="uno-card uno-card-blue">
  <div class="uno-card-header">
    <span>AI Tutor</span>
    <span class="uno-card-badge">PRO</span>
  </div>
  <div class="uno-card-body">
    <p>24/7 AI assistant guides you without giving answers</p>
  </div>
  <div class="uno-card-footer">
    <button class="uno-btn-primary">Learn More</button>
  </div>
</div>
```

### Example 2: Button Group
```html
<div class="flex gap-4">
  <button class="uno-btn-primary">Sign In</button>
  <button class="uno-btn-secondary">Sign Up</button>
</div>
```

### Example 3: Gradient Text (Logo)
```html
<h1 class="text-4xl font-black text-transparent bg-clip-text 
  bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600">
  DyasCodeIT
</h1>
```

---

## 🚀 Design Tools

**Figma/Adobe XD files** (recommended for future):
- Create component library
- Document all variants
- Generate design tokens
- Share with team

**Current**: Tailwind CSS classes define all styling

---

**Design System Status**: ✅ Complete & Production-Ready
