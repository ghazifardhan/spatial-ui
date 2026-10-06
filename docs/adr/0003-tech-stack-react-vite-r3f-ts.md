# 0003. Tech stack: React + Vite + TypeScript + react-three-fiber

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

We needed a frontend stack for a 3D-spatial booking product, built module-by-module. Candidates:
React + Vite + R3F, vanilla TS + Vite + raw three.js, or Next.js + R3F.

## Decision

**React + Vite + TypeScript + react-three-fiber (R3F).**

- **Vite** for fast HMR.
- **TypeScript** for the interface discipline the codebase design demands.
- **react-three-fiber** for declarative three.js, which suits building the scene as composable
  modules.

## Consequences

- Declarative scene composition maps cleanly onto "modules one by one."
- R3F ties the render layer to React's lifecycle; heavy per-frame work must avoid React re-renders
  (use refs / imperative escape hatches in hot paths).
- **Next.js is deferred**, not rejected. It becomes worth it only if SSR/SEO for listings matters,
  which v1 does not require.
- Raw three.js remains available under R3F via `useFrame`/refs where declarative form fights us.
