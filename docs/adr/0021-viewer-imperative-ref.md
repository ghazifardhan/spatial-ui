# 0021. Viewer exposes an imperative interface via ref

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

ADR 0012 says the viewer owns navigation state and exposes a small imperative interface
(`focusOn(unitId)` etc.). In React, that could be a ref, a context, or both.

## Decision

The viewer exposes its imperative interface via **`ref` + `useImperativeHandle`** on the
`<Viewer>` component.

## Consequences

- Explicit, no hidden global; matches "small imperative interface" (ADR 0012).
- A context/`useViewer()` hook may be added later **only** if a module deep in the tree needs the
  interface and prop-drilling a ref becomes painful.
- Callers (interactions, booking) hold a ref and call methods — no camera state leaks into React
  state (avoids re-render churn, ADR 0003 / 0012).
