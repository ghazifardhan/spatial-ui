# 0040. Visual quality bar: modern-minimalist listing look

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The first generated scenes looked poor: everything was the default grey material, furniture was bare
boxes, architecture had doubled walls, and lighting was flat. For a *real booking product* (ADR 0001)
where the 3D view is the differentiator, the spatial quality is the product.

## Decision

Target a **modern-minimalist listing aesthetic** (the Airbnb/booking.com feel): white and warm-grey
walls, light wood floors, warm-neutral accents, soft directional light with shadows.

Improvements are applied in **staged passes**, highest visual impact first:

1. **Materials + lighting** (this pass) — biggest impact per hour.
2. **Architecture** — dedupe double-walls, optional ceiling, real window glass.
3. **Furniture shapes** — beyond bare boxes.
4. **Atmosphere** — final polish.

Each stage is verified (typecheck / lint / test / build) and recorded as its own ADR.

## Consequences

- Supersedes the "placeholder-ness" allowed by ADR 0020 and the bare default rig of ADR 0024 for
  anything that affects perceived quality.
- Introduces a **material palette** as a first-class concept in scene-gen.
- The fixtures are reworked to realistic layouts (ADR 0041) since rendering quality is meaningless
  over nonsensical layouts.
