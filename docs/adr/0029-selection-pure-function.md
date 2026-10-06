# 0029. Selection decision extracted as a pure function, unit-tested

- **Status:** Accepted
- **Date:** 2026-10-06

## Context

ADR 0010 says render-heavy modules get a thin smoke test; and it flags that complex interaction
logic should be **extracted into a pure module** so it becomes unit-testable. The core interaction
decision — "given a raycast hit, which roomId is selected?" — is pure.

## Decision

Extract that decision into a **pure `resolveSelection(hit)` → `string | null`** function (wrapping
scene-gen's `roomIdOf`) and **unit-test it**. The R3F pointer-event glue stays smoke-tested.

## Consequences

- Honors ADR 0010's extraction signal.
- The pure function is trivial to test (feed an object, assert the id).
- Pointer wiring (`onPointerMove`/`onClick`) is thin enough that manual review suffices.
