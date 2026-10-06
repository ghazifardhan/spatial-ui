# 0007. World coordinate system and units

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

three.js has conventional defaults, and schema dimensions need a single canonical interpretation so
nobody guesses.

## Decision

- **Handedness/axes:** three.js canonical — **Y-up, right-handed**.
- **Unit of measure:** **meters**, everywhere. All `ApartmentSchema` dimensions are in meters.
- **Origin:** each unit has **its own origin at its entrance**. In v1 units are independent scenes —
  there is no shared building shell.

A shared building/floor model (units placed in a common origin) is a **v2 concern**.

## Consequences

- Schema authors and the scene generator share one unambiguous frame of reference.
- "Independent scenes" keeps the viewer module simple: it mounts one generated unit at a time.
- Placing units into a shared building later is additive (a parent transform), not a rewrite.
