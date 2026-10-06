# 0012. Navigation state encapsulated in the viewer

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Camera/navigation state could be encapsulated inside the viewer module, or hoisted to app-level
state (React context/store). ADR 0003 flagged that per-frame render work must avoid React
re-render churn.

## Decision

**Navigation state lives inside the viewer module.** The viewer exposes a small imperative
interface (e.g. `viewer.focusOn(unitId)` / `viewer.resetView()`); interactions call through it.

## Consequences

- The viewer stays a **deep module with a small interface**; render concerns do not leak.
- Avoids React re-render churn on camera changes (ADR 0003 caveat) — hot-path camera updates use
  refs/imperative calls, not state.
- Other modules that need to influence the camera do so through the viewer's interface, preserving
  locality.
