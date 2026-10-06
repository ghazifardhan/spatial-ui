# 0014. Hand-authored schema fixtures for development

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

We need real-feeling apartment data to build against. Options: hand-authored fixtures, a random
schema generator, or both.

## Decision

**Hand-authored `ApartmentSchema` fixtures for v1** (2–3 carefully designed units), committed to the
repo. A dev-only schema generator is a v2 addition.

## Consequences

- Fixtures **double as test data and demo data**, so tests and the app exercise the same shapes.
- Hand-authoring surfaces schema-design problems early; randomness would hide them.
- A future generator must produce schemas that satisfy the *same* invariants the hand-authored ones
  do — reinforcing the schema as a real interface (ADR 0006).
