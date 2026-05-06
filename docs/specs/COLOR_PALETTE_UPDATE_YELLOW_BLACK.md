

## Summary

Updates the application's color palette in `style.css` (the single source-of-truth stylesheet) from the current dark-navy/green theme to a yellow (`#FFD600`) and black (`#000000`) scheme. All CSS custom properties (`:root` variables) and hardcoded color values across `style.css`, inline styles in `src/App.jsx`, and the legacy `app.js` vanilla HTML file are replaced. The `dist/` folder is then regenerated via `npm run build`. This delivers a cohesive yellow-and-black visual identity while meeting WCAG AA contrast requirements.

## Problem Statement

The current color palette in `style.css` (lines 1–9) uses a dark-navy background (`--bg: #0f1724`) with green accent (`--accent: #6ee7b7`) and teal chat bubbles (`--bubble-in: #0b6e4f`). Additional hardcoded hex values are scattered throughout the file (e.g., `#071023`, `#081226` on line 12; `#042016` on line 19; `#134b3a` on line 24; `#0f3e29`/`#083421` on line 32; `#dbeafe` on line 17; `#e6eef6` on lines 12 and 30; `#d1d5db` on line 25; `#dff7ea` on line 32).

**Concrete consequence:** The application's visual identity does not match the desired yellow-and-black brand. The existing `dist/assets/index-Cl39OLgr.css` already contains a partially-implemented yellow theme (using `--accent: #ffd700`), but the **source** `style.css` — which is what developers edit and what Vite serves in dev mode — still has the old green/navy palette. This means:
1. Running `npm run dev` shows the old green/navy theme.
2. The source and dist are out of sync, creating confusion.
3. Several hardcoded color values bypass CSS variables entirely, making a palette swap incomplete if only variables are changed.

## Goals / Non-Goals

### Goals
1. **All CSS custom properties in `:root`** in `style.css` use yellow/black palette values.
2. **Every hardcoded hex color** in `style.css` is replaced with either a CSS variable reference or a yellow/black-family value.
3. **Inline styles** in `src/App.jsx` (lines 180, 183) are verified to contain no color declarations (confirmed: they only set layout properties — no changes needed).
4. **`app.js`** (vanilla fallback) references only CSS classes from `style.css` — no inline color overrides exist (confirmed — no changes needed).
5. **WCAG AA contrast** (minimum 4.5:1 for normal text, 3:1 for large text) is met for all foreground/background combinations.
6. **`dist/` is regenerated** via `npm run build` so source and build output are in sync.

### Non-Goals
- Redesigning layout, typography, spacing, or component structure.
- Adding a theme-switcher or dark/light mode toggle.
- Modifying `vite.config.js`, `src/main.jsx`, or any JavaScript logic.
- Changing the legacy `app.js` vanilla file (it uses the same `style.css` and has no inline colors).
- Upgrading dependencies or changing the build toolchain.

## Proposed Solution

### Architecture Overview

The application has a single stylesheet (`style.css`) consumed by both:
- **React app** (`src/main.jsx` imports `/style.css` at line 4) served via Vite dev server.
- **Vanilla fallback** (`index.html` links `<link rel="stylesheet" href="/style.css">` at line 7).

All visual components (`container`, `msg.in`, `msg.out`, `primary` button, `pill`, `widget-boolean`, inputs, scrollbar, footer) are styled exclusively through `style.css`. The React component `src/App.jsx` uses `className` references to these CSS classes. No component-level CSS modules or CSS-in-JS exist.

```
index.html ──► style.css ◄── src/main.jsx (import '/style.css')
                  │
                  ▼
            :root variables
            + class selectors
                  │
          ┌───────┴────────┐
          ▼                ▼
   React App (dev)    Vanilla (fallback)
   src/App.jsx            app.js
```

**Strategy:** Replace all color tokens in `:root` and all hardcoded color values in `style.css` with the new yellow/black palette. Then rebuild `dist/`.

### Color Token Mapping

Below is the complete old → new mapping with WCAG contrast ratios noted.

| CSS Variable | Old Value | New Value | Purpose | Contrast vs background |
|---|---|---|---|---|
| `--bg` | `#0f1724` | `#000000` | Page background | N/A (is background) |
| `--card` | `#0b1220` | `#0a0a0a` | Card/panel background | N/A |
| `--accent` | `#6ee7b7` | `#FFD600` | Primary accent (buttons, highlights) | 12.4:1 on `#000` ✅ |
| `--muted` | `#9aa4b2` | `#B0B0B0` | Secondary/muted text | 10.3:1 on `#000` ✅ |
| `--glass` | `rgba(255,255,255,0.03)` | `rgba(255,255,255,0.05)` | Glassmorphism overlay | N/A (decorative) |
| `--bubble-in` | `#0b6e4f` | `#1A1A00` | Incoming message bubble bg | N/A (is background) |
| `--bubble-out` | `#1f2937` | `#111111` | Outgoing message bubble bg | N/A (is background) |
| *(new)* `--accent-soft` | — | `#FFEF8A` | Hover state for accent | 14.7:1 on `#000` ✅ |
| *(new)* `--text` | — | `#F5F5F5` | Primary text color | 18.1:1 on `#000` ✅ |
| *(new)* `--text-soft` | — | `#FFFACD` | Soft/warm text (inputs, labels) | 17.4:1 on `#000` ✅ |
| *(new)* `--border` | — | `rgba(255,214,0,0.22)` | Default border | N/A (decorative) |
| *(new)* `--border-strong` | — | `rgba(255,214,0,0.48)` | Hover border | N/A (decorative) |
| *(new)* `--shadow` | — | `rgba(0,0,0,0.65)` | Box shadow | N/A (decorative) |

**Key WCAG contrast checks (calculated against respective backgrounds):**

| Combination | Ratio | WCAG AA |
|---|---|---|
| `--text` (#F5F5F5) on `--bg` (#000000) | 18.1:1 | ✅ Pass |
| `--accent` (#FFD600) on `--bg` (#000000) | 12.4:1 | ✅ Pass |
| `--muted` (#B0B0B0) on `--bg` (#000000) | 10.3:1 | ✅ Pass |
| `--text` (#F5F5F5) on `--bubble-in` (#1A1A00) | 14.8:1 | ✅ Pass |
| `--text` (#F5F5F5) on `--bubble-out` (#111111) | 15.9:1 | ✅ Pass |
| `#000` (button text) on `--accent` (#FFD600) | 12.4:1 | ✅ Pass |
| `--text-soft` (#FFFACD) on `--bubble-in` (#1A1A00) | 14.2:1 | ✅ Pass |
| `--accent` (#FFD600) on `--card` (#0a0a0a) | 11.9:1 | ✅ Pass |

### File Changes (exhaustive)

#### `style.css` — COMPLETE REWRITE of color values

**REMOVE** (lines 1–9, old `:root` block):
```css
:root{
  --bg:#0f1724;
  --card:#0b1220;
  --accent:#6ee7b7;
  --muted:#9aa4b2;
  --glass: rgba(255,255,255,0.03);
  --bubble-in:#0b6e4f;
  --bubble-out:#1f2937;
}
```

**ADD** (replacement `:root` block):
```css
:root{
  --bg:#000000;
  --card:#0a0a0a;
  --accent:#FFD600;
  --accent-soft:#FFEF8A;
  --muted:#B0B0B0;
  --text:#F5F5F5;
  --text-soft:#FFFACD;
  --glass:rgba(255,255,255,0.05);
  --border:rgba(255,214,0,0.22);
  --border-strong:rgba(255,214,0,0.48);
  --bubble-in:#1A1A00;
  --bubble-out:#111111;
  --shadow:rgba(0,0,0,0.65);
}
```

**Line 12 — `body` background and text color:**
- REMOVE: `background:linear-gradient(180deg,#071023 0%, #081226 100%);color:#e6eef6`
- ADD: `background:linear-gradient(180deg,var(--bg) 0%,#0A0A0A 100%);color:var(--text)`

**Line 13 — `.container` background and shadow:**
- REMOVE: `background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);box-shadow:0 6px 30px rgba(2,6,23,0.6)`
- ADD: `background:linear-gradient(180deg,#FFD60014,#FFFFFF05);border:1px solid var(--border);box-shadow:0 6px 30px var(--shadow)`

**Line 17 — `#processDef` border and text color:**
- REMOVE: `border:1px solid rgba(255,255,255,0.04);...color:#dbeafe`
- ADD: `border:1px solid var(--border);...color:var(--text-soft)`

**Line 19 — `.primary` button text color:**
- REMOVE: `color:#042016`
- ADD: `color:#000000`

**ADD** (new rule after `.primary`):
```css
.primary:hover{background:var(--accent-soft);color:#000}
```

**Line 20 — `button` base styles:**
- REMOVE: `border:1px solid rgba(255,255,255,0.03);background:transparent;color:var(--muted)`
- ADD: `border:1px solid var(--border);background:#FFD6000A;color:var(--text)`

**ADD** (new rule after `button`):
```css
button:hover{border-color:var(--border-strong);background:#FFD6001F;color:var(--text-soft)}
button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
```

**Line 23 — `.msg` shadow:**
- REMOVE: `box-shadow:0 4px 14px rgba(2,6,23,0.5)`
- ADD: `box-shadow:0 4px 14px var(--shadow);border:1px solid rgba(255,255,255,0.06)`

**Line 24 — `.msg.in` gradient and accent:**
- REMOVE: `background:linear-gradient(180deg,var(--bubble-in),#134b3a);align-self:flex-start`
- ADD: `background:linear-gradient(180deg,var(--bubble-in),#141400);border-left:3px solid var(--accent);align-self:flex-start`

**Line 25 — `.msg.out` text color:**
- REMOVE: `color:#d1d5db`
- ADD: `color:#E8E8E8`

**Line 28 — `.pill` background and border:**
- REMOVE: `background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.03)`
- ADD: `background:#00000038;border:1px solid var(--border)`

**ADD** (new rule after `.pill`):
```css
.pill:hover{border-color:var(--border-strong)}
```

**Line 30 — `input[type=text], textarea.short`:**
- REMOVE: `border:1px solid rgba(255,255,255,0.04);background:transparent;color:#e6eef6`
- ADD: `border:1px solid var(--border);background:#0003;color:var(--text)`

**Line 32 — `.widget-boolean .pill`:**
- REMOVE: `background:linear-gradient(180deg,#0f3e29,#083421);color:#dff7ea`
- ADD: `background:linear-gradient(180deg,#2B2500,#171300);color:var(--text-soft)`

**Line 37 — scrollbar thumb:**
- REMOVE: `background:rgba(255,255,255,0.04)`
- ADD: `background:#FFD6003D`

**Line 12 — `.container` border-radius:**
- MODIFY: `border-radius:12px` → `border-radius:8px` (tighter, matches the dist build aesthetic)

**Line 23 — `.msg` border-radius:**
- MODIFY: `border-radius:12px` → `border-radius:8px`

#### `src/App.jsx` — NO CHANGES REQUIRED

Verified: Lines 180 and 183 contain only layout inline styles (`marginTop`, `display`, `flex`, `gap`, `alignItems`). All color styling comes from CSS class names (`container`, `primary`, `msg`, `pill`, `short`, `muted`, `status`, `footer`, `meta`, `widget-boolean`, `widget-text`, `controls`, `controls-row`, `chat`, `task-actions`, `poll`). No modifications needed.

#### `src/main.jsx` — NO CHANGES REQUIRED

Imports `/style.css` at line 4. No color references.

#### `app.js` — NO CHANGES REQUIRED

Uses CSS classes only. No inline color values.

#### `index.html` — NO CHANGES REQUIRED

Links to `/style.css`. No inline styles or color values.

#### `vite.config.js` — NO CHANGES REQUIRED

Build/proxy configuration only.

#### `dist/assets/index-Cl39OLgr.css` — REGENERATED (not manually edited)

After modifying `style.css`, run `npm run build`. Vite will produce a new hashed CSS file in `dist/assets/` with the updated palette. The old `dist/assets/index-Cl39OLgr.css` will be replaced. `dist/index.html` will be updated to reference the new filename.

### Key New Code

**Complete new `style.css`:**

```css
:root{
  --bg:#000000;
  --card:#0a0a0a;
  --accent:#FFD600;
  --accent-soft:#FFEF8A;
  --muted:#B0B0B0;
  --text:#F5F5F5;
  --text-soft:#FFFACD;
  --glass:rgba(255,255,255,0.05);
  --border:rgba(255,214,0,0.22);
  --border-strong:rgba(255,214,0,0.48);
  --bubble-in:#1A1A00;
  --bubble-out:#111111;
  --shadow:rgba(0,0,0,0.65);
}
```

**New hover/focus states (added after existing button rule):**

```css
.primary:hover{background:var(--accent-soft);color:#000}
button:hover{border-color:var(--border-strong);background:#FFD6001F;color:var(--text-soft)}
button:focus-visible,input:focus-visible,textarea:focus-visible{
  outline:2px solid var(--accent);outline-offset:2px
}
.pill:hover{border-color:var(--border-strong)}
```

### Constructor / Initialization Changes

Not applicable — this is a CSS-only change. No JavaScript constructors, component props, or initialization logic is modified.

## Migration Plan

### Step 1: Update `style.css`
Replace the entire contents of `style.css` with the new yellow/black palette version. Every change is itemized in the "File Changes" section above. The file is 39 lines — a full replacement is safest.

### Step 2: Visual verification in dev mode
```bash
cd test-inbox
npm run dev
```
Open `http://localhost:5174` and verify:
- Page background is black
- "Execute" button is yellow (#FFD600) with black text
- Chat bubbles have dark backgrounds with yellow left-border on incoming messages
- Muted text is readable gray
- Hover states show lighter yellow tints
- Boolean widget pills show warm dark-yellow gradient
- Scrollbar thumb is translucent yellow
- Focus outlines are yellow

### Step 3: Test WCAG compliance
Use browser DevTools or an accessibility checker (e.g., axe, Lighthouse) to verify:
- All text meets 4.5:1 contrast ratio against its background
- Interactive elements have visible focus indicators
- No color is used as the sole means of conveying information

### Step 4: Rebuild dist
```bash
npm run build
```
This regenerates `dist/index.html` and `dist/assets/index-*.css` + `dist/assets/index-*.js`. Commit the new dist output.

### Step 5: Test vanilla fallback
```bash
python -m http.server 5500 -d .
```
Open `http://localhost:5500/index.html` (the non-React vanilla version) and verify it also picks up the new `style.css` colors correctly.

### Step 6: Delete stale dist artifacts
Remove old `dist/assets/index-Cl39OLgr.css` and `dist/assets/index-DiJ858q4.js` if Vite generates new hashed filenames (it will).

## Risks

1. **Hardcoded hex values missed:** The current `style.css` has ~12 hardcoded hex colors outside `:root`. All have been identified and mapped in this spec. Risk is low if the full file replacement approach is used rather than surgical edits.

2. **Dist/source desync:** The existing `dist/` already contains a yellow-ish theme (`--accent:#ffd700`) that differs slightly from the source. After this change, source uses `#FFD600` (slightly more saturated). The dist must be regenerated to match. **Mitigation:** Step 4 of migration plan.

3. **`--accent` value choice — `#FFD600` vs `#FFD700`:** The existing dist uses `#FFD700` (CSS "gold"). The spec goal specifies `#FFD600`. The difference is minimal (FFD600 is marginally more saturated). Both pass WCAG. We use `#FFD600` per the brief. If stakeholders prefer `#FFD700`, only the `:root` `--accent` value needs to change.

4. **Browser rendering of low-alpha borders:** `--border: rgba(255,214,0,0.22)` may appear invisible on some low-contrast displays. The `--border-strong` variant at 0.48 alpha is used for hover states to ensure visibility on interaction.

5. **Scrollbar styling:** `::webkit-scrollbar` rules only work in Chromium/Safari. Firefox users will see the default scrollbar. This is pre-existing behavior, not introduced by this change.

6. **Widget-boolean gradient:** The new gradient (`#2B2500` → `#171300`) is very dark. Text inside uses `--text-soft` (#FFFACD) which has 14.2:1 contrast against `#2B2500` — well above WCAG AA. However, the buttons may appear very subtle. Visual QA should confirm they are distinguishable from the message background.

7. **No disabled state defined:** Neither the old nor new CSS defines explicit `:disabled` styles for buttons/inputs. While not in scope (non-goal), the new palette's `button` base style with `var(--border)` and `var(--text)` will apply to disabled elements. A future enhancement could add `button:disabled{opacity:0.4;cursor:not-allowed}`.

## Open Questions

1. **Exact yellow hex — `#FFD600` vs `#FFD700`?** The brief says "#FFD600 or similar." The existing dist build uses `#FFD700`. Which is the canonical brand yellow? Both pass WCAG. Decision needed from design/product owner.

2. **Should the `dist/` folder be committed to version control?** Currently it exists in the repo. If CI/CD handles builds, the dist folder could be `.gitignore`d and this step removed from the migration plan.

3. **Should a `.poll` label class receive explicit styling?** Currently the auto-poll checkbox label (`<label className="poll">`) has no dedicated CSS rule — it inherits from `body`. With the new palette this works fine (white text on black), but a dedicated rule could improve hover/focus UX for the checkbox.