# 0025. Selected-room state lives in React state, in the shell

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

ADR 0012 keeps *camera* state out of React (per-frame churn). Selection is different: it changes on
click, not per frame. Where should selected-room state live?

## Decision

**Selection is React state**, owned by the **shell**. Camera → ref; discrete selection → state. The
selected `roomId` lives in the shell so booking/shell can read it.

## Consequences

- The correct distinction is made explicit: per-frame data → ref, discrete data → state.
- Selection changes re-render the info panel, which is exactly when we want a render.
- Interactions *reports* selection (see ADR 0026); it does not own the state.
