# 0008. Availability is a pure module; repository only fetches

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Booking (ADR 0001, glossary) needs availability. Options: derive free dates from bookings alone;
carry explicit blackout periods on the unit; or both. We also had to decide whose job overlap
validation is.

## Decision

- **Both sources of truth:** bookings *and* explicit `unavailableDates` / blackout periods on a unit.
- A **pure `Availability` module** owns the rules: date-range overlap detection and validation.
- The **repository is a dumb data seam**: it only *fetches* bookings and blackouts. It does not
  decide availability.

## Consequences

- Availability logic is a **deep, pure, trivially testable** module — no I/O, no async.
- The repository stays shallow (a data access adapter), which keeps its interface small.
- Callers compose: `repository.fetchBookings(unitId)` + unit blackouts → `availability.isAvailable(range)`.
- Because `Availability` is pure, the same rules run client- and (later) server-side without change.
