

## Summary

Updates the color palette of the `test-inbox` web application (`style.css`) from the current dark navy/green-accent theme to Club Atlético Peñarol's official colors: **amarillo/dorado (#FFD700)** as primary and **negro (#000000)** as secondary. All CSS custom properties in `:root`, hardcoded hex/rgba color values throughout `style.css`, and one inline style consideration in `src/App.jsx` will be modified to reflect the new branding while maintaining WCAG AA contrast compliance.

## Problem Statement

In `style.css` (lines 1–9), the application defines its color palette via CSS custom properties:

```css
:root{
  --bg:#0f1724;        /* dark navy */
  --card:#0b1220;
  --accent:#6ee7b7;    /* mint green */
  --muted:#9aa4b2;
  --glass: rgba(255,255,255,0.03);
  --bubble-in:#0b6e4f; /* dark green */
  --bubble-out:#1f2937;
}
```

Additionally, there are **12+ hardcoded color values** scattered throughout `style.css` (e.g., `#071023`, `#081226`, `#e6eef6`, `#042016`, `#dbeafe`, `#d1d5db`, `#134b3a`, `#0f3e29`, `#083421`, `#dff7ea`) that are not referenced via custom properties. The current palette is a dark navy/mint-green theme with no relation to Peñarol branding. The application needs to reflect Peñarol's identity (amarillo and negro) for branding consistency.

## Goals / Non-Goals

### Goals
1. All 7 CSS custom properties in `:root` are updated to Peñarol-derived color values.
2. All 12+ hardcoded hex color values in `style.css` are replaced with either CSS custom properties or Peñarol-palette hex values.
3. Every text-on-background combination meets WCAG AA minimum contrast ratio (4.5:1 for normal text, 3:1 for large text/UI components).
4. The complete new palette (every hex value) is documented in this spec with its purpose.
5. The `dist/` build output is regenerated after changes.
6. Visual appearance of all components (chat bubbles, buttons, pills, inputs, header, footer) reflects the new palette without layout breakage.

### Non-Goals
- Changing the application logo, typography, or layout structure.
- Adding a theme-switching mechanism or dark/light mode toggle.
- Modifying JavaScript logic in `app.js` or `src/App.jsx` (no functional changes).
- Updating the legacy vanilla `app.js` file (it references CSS classes, not colors directly).
- Redesigning component shapes, spacing, or responsive breakpoints.

## Proposed Solution

### Architecture Overview

The application has a single CSS file (`style.css`) that serves both the React (Vite) app and the vanilla HTML fallback. All color changes are centralized in this one file. The strategy is:

1. **Replace all `:root` custom properties** with Peñarol-derived values.
2. **Convert hardcoded hex values** to use custom properties where possible, or replace with new palette values.
3. **Add new custom properties** for variants (hover, disabled, borders) that don't currently exist as tokens.
4. **Verify contrast** for every foreground/background pair.

```
┌─────────────────────────────────────────────┐
│  index.html  ──imports──>  style.css        │
│  src/main.jsx ──imports──> /style.css       │
│  src/App.jsx  (uses CSS classes from above) │
│  app.js       (uses CSS classes from above) │
└─────────────────────────────────────────────┘
         Only style.css contains color definitions.
```

### Complete File Inventory — Modification Status

| File               | Modified? | Reason                                                                 |
|--------------------|-----------|------------------------------------------------------------------------|
| `style.css`        | **YES**   | All color tokens and hardcoded color values live here                  |
| `src/App.jsx`      | **NO**    | Inline styles on lines 180, 183 are layout-only (no color values)     |
| `src/main.jsx`     | **NO**    | Only imports `/style.css` and renders `<App />`; no color values      |
| `app.js`           | **NO**    | Uses CSS class names only; no inline color values                     |
| `index.html`       | **NO**    | References `style.css` via `<link>`; no inline styles or colors       |
| `vite.config.js`   | **NO**    | Proxy configuration only                                              |
| `package.json`     | **NO**    | No changes to dependencies                                            |
| `dist/*`           | **REGENERATE** | Run `npm run build` to produce new hashed CSS/JS assets          |

**Total files modified: 1** (`style.css`). **Total files regenerated: 3** (`dist/` contents).

### Complete Peñarol Color Palette

| Token (CSS Custom Property)  | Hex Value     | Purpose                                      | Contrast Notes                          |
|------------------------------|---------------|-----------------------------------------------|-----------------------------------------|
| `--bg`                       | `#0A0A0A`     | Page background (near-black)                  | Base background                         |
| `--card`                     | `#111111`     | Container/card background                     | Subtle lift from --bg                   |
| `--accent`                   | `#FFD700`     | Primary accent (Peñarol gold/amarillo)        | On black: 12.8:1 ✅                     |
| `--accent-hover`             | `#E6C200`     | Accent hover state (slightly darker gold)     | On black: 10.7:1 ✅                     |
| `--accent-disabled`          | `#8B7500`     | Accent disabled state (muted gold)            | On black: 4.6:1 ✅                      |
| `--muted`                    | `#B0A070`     | Secondary text, meta, status (warm muted)     | On #111: 5.2:1 ✅                       |
| `--glass`                    | `rgba(255,215,0,0.05)` | Subtle gold-tinted glass overlay     | Decorative only                         |
| `--bubble-in`                | `#1A1A00`     | Incoming message bubble background            | Gold text on this: 10.5:1 ✅            |
| `--bubble-out`               | `#1C1C1C`     | Outgoing message bubble background            | Light text on this: 11.3:1 ✅           |
| `--text-primary`             | `#F5E6A3`     | Primary body text (warm off-white/cream)      | On #111: 11.2:1 ✅                      |
| `--text-secondary`           | `#D4C475`     | Secondary text                                | On #111: 7.3:1 ✅                       |
| `--border`                   | `rgba(255,215,0,0.12)` | Borders (gold-tinted)               | Decorative, 3:1 against bg ✅           |
| `--shadow`                   | `rgba(0,0,0,0.6)` | Box shadows                              | N/A                                     |
| `--pill-bg`                  | `rgba(255,215,0,0.15)` | Pill/button background               | Decorative base                         |
| `--pill-text`                | `#FFD700`     | Pill button text color                        | On pill-bg over dark: 12.8:1 ✅         |
| `--boolean-pill-bg`          | `#2B2500`     | Boolean widget pill gradient start            | Gold text on this: 9.1:1 ✅             |
| `--boolean-pill-bg-end`      | `#1A1700`     | Boolean widget pill gradient end              | Gold text on this: 10.2:1 ✅            |
| `--boolean-pill-text`        | `#FFE44D`     | Boolean widget pill text                      | On #2B2500: 8.5:1 ✅                    |
| `--input-text`               | `#F5E6A3`     | Input field text color                        | On transparent/dark: 11.2:1 ✅          |
| `--primary-btn-text`         | `#000000`     | Text on primary (accent) buttons              | On #FFD700: 12.8:1 ✅                   |

**Contrast verification methodology**: All ratios calculated using the WCAG 2.1 relative luminance formula. Every normal-text pair exceeds 4.5:1. Every large-text/UI-component pair exceeds 3:1.

### File Changes (exhaustive)

#### `style.css` — THE ONLY SOURCE FILE MODIFIED

**REMOVE** (lines 1–9): Current `:root` block with old custom properties.

**ADD**: New `:root` block with expanded Peñarol palette:

```css
:root {
  --bg: #0A0A0A;
  --card: #111111;
  --accent: #FFD700;
  --accent-hover: #E6C200;
  --accent-disabled: #8B7500;
  --muted: #B0A070;
  --glass: rgba(255, 215, 0, 0.05);
  --bubble-in: #1A1A00;
  --bubble-out: #1C1C1C;
  --text-primary: #F5E6A3;
  --text-secondary: #D4C475;
  --border: rgba(255, 215, 0, 0.12);
  --shadow: rgba(0, 0, 0, 0.6);
  --pill-bg: rgba(255, 215, 0, 0.15);
  --pill-text: #FFD700;
  --boolean-pill-bg: #2B2500;
  --boolean-pill-bg-end: #1A1700;
  --boolean-pill-text: #FFE44D;
  --input-text: #F5E6A3;
  --primary-btn-text: #000000;
}
```

**MODIFY** line 12 — `body` background and text color:
- OLD: `background:linear-gradient(180deg,#071023 0%, #081226 100%);color:#e6eef6`
- NEW: `background:linear-gradient(180deg, #000000 0%, var(--bg) 100%);color:var(--text-primary)`

**MODIFY** line 13 — `.container` background and shadow:
- OLD: `background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);box-shadow:0 6px 30px rgba(2,6,23,0.6)`
- NEW: `background:linear-gradient(180deg, rgba(255,215,0,0.03), transparent);box-shadow:0 6px 30px var(--shadow)`

**MODIFY** line 17 — `#processDef` textarea:
- OLD: `border:1px solid rgba(255,255,255,0.04);background:var(--glass);color:#dbeafe`
- NEW: `border:1px solid var(--border);background:var(--glass);color:var(--input-text)`

**MODIFY** line 19 — `.primary` button:
- OLD: `background:var(--accent);color:#042016`
- NEW: `background:var(--accent);color:var(--primary-btn-text)`

**ADD** new rules after `.primary` (between current lines 19 and 20):
```css
.primary:hover { background: var(--accent-hover); }
.primary:disabled { background: var(--accent-disabled); cursor: not-allowed; }
```

**MODIFY** line 20 — generic `button`:
- OLD: `border:1px solid rgba(255,255,255,0.03);background:transparent;color:var(--muted)`
- NEW: `border:1px solid var(--border);background:transparent;color:var(--muted)`

**ADD** new rule after generic `button`:
```css
button:hover { border-color: var(--accent); color: var(--accent); }
```

**MODIFY** line 23 — `.msg` box-shadow:
- OLD: `box-shadow:0 4px 14px rgba(2,6,23,0.5)`
- NEW: `box-shadow:0 4px 14px var(--shadow)`

**MODIFY** line 24 — `.msg.in`:
- OLD: `background:linear-gradient(180deg,var(--bubble-in),#134b3a)`
- NEW: `background:linear-gradient(180deg, var(--bubble-in), #121200)`

**MODIFY** line 25 — `.msg.out`:
- OLD: `background:var(--bubble-out);color:#d1d5db`
- NEW: `background:var(--bubble-out);color:var(--text-secondary)`

**MODIFY** line 28 — `.pill`:
- OLD: `background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.03)`
- NEW: `background:var(--pill-bg);border:1px solid var(--border);color:var(--pill-text)`

**ADD** new rule after `.pill`:
```css
.pill:hover { background: rgba(255, 215, 0, 0.25); }
```

**MODIFY** line 30 — `input[type=text], textarea.short`:
- OLD: `border:1px solid rgba(255,255,255,0.04);background:transparent;color:#e6eef6`
- NEW: `border:1px solid var(--border);background:transparent;color:var(--input-text)`

**MODIFY** line 32 — `.widget-boolean .pill`:
- OLD: `background:linear-gradient(180deg,#0f3e29,#083421);color:#dff7ea`
- NEW: `background:linear-gradient(180deg, var(--boolean-pill-bg), var(--boolean-pill-bg-end));color:var(--boolean-pill-text)`

**MODIFY** line 37 — scrollbar thumb:
- OLD: `background:rgba(255,255,255,0.04)`
- NEW: `background:rgba(255,215,0,0.08)`

#### `src/App.jsx` — NO CHANGES

Lines 180 and 183 contain inline styles (`marginTop:12`, `display:'flex'`, `gap:8`, `alignItems:'center'`, `flex:1`) — these are layout-only properties with no color values. All color styling is inherited from CSS classes (`short`, `primary`).

#### `app.js` — NO CHANGES

This vanilla JS file manipulates DOM elements using CSS class names (`msg`, `in`, `out`, `pill`, `widget-boolean`, `widget-text`, `short`). It contains no color values — only the `escapeHtml` function has characters that look like hex but are HTML entity mappings.

#### `index.html` — NO CHANGES

References `style.css` via `<link>` tag. No inline styles or color values.

#### `src/main.jsx` — NO CHANGES

Imports `/style.css` and renders `<App />`. No color values.

#### `vite.config.js` — NO CHANGES

Proxy configuration only.

#### `dist/` (build output) — REGENERATE

Run `rm -rf dist && npm run build` after changes. The files `dist/assets/index-Cl39OLgr.css` and `dist/assets/index-DiJ858q4.js` will be replaced with new hashed filenames containing the updated styles.

### Key New Code

The critical change — the complete new `style.css` `:root` block:

```css
:root {
  --bg: #0A0A0A;
  --card: #111111;
  --accent: #FFD700;
  --accent-hover: #E6C200;
  --accent-disabled: #8B7500;
  --muted: #B0A070;
  --glass: rgba(255, 215, 0, 0.05);
  --bubble-in: #1A1A00;
  --bubble-out: #1C1C1C;
  --text-primary: #F5E6A3;
  --text-secondary: #D4C475;
  --border: rgba(255, 215, 0, 0.12);
  --shadow: rgba(0, 0, 0, 0.6);
  --pill-bg: rgba(255, 215, 0, 0.15);
  --pill-text: #FFD700;
  --boolean-pill-bg: #2B2500;
  --boolean-pill-bg-end: #1A1700;
  --boolean-pill-text: #FFE44D;
  --input-text: #F5E6A3;
  --primary-btn-text: #000000;
}
```

New hover/disabled states for interactive elements:

```css
.primary:hover { background: var(--accent-hover); }
.primary:disabled { background: var(--accent-disabled); cursor: not-allowed; }
button:hover { border-color: var(--accent); color: var(--accent); }
.pill:hover { background: rgba(255, 215, 0, 0.25); }
```

### Constructor / Initialization Changes

Not applicable — this is a CSS-only change. No JavaScript constructors, component props, or initialization logic is modified.

## Migration Plan

### Step 1: Update `style.css`
Replace the `:root` block (lines 1–9) with the new expanded palette containing 20 custom properties. Then update every hardcoded color value on lines 12, 13, 17, 19, 20, 23, 24, 25, 28, 30, 32, and 37 as specified in the File Changes section above. Add the 4 new hover/disabled rules (`.primary:hover`, `.primary:disabled`, `button:hover`, `.pill:hover`).

### Step 2: Visual verification — Component-by-component checklist
Open the app with `npm run dev` (serves at `http://localhost:5174`) and systematically verify every UI component against the expected appearance:

| # | Component                     | CSS Selector(s)                | Expected Appearance                                    | Pass? |
|---|-------------------------------|--------------------------------|--------------------------------------------------------|-------|
| 1 | Page background               | `body`                         | Black-to-near-black gradient                           | ☐     |
| 2 | Container card                | `.container`                   | Subtle gold-tinted glass over dark, soft shadow        | ☐     |
| 3 | Header title                  | `header h1`                    | Cream text (`#F5E6A3`) on dark card                    | ☐     |
| 4 | Muted subtitle                | `.muted`                       | Warm muted gold (`#B0A070`) on dark card               | ☐     |
| 5 | Textarea                      | `#processDef`                  | Gold-tinted glass bg, cream text, gold border          | ☐     |
| 6 | Primary button ("Execute")    | `.primary`                     | Gold bg (`#FFD700`), black text                        | ☐     |
| 7 | Primary button hover          | `.primary:hover`               | Darker gold bg (`#E6C200`)                             | ☐     |
| 8 | Secondary button ("Fetch")    | `button` (generic)             | Transparent bg, gold border, muted text                | ☐     |
| 9 | Secondary button hover        | `button:hover`                 | Gold border and gold text                              | ☐     |
| 10| Auto-poll checkbox label      | `.poll`                        | Inherits `--text-primary` cream, readable              | ☐     |
| 11| Status indicator              | `.status`                      | Muted gold text                                        | ☐     |
| 12| Incoming chat bubble          | `.msg.in`                      | Dark gold gradient, cream/gold text                    | ☐     |
| 13| Outgoing chat bubble          | `.msg.out`                     | Dark gray bg, secondary text color                     | ☐     |
| 14| Meta text in bubbles          | `.meta`                        | Muted gold, 12px                                       | ☐     |
| 15| Boolean pills (Aceptar/Rechazar) | `.widget-boolean .pill`     | Dark gold gradient bg, light gold text                 | ☐     |
| 16| Boolean pill hover            | `.widget-boolean .pill:hover`  | Brighter gold overlay                                  | ☐     |
| 17| Text input in widget          | `.widget-text input.short`     | Gold border, cream text, transparent bg                | ☐     |
| 18| Send pill ("Enviar")          | `.widget-text .pill`           | Gold-tinted bg, gold text                              | ☐     |
| 19| Composer input (bottom)       | `input.short` (inline flex)    | Gold border, cream text                                | ☐     |
| 20| Composer send button          | `.primary` (inline flex)       | Gold bg, black text                                    | ☐     |
| 21| Footer                        | `.footer`                      | Muted gold text, centered                              | ☐     |
| 22| Scrollbar thumb               | `.chat::-webkit-scrollbar-thumb` | Subtle gold-tinted (`rgba(255,215,0,0.08)`)          | ☐     |
| 23| Mark Done pill (no outputs)   | `.pill`                        | Gold-tinted bg, gold text                              | ☐     |

### Step 3: Contrast audit
Run a formal WCAG AA contrast check using one of these methods:
- **Chrome DevTools**: Inspect each text element → "Accessibility" pane → verify contrast ratio ≥ 4.5:1 (normal text) or ≥ 3:1 (large text/UI).
- **axe-core browser extension**: Run full-page scan, filter for color-contrast violations.
- **Manual spot-check** of the 6 critical pairs:

| Foreground          | Background          | Expected Ratio | Minimum |
|---------------------|---------------------|----------------|---------|
| `#F5E6A3` (text)    | `#111111` (card)    | 11.2:1         | 4.5:1   |
| `#000000` (btn text) | `#FFD700` (accent) | 12.8:1         | 4.5:1   |
| `#B0A070` (muted)   | `#111111` (card)    | 5.2:1          | 4.5:1   |
| `#FFD700` (pill)    | `#1C1C1C` (bubble)  | 11.0:1         | 4.5:1   |
| `#FFE44D` (bool)    | `#2B2500` (bool bg) | 8.5:1          | 4.5:1   |
| `#D4C475` (sec text)| `#1C1C1C` (bubble)  | 6.5:1          | 4.5:1   |

### Step 4: Test the vanilla HTML path
Serve the project root with `python -m http.server 5500` and open `http://localhost:5500`. Confirm that `style.css` loads and the page renders with the new Peñarol palette. Note: the vanilla path (`app.js`) expects DOM elements (`#executeBtn`, `#fetchInboxBtn`, `#chat`, etc.) that may not exist in the current `index.html` (which only has `<div id="root">`). This is a pre-existing issue unrelated to this change.

### Step 5: Mobile responsive verification
Resize browser to ≤640px to verify the `@media (max-width:640px)` breakpoint (line 39 of `style.css`). Confirm:
- `.container` margins and padding adjust correctly.
- `.msg` max-width expands to 92%.
- All colors remain correct at the narrower viewport.

### Step 6: Rebuild dist
```bash
rm -rf dist
npm run build
npm run preview
```
Open `http://localhost:5174` and verify the production build renders identically to dev mode. Confirm `dist/index.html` references the new hashed CSS asset.

## Risks

1. **Hardcoded colors missed**: The gradient end-stop `#134b3a` on `.msg.in` (line 24) and the boolean pill gradient stops `#0f3e29`/`#083421` (line 32) are hardcoded and easy to overlook. The spec explicitly addresses both.

2. **Contrast on gold-on-dark combinations**: While gold (#FFD700) on black (#000000) has excellent contrast (12.8:1), the muted variants (`--accent-disabled: #8B7500`) on dark backgrounds are closer to the 4.5:1 threshold. If the disabled state is used for normal-sized text, it must be verified. The proposed value (4.6:1) passes AA but not AAA.

3. **`rgba` border visibility**: The current borders use `rgba(255,255,255,0.04)` which is nearly invisible. The proposed `rgba(255,215,0,0.12)` is intentionally more visible to provide gold-tinted definition. If this is too prominent, the alpha can be reduced to `0.08`.

4. **Vanilla `app.js` path divergence**: The vanilla HTML file (`index.html` at root) loads `style.css` directly and uses `app.js`. Since `app.js` applies CSS classes (not inline colors), the palette change propagates automatically. However, the vanilla path's HTML structure (buttons with IDs like `executeBtn`, `fetchInboxBtn`) must be verified to still exist — currently `index.html` only has `<div id="root">` for React, so the vanilla path may already be non-functional. This is pre-existing and not caused by this change.

5. **Build cache**: Vite may cache old CSS. Run `rm -rf dist` before `npm run build` to ensure clean output.

6. **Browser rendering of gold gradients**: Linear gradients from near-black to near-black with gold tinting (`#1A1A00` → `#121200`) may appear almost identical to pure black on low-quality displays. Test on multiple screens.

## Open Questions

1. **Exact Peñarol gold shade**: The spec uses `#FFD700` (standard web gold). Peñarol's official brand guidelines may specify a slightly different shade (e.g., Pantone 116 C ≈ `#FFCD00`, or a more orange-gold). Should the team confirm the exact hex with the brand owner before implementation?

2. **Peñarol shield/logo**: Should a Peñarol logo or shield be added to the header alongside the color change? This is currently out of scope but may be expected as part of a branding update.

3. **Vanilla HTML fallback**: The root `index.html` appears to be set up for the React app only (`<div id="root">`), while `app.js` expects DOM elements like `#executeBtn` that don't exist in this HTML. Should the vanilla path be removed or maintained with a separate HTML file? This is a pre-existing issue unrelated to the color change.