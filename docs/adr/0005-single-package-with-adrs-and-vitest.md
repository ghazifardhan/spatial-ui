# 0005. Single package, with ADRs + glossary + Vitest from day one

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Decisions about repo shape (single package vs monorepo) and tooling (test runner, docs structure)
needed to be settled before scaffolding modules.

## Decision

- **Single package** (one Vite/TS app). No monorepo for v1.
- **Vitest** configured from the start.
- **`docs/adr/`** and **`docs/glossary.md`** created up front, because we are working in the
  grill-with-docs style (settled decisions become ADRs; precisely-defined terms become glossary rows).

## Consequences

- **YAGNI on the monorepo:** premature workspace structure adds ceremony with no payoff yet. It can
  be promoted to a monorepo later if a backend or shared package actually appears.
- Tests exist from day one, so the repository seam (ADR 0004) and scene generator (ADR 0002) can be
  tested through their interfaces as they are built.
- The glossary is a living artifact; terms are added the moment they are settled, not at the end.
