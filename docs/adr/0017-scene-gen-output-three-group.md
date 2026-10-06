# 0017. Scene generator output is a THREE.Group

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The scene generator's output type could be a plain engine-agnostic description (geometry-intent
data) or an actual `THREE.Group` scene graph. ADR 0010 says we test the *scene graph*, not pixels.

## Decision

The scene generator produces an **actual `THREE.Group`**, tested **structurally** (inspect
`.children`, positions, geometry parameters) via jsdom/node without a WebGL context.

## Consequences

- Honest to its name: it *is* the scene generator; the viewer stays thin.
- Geometry knowledge (boxes, positions) lives in scene-gen, not leaked into the viewer — good
  locality (Module #3 owns it; Module #4 just mounts it).
- Tests assert on three.js objects (which are constructible in node), not on rendered output.
- The alternative (plain description data) was rejected: it would push geometry construction into
  the viewer, splitting the concern across two modules.
