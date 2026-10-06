# 0004. Frontend-first with a repository seam

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The product is a real booking platform (ADR 0001), which implies eventual persistence, auth, and
payments. But v1 is frontend-focused and we want to build modules one by one. Should v1 start with
a backend, a BaaS, or no backend at all?

## Decision

**Frontend-only for v1**, with all data access placed behind a clean **repository seam**:

- An `ApartmentRepository` (and later `BookingRepository`) interface is the external seam.
- An **in-memory / local mock adapter** satisfies it now.
- A real backend adapter satisfies the same interface later — callers do not change.

This applies the codebase-design principle: *one adapter means a hypothetical seam, two adapters
means a real one.* We write the mock adapter now; the backend adapter is what makes the seam real.

## Consequences

- **Leverage:** every caller (and every test) crosses one interface; swapping mock → real backend is
  local, not spread across call sites.
- **Testability:** interfaces accept their dependencies (the repository is injected) and return
  results, so modules are testable without a server.
- **Constraint:** the repository interface is now load-bearing. Its shape must anticipate async
  I/O (throw-able failures, ordering, eventual consistency) even though the mock is synchronous —
  otherwise the real adapter breaks callers.
- Backend/BaaS choice is deferred and does not block v1.
