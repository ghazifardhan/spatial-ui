# 0052. In-viewer navigation UI: imperative zoom/pan/orbit controls + a how-to legend

- **Status:** Accepted
- **Date:** 2025-10-06
- **Builds on:** 0012 (viewer owns navigation state), 0021 (imperative handle), 0022 (OrbitControls),
  0048 (viewer overlay slot), 0049 (CSS Modules)

## Context

The 3D view is orbit-first (ADR 0022), but navigation was **gesture-only and undiscoverable**: a
user had to already know that drag orbits, scroll zooms, and right-drag pans. There were no on-screen
affordances for zoom or pan, and no hint of what the mouse does. This is the product's headline
feature (the spatial walkthrough), so its controls must be self-evident.

## Decision

Add an **in-viewer navigation UI** that (a) documents the gestures and (b) offers clickable controls
for users who prefer not to, or cannot, use gestures.

- **Where:** the viewer's existing overlay slot (ADR 0048), anchored **bottom-left** (the ceiling
  toggle keeps top-right). Both live in one passthrough overlay layer.
- **Legend:** a compact, always-visible hint — *drag to orbit*, *scroll to zoom*, *⇧/right-drag to
  pan*. Read-only, `pointer-events: none`.
- **Controls:** a button cluster — orbit arrows, a pan pad, **zoom in/out**, and **reset view**.
- **Mechanism:** every control drives the viewer through the **imperative handle** (ADR 0021) —
  `zoomBy`, `panBy`, `orbitBy`, `resetView`. The handle writes a `CameraRequest` that `SceneContents`
  applies inside `useFrame`. Camera/navigation state never enters React (ADR 0012).

Three new request kinds are added to the internal bridge (`zoom`, `pan`, `orbit`) alongside the
existing `reset` / `focus`:

- `zoom` dollies along the current view direction, clamped to `[MIN_DISTANCE, MAX_DISTANCE]`.
- `pan` slides the target and camera in the view plane; the caller passes a **fraction of the
  current orbit distance** so the same button feels consistent at any zoom.
- `orbit` rotates around the target by azimuth/polar deltas, clamped to the OrbitControls polar
  range so it can't flip through the poles.

Styling is CSS Modules + tokens (ADR 0049), matching the dark theme (ADR 0050).

## Consequences

- The walkthrough is **discoverable** — the gestures are stated, and every gesture has a button.
- Navigation stays **out of React state** (ADR 0012); the UI holds no camera state, only a ref to
  the handle. No re-renders while navigating.
- The viewer stays **interaction-agnostic** (ADR 0023): the controls live in the shell's
  `NavigationControls` and talk only to the public handle. A future first-person mode swaps the
  viewer's internal strategy without changing this UI's contract (ADR 0011).
- Pan uses a **relative fraction**, not world units, so it needs no knowledge of scene scale.
- Touch/trackpad users keep native gestures; the buttons are additive, not a replacement.
- Deferred: a full navigator/minimap, zoom-to-cursor, and animated (eased) button transitions —
  each addable behind the same handle seam.
