# 0053. Light/dark theme toggle

- **Status:** Accepted
- **Date:** 2025-10-06
- **Builds on:** 0049 (CSS Modules + tokens), 0050 (dark-elegant theme), 0038 (repositories context)

## Context

ADR 0050 committed to a **dark-elegant** shell theme, and noted that "a light theme could be added
later by swapping the token values, not the components." Users expect to be able to choose light or
dark (many prefer light in bright rooms, and accessibility guidance favours honouring the OS
setting). The 3D interior itself is bright; a light chrome is a legitimate preference.

We needed a theme mechanism that:

- keeps the existing dark look unchanged,
- stays within the token layer (no per-component colours, no new styling library — ADR 0049),
- honours `prefers-color-scheme` as the default, remembers an explicit choice, and shows no flash of
  the wrong theme on load,
- keeps theming a **shell** concern (no theme state leaks into domain / scene-gen / viewer).

## Decision

A **two-theme, token-override** model:

- `data-theme="dark"` (the `:root` defaults) and `data-theme="light"` (an override block in
  `tokens.css`). The attribute is set on `<html>`. Components only reference `--color-*` tokens, so
  flipping the attribute re-themes the entire shell with no component changes.
- A small **shell theme module** (`src/shell/theme.ts`) owns the model as pure, testable functions:
  `resolveInitialTheme({ stored, prefersLight })` (explicit choice wins, else OS preference),
  `readStoredTheme` / `writeStoredTheme` (localStorage, storage-failure tolerant), and `applyTheme`
  (the single DOM write). A `ThemeProvider` + `useTheme` (React context) hold the one piece of state;
  a `ThemeToggle` (real `<button>`, `aria-pressed`) lives in the left-nav footer.
- **No flash:** an inline, dependency-free bootstrap `<script>` in `index.html` sets `data-theme`
  before the app bundle loads, mirroring `resolveInitialTheme`. The React hook resolves the same
  value on first render, so the two can never disagree.
- While the user has **not** made an explicit choice, the shell follows live OS changes; once they
  toggle, that choice is persisted and becomes authoritative.
- The 3D canvas backdrop is themed by reading the `--viewer-bg` token in the shell and passing it to
  the viewer's existing `background` prop (ADR 0024) — the viewer stays theme-agnostic.

## Consequences

- Adding the light theme touched **zero** component render logic for colour: only tokens, plus the
  toggle. New tokens absorb the few previously-inlined literals (glass hairlines, on-accent text,
  scrollbar hover, semantic borders) so the whole shell — nav, sidebars, room list, booking panel,
  buttons, skeletons, scrollbars, focus ring — reads correctly in both themes.
- Dark-mode output is unchanged: the `:root` colour tokens keep their exact previous values, and the
  new tokens default to the literals they replaced.
- The toggle is keyboard-operable and announces state via `aria-pressed` / `aria-label`; the theme
  cross-fade is motion-safe (disabled under `prefers-reduced-motion`, per the existing block).
- Theme state lives only in the shell; the domain → scene-gen → viewer dependency direction is
  preserved. The viewer gains no theme awareness — it receives a colour, exactly as before.
- If a third theme is ever needed, it is another `[data-theme="..."]` override block plus its values;
  no component edits.
