# 0018. Walls are segment boxes with openings cut out

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Rooms are rectangles. Walls could be emitted as simple full-height segment boxes, as boxes with
door/window gaps cut out, or as a single merged outline shell.

## Decision

Walls are **segment boxes with openings cut into them**: each wall splits into sub-boxes
below / above / beside each opening. Shared boundaries may produce cosmetic double-walls in v1.

## Consequences

- Doors and windows are **visibly real**, which is the point of a spatial walkthrough.
- Still straightforward geometry math: split a wall's run into spans around each opening.
- Cosmetic double-walls at shared room boundaries are accepted in v1; a future merging pass can
  deduplicate them without changing the module's interface.
- A merged-outline shell was rejected for v1 as significantly more code for less visible payoff.
