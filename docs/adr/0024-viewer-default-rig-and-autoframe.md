# 0024. Viewer ships a default lighting rig and auto-frames the camera

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The viewer could require the caller to supply lighting, expose full lighting config, or ship a
sensible default.

## Decision

The viewer ships **a default rig** — ambient + directional light, neutral background, and the camera
**auto-framed to the scene's bounding box** — with a couple of props to override (e.g. `background`,
`showGrid`).

## Consequences

- Any unit "just works" on first mount; the shell never computes camera positions.
- Deep module: small props, large sensible behaviour (framing math hidden inside).
- Full lighting configurability is deferred; add specific props only when a real need appears.
