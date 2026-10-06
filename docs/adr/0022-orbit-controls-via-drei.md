# 0022. Orbit controls via drei's OrbitControls

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Navigation is orbit-first (ADR 0011). Control source options: drei's `<OrbitControls>`, hand-rolled
`useFrame` math, or drei's newer `<CameraControls>`.

## Decision

Use **`@react-three/drei`'s `<OrbitControls>`** in v1.

## Consequences

- Already a dependency; battle-tested; gives touch/desktop gestures, damping, and targets for free.
- The viewer **wraps** the controls, so a future first-person mode swaps the navigation strategy
  *inside* the viewer without changing the viewer's interface (ADR 0011).
- `<CameraControls>` (more powerful, imperative) is deferred until a concrete need appears.
