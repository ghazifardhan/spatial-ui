# 0026. Interactions module is controlled; reports selection via callback

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The interactions module could own selection state (exposed via context) or report it upward.

## Decision

Interactions is **controlled**: it takes an `onSelect` callback (e.g. `<ScenePicker
onSelect={(roomId) => …} />`) and does **not** own selection state.

## Consequences

- Interactions stays a **pure, thin translator**: "a pointer hit → which roomId". It uses scene-gen's
  `roomIdOf` (ADR 0019).
- The shell owns *what selection means* — maximum locality, minimal coupling.
- Easy to test: feed a hit, assert the callback.
