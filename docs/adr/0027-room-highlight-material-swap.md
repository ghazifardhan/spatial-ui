# 0027. Room highlight by swapping mesh material

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Selected/hovered rooms need a visual highlight. Options: swap material references, add an overlay
slab, or use emissive tint on existing materials. Scene-gen emits untextured `THREE.Mesh` with a
shared default material.

## Decision

Highlight by **swapping each room mesh's material reference** to a shared highlight material and
**restoring the original on deselect**, using the per-room grouping (ADR 0019). A hover tint and a
stronger select tint are distinct shared materials.

## Consequences

- Needs no extra geometry and is fully reversible.
- An overlay slab was rejected: it risks z-fighting with the floor.
- Because scene-gen emits a *shared* material today, the highlighter must **store the original per
  mesh** before swapping, so restore is exact. (This is the one place interactions touches meshes.)
