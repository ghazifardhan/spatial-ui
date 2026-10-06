# 0045. A richer furniture catalogue with dressed rooms

- **Status:** Accepted
- **Date:** 2025-10-06
- **Builds on:** 0020 (placeholder boxes), 0041 (palette)

## Context

Pass 1 gave furniture real materials but shapes were still near-boxes and rooms felt empty. A
beautiful listing interior needs recognizable furniture and "dressing" (rugs, plants, lamps, art).

## Decision

Extend the furniture system:

- **Recognizable silhouettes** for each type (sofas with arms/back cushions, beds with headboards,
  tables with legs, kitchens with cabinets + worktop, wardrobes, TVs on stands, plants, lamps).
- **Dressing types** that decorate a room: `rug`, `plant`, `floor-lamp`, `wall-art`, `dining-set`.

The catalogue (`furniture-catalogue.ts`) grows to include these, and the builder (`furniture.ts`)
composes each from primitive boxes/cylinders.

## Consequences

- Supersedes the "barely-more-than-a-box" shapes of ADR 0020 (the catalogue-of-types seam stands).
- Rooms become visually complete, which is the whole point of the 3D differentiator.
- Each new type is a new `case` in the builder plus a catalogue entry — the module stays deep (small
  interface: a placement in, a Group out).
