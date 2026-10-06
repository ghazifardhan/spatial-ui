# 0023. Viewer receives a built THREE.Group, not a schema

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The viewer could take an `ApartmentSchema` (and call `buildScene`), a pre-built `THREE.Group`, or an
`apartmentId` (and pull from the repository).

## Decision

`<Viewer>` takes a **pre-built `THREE.Group`** (scene-gen's output) via a `scene` prop.

## Consequences

- **Decouples the modules:** the viewer does not import `domain` or `repository`; scene-gen does not
  import the viewer. Composition happens one level up (`buildScene(schema)` → `<Viewer scene={g} />`).
- Scene-gen remains testable without a viewer; the viewer remains testable with a stub group.
- The viewer stays a pure "mount + navigate" module with a small interface.
