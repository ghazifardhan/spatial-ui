# 0028. Both hover and select in v1

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

In 3D, clickability is invisible. Should v1 implement hover feedback as well as selection?

## Decision

Implement **both**: hover (light tint + pointer cursor) and select (stronger tint, persists).

## Consequences

- Hover is the affordance that tells users rooms are clickable — important in 3D.
- Both share one raycast path (`roomIdOf`), so cost is low.
- Hover is transient (ref/low-priority), select is persistent (React state, ADR 0025).
