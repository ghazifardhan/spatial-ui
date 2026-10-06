# 0010. Testing strategy per module

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

We needed a test bar per module — specifically whether to unit-test WebGL output.

## Decision

- **Strong unit tests** through the interface for **domain**, **repository** (mock adapter), and
  **scene-gen** — all pure or interface-testable.
- **viewer / interactions:** a **thin smoke test + manual review** in v1. We test the *scene graph*
  that scene-gen produces (a plain data structure), not rendered pixels.

## Consequences

- High-ROI testing: data structures and pure logic are tested precisely; opaque rendered output is
  not chased.
- Unit-testing WebGL output is explicitly rejected as low ROI for v1.
- If interaction logic grows complex, it should be extracted into a pure module so it becomes
  unit-testable — a signal to watch.
