# 0038. Repositories provided via React context

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

Repositories could be created at app root and passed via props, provided via context, or left as a
module-scope singleton.

## Decision

A small **`RepositoriesProvider` context** supplies the repositories; consumers use `useRepositories()`.

## Consequences

- Standard composition-root pattern; avoids prop-drilling repositories through every component.
- Swapping in-memory adapters for a backend is a **one-line change at the provider**, honoring
  ADR 0004's seam intent.
- The provider is the app's single composition root.
