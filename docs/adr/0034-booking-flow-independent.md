# 0034. Booking flow is independent of the 3D scene

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Booking could couple to room selection ("book the room you're viewing") or stand alone.

## Decision

Booking-flow is **fully independent of the viewer and interactions**. It takes an `Apartment` and
knows nothing about rooms or 3D. The **shell** composes: it holds the active apartment and passes it
to both the viewer and the booking panel.

## Consequences

- Reinforces ADR 0013's deliberate decoupling of selection and booking.
- booking-flow is reusable and testable in isolation (no canvas, no WebGL, no scene).
- Any future "book this specific configuration" feature would be a shell-level composition, not a
  change to booking-flow's interface.
