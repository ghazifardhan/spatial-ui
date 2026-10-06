# 0041. Solid PBR materials from a shared palette

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Material strategy options: solid PBR colours, procedurally-generated textures, or image texture
files. Textures need assets or generation code; solids need only a palette.

## Decision

Use **solid `MeshStandardMaterial` PBR materials from a shared palette** for v1. One palette module
defines wall / floor / ceiling / glass / furniture-surface materials with sensible roughness and
metalness. Procedural textures are deferred to a later stage if solids prove insufficient.

## Consequences

- Supersedes the "bare default material" state of ADR 0020.
- The palette is a single place to tune the look; scene-gen reads named materials from it.
- Materials are shared instances (created once), which also makes the highlighter's
  save-and-restore (ADR 0027) meaningful — originals are stable references.
- Image/procedural textures can slot in behind the same "ask the palette for a material" seam.
