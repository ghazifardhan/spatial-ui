# 0037. Desktop-first layout for v1

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The layout could be desktop-first (sidebar + canvas), fully responsive, or deferred entirely.

## Decision

**Desktop-first for v1** — the sidebar + canvas layout, tidied. Orbit controls already work on touch.

## Consequences

- Avoids scope creep in the final module.
- Full responsive behaviour (drawer / bottom sheet on narrow screens) is a **hardening concern** for
  a later pass, not v1.
