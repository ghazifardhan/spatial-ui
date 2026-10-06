# 0050. Dark-elegant shell theme

- **Status:** Accepted
- **Date:** 2025-10-06
- **Builds on:** 0049 (CSS Modules + tokens)

## Context

The 3D viewer now renders a bright, well-lit interior (ADR 0040–0046). The surrounding chrome needs a
visual direction that makes the canvas pop.

## Decision

A **dark-elegant theme**: charcoal/near-black surfaces with layered elevation, a calm blue accent,
soft glassmorphism on floating controls, generous spacing, and smooth transitions.

## Consequences

- The bright 3D content pops against the dark chrome.
- The existing blue accent is retained but softened into token-driven states (hover/active/focus).
- The theme is expressed entirely through tokens (ADR 0049), so a light theme could be added later by
  swapping the token values, not the components.
