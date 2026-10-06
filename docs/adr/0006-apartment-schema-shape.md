# 0006. ApartmentSchema shape (v1)

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

`ApartmentSchema` (ADR 0002) is the parametric description of a unit and is now a first-class
interface surface. We had to decide how expressive v1 is.

## Decision

v1 `ApartmentSchema` models:

- **Rooms as axis-aligned rectangles:**
  `{ id, name, rect: { x, z, w, d }, ceilingHeight }`
- **Wall openings** (doors/windows) referencing `{ room, wall, offset, width, height }`
- **Furniture placements:** `{ type, room, position, rotationY }`

**Deferred (not designed away):** arbitrary polygons, per-surface materials/colors, and other
customization. v2 may add them behind the same schema seam.

## Consequences

- Deep enough to render believable units; shallow enough to build and test module-by-module.
- The scene generator (ADR 0002) only needs to handle rectangles + wall openings in v1, which keeps
  its implementation focused while its interface stays stable when polygons arrive later.
- Furniture is referenced by `type`, so a furniture catalogue module can grow independently.
