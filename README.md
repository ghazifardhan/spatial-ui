# spatial-ui

Apartment booking with a **3D spatial walkthrough** — the core differentiator. Browse units, explore
each in 3D, select rooms, and request a stay.

This is a **real booking product** (not a demo): v1 covers
`browse → 3D explore → select unit/dates → request booking`. Payments move no money (a booking is a
*request*, confirmed out of band).

## Stack

- **React 19 + TypeScript** on **Vite**
- **three.js** via **@react-three/fiber** + **@react-three/drei**
- **react-router-dom** for shareable unit URLs
- **Vitest** + Testing Library (**113 tests**)

## Getting started

```bash
npm install
npm run dev        # dev server (http://localhost:5173)
npm test           # run the test suite once
npm run test:watch # tests in watch mode
npm run typecheck  # tsc project check
npm run lint       # oxlint
npm run build      # production build
```

## How it's put together

The app is built from **seven deep modules**, each with a small interface over a large
implementation (`domain` first — everything depends on it; `shell` last — it only wires):

| # | Module | Responsibility |
|---|--------|----------------|
| 1 | `src/domain` | Pure types + the `availability` rule. Depends on nothing. |
| 2 | `src/repository` | Data-access **seam**: `ApartmentRepository` / `BookingRepository` + in-memory adapters + fixtures. |
| 3 | `src/scene-gen` | The deep 3D module: `ApartmentSchema` → `THREE.Group` (walls with openings, furniture, per-room tagging). |
| 4 | `src/viewer` | R3F canvas, orbit navigation, default lighting rig, auto-framing. Owns camera state. |
| 5 | `src/interactions` | In-canvas picking: hover/select a room (raycast → `roomId`). |
| 6 | `src/booking-flow` | Date picking, availability validation, booking submission. Independent of 3D. |
| 7 | `src/shell` | Composition root: repositories context, routing, layout, wiring. |

**Dependency direction is one-way:** later modules depend on earlier ones, never the reverse.
`three.js` is isolated behind `scene-gen`/`viewer`/`interactions` and **lazy-loaded** so the initial
bundle stays small (~87 KB gzip; the 3D subtree loads only when a unit page mounts).

### Data

v1 is **frontend-only** — data comes from hand-authored fixtures behind a repository seam. Swapping to
a real backend is a one-line change in `RepositoriesProvider` because callers depend only on the
repository *interfaces*.

## Documentation

Every significant decision is recorded as an **ADR** — see [`docs/adr/`](docs/adr/README.md). Precise
definitions of the project's terms live in [`docs/glossary.md`](docs/glossary.md).

## Scope (v1)

**In:** browse, 3D explore, room selection, date-based booking requests.

**Out (deferred, not designed away):** real payments, admin/listing dashboard, multi-landlord
support, reviews, i18n/multi-currency, mobile-native apps, first-person walk mode, imported glTF
models, responsive layout.
