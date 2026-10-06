# 0009. v1 module map and build order

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The project is built "module by module" (codebase-design: deep modules at clean seams). We needed an
explicit module map and a build order so each module is finished before the next begins.

## Decision

Seven modules, built in this order (domain first — everything depends on it; shell last — it only
wires):

```
1. domain        — types: ApartmentSchema, Apartment, Booking, DateRange, Availability rules
2. repository    — ApartmentRepository + BookingRepository interfaces + in-memory adapters
3. scene-gen     — ApartmentSchema → three.js scene graph (the deep 3D module)
4. viewer        — R3F canvas, camera/navigation, mounts a generated scene
5. interactions  — click/hover selection of units & rooms, raycasting, "view this unit"
6. booking-flow  — date picking, availability, request submission (uses repository + domain)
7. shell         — app layout, routing, wiring modules together
```

## Consequences

- Each module has a clear dependency direction: later modules depend on earlier ones, never the
  reverse. `domain` depends on nothing.
- Parallelizable later, but v1 is deliberately sequential to keep interfaces honest.
- This map is the working plan; changes are recorded as ADRs that supersede it.
