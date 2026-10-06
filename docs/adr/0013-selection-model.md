# 0013. Selection model: room-level, highlight-only in v1

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Selection granularity (unit vs room) and what "selected" *does* in v1 needed settling.

## Decision

- **Choosing a unit** happens **outside** the 3D canvas (a list/grid) — you enter 3D already "in" a
  unit. The canvas is per-unit.
- **Selection inside the canvas is room-level:** click a room → highlight it → show its name/details
  in an info panel.
- **"Selected" = highlight + info panel** in v1. Booking is a **separate explicit action**, never a
  side effect of selecting.

## Consequences

- Clear separation: unit picking (shell/booking modules) vs room picking (interactions module).
- Interaction logic that grows complex should be extracted into a pure module so it stays
  unit-testable (ADR 0010 signal).
- No hidden coupling between hovering a room and creating a booking — good for predictability.
