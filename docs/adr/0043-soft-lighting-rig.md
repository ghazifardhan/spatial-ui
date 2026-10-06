# 0043. Soft lighting rig with shadows

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The v1 default rig (ADR 0024) was flat — a plain ambient + directional light with no shadow tuning
and a neutral dark background, which made interiors look grey and lifeless.

## Decision

Upgrade the viewer's default rig to a **warmer, softer setup**: lower ambient, a key directional
light with tuned shadows, a subtle fill, and a background/ground tone that reads like daylight.

## Consequences

- Supersedes the lighting values of ADR 0024 (the "default rig with a couple of override props"
  interface stands).
- Furniture and walls now cast/receive shadows, which sells the spatial depth.
- Shadow map size and bias are tuned to avoid acne and peter-panning at room scale.
