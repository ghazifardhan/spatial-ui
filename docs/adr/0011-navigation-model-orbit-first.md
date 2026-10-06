# 0011. Navigation model: orbit-first

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

"3D spatial walkthrough" could mean orbit/turntable navigation, first-person WASD walking with
collision, or both toggleable. This shapes the viewer and interactions modules significantly.

## Decision

**Orbit-first.** v1 navigation is an orbit / turntable camera around a unit. First-person walk is a
**v2 feature**, addable behind the same viewer seam. It is deferred — not designed away.

## Consequences

- Robust, mobile-friendly, and needs **no collision detection or navigation mesh** — two large
  modules avoided in v1.
- The viewer's camera interface must be designed so a first-person mode can be added without
  changing callers (e.g. a navigation-strategy abstraction inside the viewer).
- If first-person arrives, its collision/nav-mesh concerns live *inside* the viewer, not in
  interactions.
