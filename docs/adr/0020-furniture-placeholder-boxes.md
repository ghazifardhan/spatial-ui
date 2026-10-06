# 0020. Furniture rendered as placeholder boxes from a catalogue

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Furniture is referenced by `type` (a catalogue key). v1 could render placeholder boxes, skip
furniture geometry, or load per-type glTF models.

## Decision

**Placeholder boxes sized from a small furniture catalogue module** (`{ type: { width, height,
depth } }`). glTF loading is deferred behind the same seam — the catalogue is where a model loader
would later slot in.

## Consequences

- Rooms read as furnished without any art assets, matching ADR 0002's no-Blender stance.
- The catalogue is its own tiny module: an unknown `type` must have a defined behaviour (fallback
  box + a warning), which is part of scene-gen's interface.
- glTF support becomes an adapter swap inside the catalogue, not a caller-facing change.
