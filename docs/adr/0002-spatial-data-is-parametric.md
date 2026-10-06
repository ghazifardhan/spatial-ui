# 0002. Spatial data is parametric (procedural)

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Apartments need to be represented in 3D. The three realistic approaches were:

- **(a) Procedural / parametric** — define rooms via a schema (dimensions, room list, furniture
  placements) and let three.js build the scene.
- **(b) Imported 3D models** — author `.glb`/`.gltf` files in Blender and load them.
- **(c) Floorplan-based** — take a 2D plan and extrude it into 3D.

This was the single biggest architectural fork for the 3D side.

## Decision

Spatial data is **parametric/procedural** for v1. An apartment is described by a schema
(rooms, dimensions, furniture placements) and the scene is generated from that schema in code.

## Consequences

- **Makes "modules one by one" tractable:** the schema is the interface; the generator is the
  implementation. We can build and test the generator without any art assets.
- **No Blender artist required** — units are defined in code/JSON.
- **One schema generates many units**, which fits a real listing product.
- **The schema is now a first-class interface surface.** It needs the same interface discipline
  (invariants, ordering constraints, error modes) as any other module — see the glossary for
  `ApartmentSchema`.
- Imported models (b) and floorplan extrusion (c) remain **possible behind the same seam**: a
  future `SceneSource` adapter could satisfy procedural generation today and model-loading later.
  We do not build that adapter now (one adapter = hypothetical seam).
