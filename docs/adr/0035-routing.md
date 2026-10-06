# 0035. Lightweight routing with shareable unit URLs

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The app is currently a single screen. For a real booking product (ADR 0001), shareable unit URLs are
table stakes.

## Decision

Add **routing** with at least `/apartments/:id`, using `react-router-dom` (low-surprise given we
already use React).

## Consequences

- Units become linkable and shareable.
- Back/forward and refresh work for free.
- The route param is the natural home for "which unit am I viewing" (see ADR 0036).
- A custom mini-router was considered to avoid the dependency; `react-router-dom` wins on being
  unsurprising and well-supported.
