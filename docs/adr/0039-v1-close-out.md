# 0039. v1 close-out: wire cleanly, code-split the viewer, write a README

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The final module could just wire the seven modules, or additionally harden the app for close-out.

## Decision

Wire the modules cleanly, **code-split the viewer** (three.js dominates the bundle), and write a
short **README**. A full e2e test framework is **out of scope** (94 unit/component tests already).

## Consequences

- Lazy-loading the viewer (`React.lazy` + `Suspense`) cuts the initial bundle substantially, since
  three.js + R3F is the bulk of it.
- The README gives a new reader the product, the module map, and the ADR trail.
- e2e tooling (Playwright etc.) is knowingly deferred; the current test pyramid covers the pure and
  component logic where regressions are most likely.
