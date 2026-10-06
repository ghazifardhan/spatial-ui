# 0054. UI iconography: lucide-react instead of emoji glyphs

- **Status:** Accepted
- **Date:** 2025-10-07
- **Builds on:** 0049 (CSS Modules + tokens), 0050 (dark-elegant theme), 0053 (light/dark toggle)

## Context

Several shell/booking surfaces used emoji and Unicode glyphs as UI affordances: the theme toggle
(🌙 / ☀️), the room-list row icons (🛁 🛏️ 🍳 🛋️ and a ▦ fallback), the nav-reset button (⟲), the
zoom buttons (＋ / －), the booking success badge (✓), a date-range arrow (→), and a back-link arrow
(←). Emoji render inconsistently across platforms and fonts, ignore the design tokens (they carry
their own colour), and don't inherit `currentColor` or stroke weight — so they clash with the
token-driven dark/light themes and can't be tuned for size/weight.

## Decision

Use **`lucide-react`** for all UI iconography and remove the emoji/glyph stand-ins.

- Icons are imported **by name** (`import { Moon, Sun } from 'lucide-react'`), so the bundler
  tree-shakes to only the icons actually used.
- Icons are rendered as inline SVG that inherits `currentColor`, so they follow the theme tokens;
  their container (a flex/grid box) centres them, replacing the old text-glyph sizing.
- Sizing/weight are set per call site via `size` / `strokeWidth`, matching the surrounding UI scale.
- Purely decorative icons get `aria-hidden`; the actionable control already carries a real
  `aria-label`/`title`, so iconography never becomes the accessible name.

Emoji were also removed from the **room-icon** helper, which now returns a Lucide component per room
name with a neutral fallback (`LayoutGrid`) instead of a text marker.

## Consequences

- Icons are **consistent, theme-aware, and resolution-independent** — no more font/platform drift,
  and they recolour with `--color-text-*` in both themes.
- One small, well-known dependency (~tree-shaken to the handful of icons imported). It is a
  **shell/booking concern**; no domain, scene-gen, viewer, or interactions interface changes.
- Prose arrows in **doc comments** (`email → range → availability`) are notation, not UI, and are
  intentionally left as-is; only the rendered UI was converted.
- Future icon needs follow the same rule: import the named Lucide icon, size it locally, keep the
  accessible name on the control.
