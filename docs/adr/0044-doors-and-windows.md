# 0044. Openings render as real doors and framed windows

- **Status:** Accepted
- **Date:** 2025-10-06
- **Builds on:** 0018 (walls with openings), 0040 (visual bar)

## Context

Pass 1 (ADR 0040) fixed materials, walls and lighting, but windows were bare glass panes and doors
were just holes. Architecture still read as unfinished.

## Decision

Render openings as **real architectural elements**:

- **Windows**: a **frame** (mullion-surrounded), a **sill** below, and glazing subdivided into panes.
- **Doors**: a **frame** (jambs + head) plus a **leaf** swung slightly open, with a handle.

All built from boxes with palette materials, tagged `kind` = `door` | `window-frame` | `window-sill`
and carrying `userData.roomId` like every other room-owned mesh.

## Consequences

- Units now read as finished homes rather than grey shells.
- Opening geometry is the fiddliest part of scene-gen, so it lives in its own module (`openings.ts`)
  with pure layout helpers, tested directly (internal seam) — mirrors the `geometry.ts` approach.
- A future "closed/open door state" would be a parameter on the door builder, not a new module.
