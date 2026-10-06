# 0036. The URL is the source of truth for the active apartment

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

With routing (ADR 0035), the active apartment could be derived from the URL or held in component
state with the URL as a side-effect.

## Decision

The **route param drives which apartment loads**; the shell no longer holds an `activeId` in state.

## Consequences

- Back/forward, refresh, and sharing all work without extra code.
- Removes a piece of duplicated state (URL + `activeId` can't drift).
- The sidebar becomes navigation (links), not a state setter.
