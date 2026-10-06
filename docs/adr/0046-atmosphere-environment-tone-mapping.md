# 0046. Atmosphere: environment lighting, tone mapping, contact shadows

- **Status:** Accepted
- **Date:** 2025-10-06
- **Builds on:** 0024 (default rig), 0043 (soft lighting)

## Context

Pass 1 improved the light rig, but a physically-plausible interior also needs image-based ambient
light, filmic tone mapping, and grounded furniture. Without these, PBR materials look flat/plasticky.

## Decision

Add to the viewer:

- **Environment map** (drei `<Environment>` with a neutral studio/room preset) for IBL — gives
  materials believable reflections and ambient fill.
- **Filmic tone mapping** (ACES) + sRGB output on the renderer.
- **Soft contact shadows** under furniture via a drei `<ContactShadows>` layer, so pieces don't
  appear to float.

## Consequences

- Supersedes the bare lighting of ADR 0024/0043 for perceived realism.
- Environment + tone mapping are renderer-level and live in the viewer (ADR 0012: the viewer owns
  rendering), not in scene-gen.
- Contact shadows are a cheap, robust alternative to full shadow tuning on every mesh.
