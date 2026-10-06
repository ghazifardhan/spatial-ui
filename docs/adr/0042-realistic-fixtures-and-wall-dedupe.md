# 0042. Realistic fixtures with deduplicated shared boundaries

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The original fixtures (ADR 0014) had rooms placed as separate rectangles with **doubled walls** at
shared boundaries — rooms only "touched" at edges, so two walls abutted, which reads as wrong in 3D.
Rendering quality also depends on layouts that make sense (kitchen adjoining living room, bathroom
beside a bedroom).

## Decision

**Rework the fixtures into realistic layouts** and add a **wall-deduplication pass** in scene-gen so
shared room boundaries produce a single wall, not two.

The fixtures remain hand-authored (ADR 0014) and continue to double as test data; the existing
invariant test is extended to check **no doubled interior walls**.

## Consequences

- Supersedes the room layout of ADR 0014 (the "no Blender, hand-authored fixtures" principle stands).
- Fixes the most visible architectural artifact: interior double-walls.
- Wall deduplication keys on the **geometric wall segment** (axis + fixed coordinate + span), so
  coincident segments from different rooms collapse to one mesh.
- Fixtures must keep rooms flush at shared edges for dedupe to apply; the invariant test enforces it.
