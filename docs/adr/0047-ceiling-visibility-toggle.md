# 0047. Ceiling visibility is a toggle; scene-gen stays deterministic

- **Status:** Accepted
- **Date:** 2025-10-06
- **Builds on:** 0040 (visual bar)

## Context

Users want to hide the ceiling to inspect the interior in detail. Toggling it raises an architecture
question: should scene-gen stop emitting ceilings, or should the toggle be a pure visibility change
at the render layer?

## Decision

- **scene-gen remains deterministic**: `buildScene` always emits the same scene, including ceilings.
- **Toggling is a pure visibility operation** (`group.visible = false`) applied by the render layer.
- All ceilings live in a **single root group named `ceiling`**, so visibility — for all rooms at once —
  is one lookup: `scene.getObjectByName('ceiling')!.visible = showCeiling`.

## Consequences

- Honors the module split: scene-gen builds geometry (ADR 0017); the viewer owns rendering/toggling.
- A toggle never changes *what* is generated, only *what is shown* — no rebuild, no diffing.
- The `ceiling` group mirrors the existing `walls` root group and is trivially testable.
- Supersedes the per-room ceiling placement from ADR 0040 for structural reasons (the mesh is still
  tagged `kind = 'ceiling'` and carries `userData.roomId`).
