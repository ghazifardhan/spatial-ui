# 0030. Date input is two native date fields

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The booking flow needs a date-range input. Options: native `<input type="date">` pair, a custom
calendar, or a date-picker library.

## Decision

**Two native `<input type="date">` fields** (start / end) for v1, validated through the domain module.

## Consequences

- No added dependency (ADR 0002 spirit); accessibility comes for free.
- The date picker is not the product differentiator — the 3D view is.
- A calendar/date-picker library can slot in behind the same component state later without touching
  the availability or submission logic.
