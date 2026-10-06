# 0019. Scene-gen tags meshes with roomId, grouped per room

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Room-level selection (ADR 0013) requires raycasting to know which room a click hit. The generator
could leave that derivation to interactions, or bake it into the output.

## Decision

Scene-gen **tags every room-owned mesh with `mesh.userData.roomId`** and **organizes children into a
group per room**.

## Consequences

- Module #5 (interactions) becomes a thin raycaster: it reads `userData.roomId` instead of
  re-parsing the schema. Big leverage, small output-contract addition.
- The output contract — "room meshes carry `userData.roomId`" — is part of scene-gen's interface and
  must be tested.
- Keeps picking logic decoupled from geometry generation.
