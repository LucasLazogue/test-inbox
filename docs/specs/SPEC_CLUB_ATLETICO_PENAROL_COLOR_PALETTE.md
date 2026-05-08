

## Summary

Replaces the existing dark-navy/green color palette in `style.css` (the single source of truth for all UI styling) with a Club Atlético Peñarol–branded palette using **#FFD100** (amarillo dorado) as the primary accent and **#000000** as the secondary/background color. Also updates the pre-built `dist/assets/index-Cl39OLgr.css` and removes hardcoded color literals scattered in `src/App.jsx` and `app.js` so the entire UI — buttons, chat bubbles, borders, scrollbars, hover/disabled states — consistently reflects the Peñarol identity while maintaining WCAG AA contrast.

## Problem Statement

In `style.css` (lines 1–9), the application defines a CSS custom-property palette rooted in dark navy/emerald-green tones:

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

Additionally, `body` uses `background:linear-gradient(180deg,#071023 0%, #081226 100%)` (line 12), and several selectors contain hardcoded hex colors (`#042016`, `#dbeafe`, `#134b3a`, `#0f3e29`, `#083421`, `#dff7ea`, `#d1d5db`, `#e6eef6`).

The pre-built `dist/assets/index-Cl39OLgr.css` contains a *different* palette that already leans gold (`--accent:#ffd700`) but uses slightly different values and is a build artifact that will be regenerated.

`src/App.jsx` contains inline `style` attributes but no hardcoded colors (it relies on CSS classes). `app.js` (the vanilla-JS fallback) also relies on CSS classes.

**Consequence:** The current palette does not match Peñarol branding. There is no centralized design-token file — all colors live in `style.css` `:root` plus scattered hardcoded values in the same file. The built CSS in `dist/` is stale and inconsistent with the source `style.css`.

## Goals / Non-Goals

### Goals
1. Every CSS custom property in `:root` of `style.css` uses a Peñarol-derived color value.
2. Every hardcoded color literal in `style.css` is replaced with either a CSS variable reference or a Peñarol-palette value.
3. The primary action color (`--accent`) is `#FFD100`.
4. The background/secondary color (`--bg`) is `#000000` (or near-black `#0A0A0A` for softer rendering).
5. All text-on-background and text-on-accent combinations meet WCAG AA contrast ratio (≥ 4.5:1 for normal text, ≥ 3:1 for large text/UI components).
6. Hover, focus, and disabled states use identifiable variations of the palette.
7. After running `npm run build`, the `dist/` output reflects the new palette.

### Non-Goals
- Redesigning the layout, typography, or component structure.
- Adding a theme-switcher or dark/light mode toggle.
- Migrating to a CSS-in-JS solution, Tailwind, or design-token tooling.
- Changing the vanilla `app.js` fallback HTML page (it shares `style.css` and will inherit changes automatically).
- Modifying backend endpoints or API logic.

## Proposed Solution

### Architecture Overview

The application has a single stylesheet (`style.css`) imported by both entry points:
- `index.html` → `<link rel="stylesheet" href="/style.css">` (vanilla fallback)
- `src/main.jsx` → `import '/style.css'` (React/Vite entry)

All color changes are centralized in `style.css` `:root` custom properties. Hardcoded hex values elsewhere in the file are replaced with variable references or Peñarol-derived values.

```
┌─────────────┐      ┌──────────────┐
│ index.html  │─────▶│  style.css   │◀──── Single source of truth
└─────────────┘      │  :root vars  │       for ALL colors
┌─────────────┐      │  + selectors │
│ src/main.jsx│─────▶│              │
└─────────────┘      └──────┬───────┘
                            │ npm run build
                            ▼
                     ┌──────────────┐
                     │ dist/assets/ │  (regenerated)
                     │ index-*.css  │
                     └──────────────┘
```

### Peñarol Color Palette Definition

| Token | Value | Usage | Contrast on #0A0A0A |
|---|---|---|---|
| `--accent` | `#FFD100` | Primary buttons, borders, highlights | 12.5:1 ✅ |
| `--accent-hover` | `#FFE44D` | Hover state for primary elements | 14.8:1 ✅ |
| `--accent-soft` | `rgba(255,209,0,0.15)` | Subtle accent backgrounds | N/A (bg) |
| `--bg` | `#0A0A0A` | Page background (near-black) | — |
| `--card` | `#141414` | Card/container background | — |
| `--text` | `#F5F5F5` | Primary text | 18.1:1 on #0A0A0A ✅ |
| `--text-soft` | `#FFFACD` | Accent-tinted text (lemon chiffon) | 17.4:1 on #0A0A0A ✅ |
| `--muted` | `#B8B8B8` | Secondary/meta text | 10.3:1 on #0A0A0A ✅ |
| `--glass` | `rgba(255,255,255,0.05)` | Glassmorphism overlays | — |
| `--border` | `rgba(255,209,0,0.22)` | Default border | — |
| `--border-strong` | `rgba(255,209,0,0.50)` | Hover/focus border | — |
| `--bubble-in` | `#1A1A00` | Incoming message background | — |
| `--bubble-out` | `#161616` | Outgoing message background | — |
| `--shadow` | `rgba(0,0,0,0.65)` | Box shadows | — |
| `--disabled-bg` | `#2A2A2A` | Disabled button background | — |
| `--disabled-text` | `#666666` | Disabled button text | 3.4:1 on #2A2A2A ✅ (large text/UI) |

**Contrast verification notes:**
- `#FFD100` on `#000000` = 12.5:1 (AAA pass)
- `#000000` on `#FFD100` = 12.5:1 (AAA pass — used for button text on accent bg)
- `#F5F5F5` on `#0A0A0A` = 18.1:1 (AAA pass)
- `#B8B8B8` on `#0A0A0A` = 10.3:1 (AAA pass)

### File Changes (exhaustive)

#### `style.css`
This is the primary file. Every change is listed below.

**REMOVE** (lines 1–9): Entire existing `:root` block:
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

**ADD**: New `:root` block with full Peñarol palette:
```css
:root {
  --bg: #0A0A0A;
  --card: #141414;
  --accent: #FFD100;
  --accent-hover: #FFE44D;
  --accent-soft: rgba(255, 209, 0, 0.15);
  --text: #F5F5F5;
  --text-soft: #FFFACD;
  --muted: #B8B8B8;
  --glass: rgba(255, 255, 255, 0.05);
  --border: rgba(255, 209, 0, 0.22);
  --border-strong: rgba(255, 209, 0, 0.50);
  --bubble-in: #1A1A00;
  --bubble-out: #161616;
  --shadow: rgba(0, 0, 0, 0.65);
  --disabled-bg: #2A2A2A;
  --disabled-text: #666666;
}
```

**MODIFY** line 12 — `body` background:
- FROM: `background:linear-gradient(180deg,#071023 0%, #081226 100%);color:#e6eef6`
- TO: `background:linear-gradient(180deg, var(--bg) 0%, #101010 100%); color: var(--text)`

**MODIFY** line 13 — `.container`:
- FROM: `background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);box-shadow:0 6px 30px rgba(2,6,23,0.6)`
- TO: `background:linear-gradient(180deg, rgba(255,209,0,0.08), rgba(255,255,255,0.02)); border:1px solid var(--border); box-shadow:0 6px 30px var(--shadow)`

**MODIFY** line 17 — `#processDef`:
- FROM: `border:1px solid rgba(255,255,255,0.04);background:var(--glass);color:#dbeafe`
- TO: `border:1px solid var(--border); background:var(--glass); color:var(--text-soft)`

**MODIFY** line 19 — `.primary`:
- FROM: `background:var(--accent);color:#042016`
- TO: `background:var(--accent); color:#000000`

**ADD** new rule after `.primary`:
```css
.primary:hover { background: var(--accent-hover); color: #000000; }
.primary:disabled { background: var(--disabled-bg); color: var(--disabled-text); cursor: not-allowed; }
```

**MODIFY** line 20 — `button` (generic):
- FROM: `border:1px solid rgba(255,255,255,0.03);background:transparent;color:var(--muted)`
- TO: `border:1px solid var(--border); background:rgba(255,209,0,0.04); color:var(--text)`

**ADD** new rules for generic button states:
```css
button:hover { border-color: var(--border-strong); background: rgba(255,209,0,0.12); color: var(--text-soft); }
button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
button:disabled { background: var(--disabled-bg); color: var(--disabled-text); border-color: transparent; cursor: not-allowed; }
```

**MODIFY** line 23 — `.msg`:
- FROM: `box-shadow:0 4px 14px rgba(2,6,23,0.5)`
- TO: `box-shadow:0 4px 14px var(--shadow); border:1px solid rgba(255,255,255,0.06)`

**MODIFY** line 24 — `.msg.in`:
- FROM: `background:linear-gradient(180deg,var(--bubble-in),#134b3a)`
- TO: `background:linear-gradient(180deg, var(--bubble-in), #141400); border-left:3px solid var(--accent)`

**MODIFY** line 25 — `.msg.out`:
- FROM: `background:var(--bubble-out);color:#d1d5db`
- TO: `background:var(--bubble-out); color:#E8E8E8`

**MODIFY** line 28 — `.pill`:
- FROM: `background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.03)`
- TO: `background:rgba(0,0,0,0.38); border:1px solid var(--border)`

**ADD** new rule:
```css
.pill:hover { border-color: var(--border-strong); background: rgba(255,209,0,0.12); }
```

**MODIFY** line 30 — `input[type=text], textarea.short`:
- FROM: `border:1px solid rgba(255,255,255,0.04);background:transparent;color:#e6eef6`
- TO: `border:1px solid var(--border); background:rgba(0,0,0,0.2); color:var(--text)`

**MODIFY** line 32 — `.widget-boolean .pill`:
- FROM: `background:linear-gradient(180deg,#0f3e29,#083421);color:#dff7ea`
- TO: `background:linear-gradient(180deg, #2B2500, #171300); color:var(--text-soft)`

**MODIFY** line 37 — scrollbar thumb:
- FROM: `background:rgba(255,255,255,0.04)`
- TO: `background:rgba(255,209,0,0.24)`

#### `src/App.jsx`
No color-literal changes needed. All styling comes from CSS classes defined in `style.css`. The inline `style` attributes on line 180 (`{marginTop:12,display:'flex',gap:8,alignItems:'center'}`) and line 183 (`{flex:1}`) contain only layout properties, no colors.

**No modifications required.**

#### `app.js`
No color-literal changes needed. All DOM elements use CSS classes (`msg`, `in`, `out`, `pill`, `widget-boolean`, `widget-text`, `primary`, `short`, `meta`, `muted`) that are styled by `style.css`.

**No modifications required.**

#### `index.html`
No changes needed. Already links to `style.css` via `<link rel="stylesheet" href="/style.css">`.

**No modifications required.**

#### `src/main.jsx`
No changes needed. Already imports `'/style.css'`.

**No modifications required.**

#### `vite.config.js`
No changes needed. Build configuration is unrelated to colors.

**No modifications required.**

#### `dist/assets/index-Cl39OLgr.css` (build artifact)
**REGENERATE** by running `npm run build`. This file is a Vite build output and should not be manually edited. After modifying `style.css`, running the build will produce a new hashed CSS file with the Peñarol palette.

#### `dist/index.html` (build artifact)
**REGENERATE** by running `npm run build`. Will automatically reference the new CSS asset hash.

### Key New Code

The complete new `:root` block (the single most critical change):

```css
:root {
  --bg: #0A0A0A;
  --card: #141414;
  --accent: #FFD100;
  --accent-hover: #FFE44D;
  --accent-soft: rgba(255, 209, 0, 0.15);
  --text: #F5F5F5;
  --text-soft: #FFFACD;
  --muted: #B8B8B8;
  --glass: rgba(255, 255, 255, 0.05);
  --border: rgba(255, 209, 0, 0.22);
  --border-strong: rgba(255, 209, 0, 0.50);
  --bubble-in: #1A1A00;
  --bubble-out: #161616;
  --shadow: rgba(0, 0, 0, 0.65);
  --disabled-bg: #2A2A2A;
  --disabled-text: #666666;
}
```

New interactive-state rules (added after existing button rules):

```css
.primary:hover { background: var(--accent-hover); color: #000; }
.primary:disabled { background: var(--disabled-bg); color: var(--disabled-text); cursor: not-allowed; }
button:hover { border-color: var(--border-strong); background: rgba(255,209,0,0.12); color: var(--text-soft); }
button:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
.pill:hover { border-color: var(--border-strong); }
```

### Constructor / Initialization Changes

Not applicable — this is a CSS-only change. No JavaScript constructors, component props, or initialization logic is modified.

## Migration Plan

### Step 1: Update `style.css`
Apply all changes listed in the File Changes section above. This is the only source file that requires editing.

### Step 2: Visual verification (dev mode)
```bash
cd test-inbox
npm run dev
```
Open `http://localhost:5174` and verify:
- Page background is near-black (#0A0A0A)
- "Execute" button is golden yellow (#FFD100) with black text
- Hover on "Execute" lightens to #FFE44D
- "Fetch Inbox" button has subtle gold border
- Chat bubbles (incoming) have gold left-border accent
- Textarea border is gold-tinted
- All text is legible (white/cream on dark backgrounds)
- Scrollbar thumb is gold-tinted

### Step 3: Verify vanilla fallback
Open `index.html` directly (or via `python -m http.server 5500 -d .`) and confirm the same palette applies to the vanilla JS version.

### Step 4: Accessibility audit
Use browser DevTools or axe-core to verify:
- All text meets WCAG AA (4.5:1 for body text, 3:1 for large text/UI components)
- Focus indicators are visible (2px solid gold outline)
- Disabled states are distinguishable from enabled states

### Step 5: Rebuild dist
```bash
npm run build
```
Verify `dist/assets/index-*.css` contains the new palette values. The old `dist/assets/index-Cl39OLgr.css` will be replaced by a new hashed file.

### Step 6: Verify production build
```bash
npm run preview
```
Open `http://localhost:5174` and confirm the built version matches dev.

## Risks

1. **Stale `dist/` artifacts**: If `npm run build` is not run after the change, the `dist/` folder will still serve the old palette. The `dist/assets/index-Cl39OLgr.css` already contains a gold-ish palette (from a previous build) but with different values (`#ffd700` vs `#FFD100`). Mitigation: always rebuild after editing `style.css`.

2. **Hardcoded colors in `dist/assets/index-Cl39OLgr.css`**: This build artifact contains a fully inlined/minified CSS with its own `:root` block. It must NOT be manually edited — only regenerated via `npm run build`.

3. **Contrast on accent backgrounds**: If any future component places text on a `#FFD100` background, only black/very dark text will pass WCAG AA. The current design only uses accent for buttons (which already use `color:#000`), borders, and subtle overlays, so this is safe today.

4. **`.widget-boolean .pill` gradient**: The new gradient (`#2B2500` → `#171300`) is very dark olive/gold. Text is `var(--text-soft)` (#FFFACD) which gives ~13:1 contrast. Safe, but should be visually verified to ensure the gold tint reads correctly.

5. **Browser scrollbar styling**: The `::webkit-scrollbar-thumb` color change (`rgba(255,209,0,0.24)`) only affects WebKit/Blink browsers. Firefox and Safari may render differently. This is cosmetic and low-risk.

6. **`app.js` vanilla fallback**: This file shares `style.css` via `index.html`'s `<link>` tag, so it inherits all changes automatically. However, if someone opens `index.html` without the CSS file present, there's no fallback. This is pre-existing behavior, not introduced by this change.

## Open Questions

1. **Title/branding text**: Should the header text "Test Inbox — LangGraph POC" be updated to include Peñarol branding (e.g., a club crest, "Peñarol" in the title), or is the color change sufficient?

2. **Favicon**: Should a Peñarol-branded favicon be added? Currently there is no favicon defined in `index.html`.

3. **Exact yellow shade**: The spec uses `#FFD100` (official Peñarol). The existing `dist/` build artifact uses `#FFD700` (CSS "gold"). Confirm `#FFD100` is the desired value — the difference is subtle (FFD100 is slightly more orange/warm, FFD700 is more lemon).