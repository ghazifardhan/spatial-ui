# 0055. Hovered-room tooltip in the 3D view

- **Status:** Accepted
- **Date:** 2026-10-07
- **Builds on:** 0019 (scene-gen room tagging), 0025 (selection state in the shell), 0028 (hover and
  select), 0048 (viewer overlay slot), 0049 (CSS Modules + tokens)

## Context

The 3D view is the product's headline feature, but a room's **name** was only discoverable
indirectly: hovering tinted the room (ADR 0028) and clicking selected it, and the sidebar then
showed the name. Nothing labelled the room *in place* while the pointer was over it, so a user
probing the model had to click (or cross-reference the sidebar) to learn what a highlighted volume
actually was. The mesh already carries its `roomId` (ADR 0019), so the missing piece was a way to
turn that id into a visible label at the cursor.

## Decision

Add a **hovered-room tooltip** to the viewer overlay:

- **Data flow (picking stays name-agnostic).** `ScenePicker` gains one optional callback,
  `onPointerRoom(roomId | null, clientX, clientY)`, fired from the same `onPointerMove` raycast that
  drives the hover tint — and also from `onPointerOut` with a `null` id. It reports the resolved
  `roomId` **plus the pointer's viewport coordinates**; it does *not* know room names, and it fires
  on every move (the caller needs live coordinates even when the room id is unchanged).
- **Name resolution lives in the shell.** `ApartmentScene` holds the hovered state
  (`{ roomId, x, y } | null`) and resolves the id to a human name from `apartment.schema.rooms`.
  Room names never enter the `interactions` module.
- **Clearing is twofold, because "left the room" is not the same as "left the model."** The picker's
  out-report handles leaving *a room* (onto empty space); but R3F's per-object `onPointerOut` can
  miss or go stale when the cursor exits the canvas edge entirely. So the shell also clears on
  `onPointerLeave` of a thin wrapper around the viewer — the pointer leaving the whole 3D area always
  drops the tooltip.
- **Presentation is a shell overlay.** A small `RoomTooltip` component renders in the viewer's
  existing overlay slot (ADR 0048, alongside the ceiling toggle and navigation controls) as a
  non-interactive chip (`pointer-events: none`, `role="tooltip"`) anchored at the cursor. `null`
  renders nothing. Because it must be positioned against a cursor that lives in viewport space, it
  is absolutely positioned there rather than clipped to the overlay box.

Styling is CSS Modules + tokens (ADR 0049), including a motion-safe entry animation
(`prefers-reduced-motion` disables it).

## Consequences

- Rooms are **self-labelling** in the 3D view: hovering a bedroom, bathroom, kitchen, etc. shows its
  name at the cursor, so the model reads without a click or a sidebar lookup. (The two-bedroom
  fixture's `Master Bedroom` / `Second Bedroom` both render, satisfying the "click Bedroom → show
  Bedroom" requirement.)
- The **dependency direction is preserved**: `interactions` still depends only on
  `scene-gen`/three.js and reports ids + coordinates; the shell owns names and DOM. The viewer gains
  no new props — the tooltip rides the existing `overlay` slot (ADR 0048).
- **No React state leaks into navigation** (ADR 0012): the tooltip is shell display state, unrelated
  to camera state, and it never re-renders the canvas.
- The picker's extra callback is **optional**, so existing callers (and the hover-tint tests) are
  unaffected.
- Deferred: touch/keyboard tooltip affordances (touch has no hover), rich content (dimensions,
  actions), and edge-aware flipping when the cursor nears the viewport edge — each addable behind the
  same overlay seam.
