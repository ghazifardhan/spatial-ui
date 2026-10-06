# 0031. Availability composed in a useAvailability hook

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

`availability.check` (ADR 0008) needs fetched bookings + blackouts. The fetch-and-compose step could
live inline in the component or in a small hook.

## Decision

A **`useAvailability(apartment, range)` hook** encapsulates fetching (via the repository) and
composing with the pure rule.

## Consequences

- The booking component stays declarative; the fetch+compose logic is isolated and interchangeable.
- Keeps the pure domain rule (ADR 0008) as the single source of truth for availability.
- The hook is the natural place to later add caching / server-validated availability.
