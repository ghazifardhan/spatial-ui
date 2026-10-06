# 0049. UI styling: CSS Modules with design tokens

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The shell UI so far is inline `style={{}}` objects — no CSS files, no hover/focus states, no
transitions, no custom scrollbars, no animations. This is why it reads as rigid. We needed a styling
approach and (implicitly) our first CSS.

## Decision

Adopt **CSS Modules** (`.module.css`, Vite built-in, scoped) plus a **design-token layer** exposed as
CSS custom properties (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--transition-*`).

- Tokens live in one global stylesheet imported once (`src/shell/styles/tokens.css`).
- Each component gets a co-located `*.module.css`.
- No UI library (Tailwind/Mantine) — unnecessary at this scale and adds tooling.

## Consequences

- Enables what inline styles cannot: `:hover`, `:focus-visible`, `@media`, transitions, keyframes,
  custom scrollbars, skeleton shimmer.
- Tokens are the single place to tune the look; components reference variables, not literals.
- Motion respects `prefers-reduced-motion`.
- Supersedes the inline-style approach of the earlier shell components (ADR 0037's layout shape
  stands; only the *styling mechanism* changes).
