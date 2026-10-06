# 0048. Ceiling toggle: viewer-overlay control, off by default, local state

- **Status:** Accepted
- **Date:** 2025-10-06
- **Builds on:** 0047 (ceiling visibility toggle)

## Context

With the toggle mechanism settled (ADR 0047), we needed the UX shape: where the control lives, its
kind, its default, and whether the state persists.

## Decision

- **Control location:** an **overlay chip inside the viewer** (top-right corner), since it governs
  *how the 3D is viewed* and belongs with the canvas.
- **Kind:** a **binary on/off** toggle for v1 (fade / auto-hide-by-camera-angle are deferred).
- **Default:** **off** — ceilings hidden, so users land straight in interior-inspection mode.
- **State:** **local shell state**, reset when the unit changes. Not persisted to the URL for v1.

## Consequences

- Users immediately see the interior detail, which is the product's purpose.
- The control is decoupled from scene-gen; it just flips `group.visible` (ADR 0047).
- URL persistence (`?ceiling=1`) and camera-auto behaviour are deferred, addable behind the same
  toggle seam (the viewer already owns the ceiling group reference).
