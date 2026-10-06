# 0015. Repository interface is Promise-based from day one

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

ADR 0004 established a repository seam and warned that the interface must anticipate async I/O even
though the v1 mock adapter is synchronous. We had to choose whether the interface returns
`Promise<T>` now or is synchronous and made async later.

## Decision

**`ApartmentRepository` / `BookingRepository` are Promise-based from day one.** The in-memory mock
adapters return resolved promises.

## Consequences

- Swapping in a real backend/HTTP adapter later does **not** change a single call site — the entire
  point of the seam (ADR 0004).
- The small cost is that the mock is `async` even though it is instant.
- A synchronous interface was rejected explicitly: making it async later is a breaking, spread-out
  rewrite.
