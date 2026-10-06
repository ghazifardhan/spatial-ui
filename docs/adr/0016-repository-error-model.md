# 0016. Repository error model: reject for errors, null for not-found

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

When a repository lookup fails or finds nothing, the interface needs a consistent error mode.

## Decision

- **Reject** the promise for real errors (I/O failure, malformed data, future backend errors).
- **Resolve to `null`** for a well-formed "not found" — e.g. `findById(id): Promise<Apartment | null>`.

A `Result<T, E>` union (the pattern used by `availability`) is **reserved for business rules**, not
data access.

## Consequences

- `Promise<Apartment | null>` is idiomatic and unsurprising for data access; callers branch on
  `null` for absence and `catch` for failure.
- Consistency: `availability` returns a Result because a *rule* produces a reasoned outcome;
  the repository returns data-or-null because it has no business opinion (ADR 0008).
- Easy to test both branches: resolve `null` vs reject.
