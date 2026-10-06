# 0051. Sidebar UX additions: room list, price summary, breadcrumb, skeleton

- **Status:** Accepted
- **Date:** 2025-10-06
- **Builds on:** 0013 (selection), 0032 (booking), 0049 (styling)

## Context

Beyond looking rigid, the sidebars lacked useful affordances. Several low-risk additions make the
product feel real and give text-side access to what was 3D-only.

## Decision

Add to the shell:

- **Clickable room list** in the unit sidebar — selecting a room from the list highlights it in 3D,
  and vice-versa (two-way, using the existing shell selection state, ADR 0025/0013).
- **Price summary** in booking — nights × nightly price = total, from existing data.
- **Breadcrumb / back** in the unit header.
- **Loading skeleton** while a unit's scene loads (the 3D chunk is lazily imported, ADR 0039).

## Consequences

- Room selection is reachable from both text and 3D, reinforcing ADR 0013's decoupling (selection
  state stays in the shell; both surfaces read/write it).
- Price summary makes the booking feel tangible without touching the domain (pure derived display).
- The skeleton covers the lazy-load gap that ADR 0039 introduced.
- Motion is smooth but respects `prefers-reduced-motion` (ADR 0049).
