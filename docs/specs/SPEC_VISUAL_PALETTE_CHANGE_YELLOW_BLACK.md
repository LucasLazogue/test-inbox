Now I have a good understanding of the codebase. Let me verify the current color scheme and understand what needs to be changed:

Based on my exploration, I can see:
- **Current color palette** (in style.css):
  - Background: dark navy (#0f1724, #0b1220)
  - Accent: teal/green (#6ee7b7)
  - Incoming messages: dark green (#0b6e4f)
  - Outgoing messages: dark gray (#1f2937)
  - Muted text: light gray (#9aa4b2)

- **Target**: Yellow and black palette (Peñarol style)

Now I'll write the comprehensive spec.

---

## PHASE 2 — WRITE THE SPEC

# Visual Palette Change to Yellow and Black

## Summary

This spec defines the migration of the test-inbox UI from a teal/green color palette to a yellow and black color scheme inspired by Peñarol's visual identity. The change affects `style.css` (the primary styling file) and involves replacing hardcoded colors with consistent CSS custom properties (tokens), improving contrast ratios for accessibility, and ensuring all interactive states (hover, focus) and UI elements (scrollbars, message bubbles) are visually coherent with the new palette.

## Problem Statement

The current `style.css` (lines 1-39) uses a teal/green accent palette with hardcoded color values scattered throughout the file:
- Line 2-8: CSS custom properties defined with teal/green colors (`--accent:#6ee7b7`, `--bubble-in:#0b6e4f`)
- Lines 12-37: Hardcoded colors mixed with token references (e.g., `#071023`, `#dbeafe`, `#042016`)
- Lines 36-37: Scrollbar styling uses generic `rgba(255,255,255,0.04)` without semantic meaning

**Concrete consequences:**
1. **Inconsistent color usage**: Some colors are tokenized, others are hardcoded, making bulk palette changes error-prone
2. **Accessibility gaps**: Current contrast ratios may not meet WCAG AA standards (e.g., muted text on dark backgrounds)
3. **Unclear visual hierarchy**: Incoming messages (green) and outgoing messages (gray) lack sufficient visual distinction
4. **Incomplete token coverage**: Interactive states (hover, focus) and scrollbars lack dedicated tokens, making them hard to maintain

## Goals / Non-Goals

### Goals
- All hardcoded color values in `style.css` are replaced with named CSS custom properties (tokens)
- Contrast ratios for text and interactive elements meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Hover and focus states are visually distinct and functional across all interactive elements (buttons, inputs, pills)
- Scrollbar styling uses the new color palette and is visually consistent with the design
- Incoming task messages are clearly distinguishable from outgoing messages using the new palette
- All color tokens are documented in a comment block at the top of `style.css`

### Non-Goals
- Changes to HTML structure or React component logic
- Modifications to `app.js`, `src/App.jsx`, or `src/main.jsx`
- Updates to `README.md` or other non-visual documentation
- Changes to layout, spacing, typography, or animation
- Modifications to `package.json`, build configuration, or other non-visual files

## Proposed Solution

### Architecture Overview

The solution introduces a comprehensive CSS token system with a yellow and black color palette. The design maintains the existing dark theme but replaces the teal accent with yellow (#FFD700 or similar) and uses black (#000000 or near-black) for contrast. The token structure includes:

1. **Base colors**: Background, card, text, and border colors
2. **Semantic tokens**: Accent (yellow), success/incoming (yellow-based), outgoing (neutral), muted (gray)
3. **Interactive tokens**: Hover, focus, active states for buttons and inputs
4. **Component tokens**: Scrollbar, glass effect, shadows

**Color palette mapping:**
```
Current → New (Yellow & Black)
--bg: #0f1724 → #0a0a0a (near-black)
--card: #0b1220 → #1a1a1a (dark gray)
--accent: #6ee7b7 → #FFD700 (gold/yellow)
--bubble-in: #0b6e4f → #2d2d00 (dark yellow-green, incoming)
--bubble-out: #1f2937 → #1a1a1a (dark gray, outgoing)
--muted: #9aa4b2 → #b0b0b0 (light gray)
```

### File Changes

#### `style.css`
**REMOVE:**
- Lines 1-9: Current CSS custom properties (`:root` block)
- All hardcoded color values throughout the file (e.g., `#071023`, `#dbeafe`, `#042016`, `#0f3e29`, `#083421`, `#dff7ea`)

**ADD:**
- New `:root` block with comprehensive yellow/black color tokens (lines 1-20)
- Hover and focus state tokens
- Scrollbar color tokens
- Accessibility-focused contrast tokens

**MODIFY:**
- Line 12: Replace `background:linear-gradient(180deg,#071023 0%, #081226 100%)` with gradient using new tokens
- Line 13: Replace hardcoded colors in `.container` with token references
- Line 17: Replace `#dbeafe` in `#processDef` with token
- Line 19: Replace `#042016` in `.primary` with token
- Line 24: Replace `#134b3a` in `.msg.in` gradient with token
- Line 32: Replace `#0f3e29`, `#083421`, `#dff7ea` in `.widget-boolean .pill` with tokens
- Lines 36-37: Replace scrollbar colors with tokens
- Add new rules for `:hover` and `:focus` states on buttons, inputs, and pills

### Key New Code

**New CSS token system (`:root` block):**
```css
:root {
  /* Base colors */
  --bg: #0a0a0a;
  --card: #1a1a1a;
  --text-primary: #f5f5f5;
  --text-secondary: #b0b0b0;
  
  /* Semantic colors */
  --accent: #FFD700;
  --accent-dark: #e6c200;
  --accent-light: #ffed4e;
  --incoming: #2d2d00;
  --incoming-light: #4d4d00;
  --outgoing: #1a1a1a;
  --border: rgba(255, 255, 255, 0.08);
  
  /* Interactive states */
  --hover-bg: rgba(255, 215, 0, 0.1);
  --focus-ring: #FFD700;
  --active-bg: rgba(255, 215, 0, 0.2);
  
  /* Component-specific */
  --glass: rgba(255, 255, 255, 0.03);
  --scrollbar-thumb: rgba(255, 215, 0, 0.3);
  --scrollbar-track: rgba(255, 255, 255, 0.02);
}
```

**Hover and focus states (new rules):**
```css
button:hover, input:hover, .pill:hover {
  background: var(--hover-bg);
  border-color: var(--focus-ring);
}

button:focus, input:focus, .pill:focus {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.primary:hover {
  background: var(--accent-dark);
}

.primary:focus {
  outline: 2px solid var(--text-primary);
  outline-offset: 2px;
}
```

**Updated scrollbar styling:**
```css
.chat::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 999px;
}

.chat::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}
```

### Constructor / Initialization Changes

No constructor or initialization changes are required. This is a pure CSS refactor with no JavaScript modifications.

## Migration Plan

### Step 1: Update CSS tokens
1. Replace the `:root` block in `style.css` (lines 1-9) with the new yellow/black token definitions
2. Verify all color values are now token references (no hardcoded hex values except in `:root`)

### Step 2: Update color references
1. Replace all hardcoded colors in selectors with `var(--token-name)` references
2. Update gradient backgrounds to use tokens
3. Update text colors to use `--text-primary` or `--text-secondary`

### Step 3: Add interactive states
1. Add `:hover` rules for buttons, inputs, and pills
2. Add `:focus` rules with outline styling for accessibility
3. Add `:active` rules for visual feedback

### Step 4: Update component-specific styling
1. Update `.msg.in` gradient to use `--incoming` and `--incoming-light`
2. Update `.msg.out` to use `--outgoing`
3. Update `.widget-boolean .pill` to use new tokens
4. Update scrollbar styling to use `--scrollbar-thumb` and `--scrollbar-track`

### Step 5: Testing
1. **Visual verification**: Open `index.html` or run `npm run dev` and verify all colors match the yellow/black palette
2. **Contrast testing**: Use a contrast checker (e.g., WebAIM) to verify WCAG AA compliance
3. **Interactive states**: Hover over buttons, inputs, and pills; verify visual feedback
4. **Scrollbar**: Verify scrollbar is visible and matches the palette
5. **Message distinction**: Verify incoming and outgoing messages are clearly different
6. **Responsive**: Test on mobile (max-width: 640px) to ensure colors are consistent

### Step 6: Documentation
1. Add a comment block at the top of `style.css` documenting the color palette and token usage
2. Include accessibility notes (contrast ratios, WCAG compliance)

## Risks

### Visual Regression
- **Risk**: Existing users may find the new palette jarring or less readable
- **Mitigation**: Conduct user testing before full rollout; ensure contrast ratios exceed WCAG AA minimums

### Accessibility Issues
- **Risk**: Yellow on dark backgrounds may have insufficient contrast for some users
- **Mitigation**: Verify all text/background combinations meet 4.5:1 contrast ratio; use `--accent-light` for text on dark backgrounds if needed

### Scrollbar Visibility
- **Risk**: Yellow scrollbar on dark background may be hard to see
- **Mitigation**: Use `--scrollbar-thumb: rgba(255, 215, 0, 0.5)` (higher opacity) if visibility is poor; test on multiple browsers

### Browser Compatibility
- **Risk**: CSS custom properties (`:root` variables) have limited support in older browsers (IE 11)
- **Mitigation**: This project uses modern tooling (Vite, React 18); IE 11 support is not required

### Incoming Message Distinction
- **Risk**: Dark yellow (`#2d2d00`) for incoming messages may not be distinct enough from black background
- **Mitigation**: Use a lighter yellow (`#4d4d00` or `#666600`) for the gradient; test with actual content

### Focus Ring Visibility
- **Risk**: Yellow focus ring on yellow accent button may be hard to see
- **Mitigation**: Use `--focus-ring: #FFD700` with sufficient outline width (2px) and offset (2px); consider using white for primary button focus

## Open Questions

1. **Exact yellow shade**: Should the primary yellow be `#FFD700` (gold), `#FFEB3B` (bright yellow), or `#FFC107` (amber)? This affects contrast and visual impact.
2. **Incoming message background**: Should incoming messages use a dark yellow-green (`#2d2d00`), a lighter yellow (`#4d4d00`), or a different approach (e.g., yellow border instead of background)?
3. **Text color on yellow backgrounds**: If any text appears on yellow backgrounds, should it be black (`#000000`) or dark gray (`#1a1a1a`)?
4. **Scrollbar opacity**: Should the scrollbar thumb use `rgba(255, 215, 0, 0.3)` (subtle) or `rgba(255, 215, 0, 0.5)` (more visible)?
5. **Primary button text color**: Should the primary button text remain dark (`#000000` or `#1a1a1a`) or change to match the new palette?