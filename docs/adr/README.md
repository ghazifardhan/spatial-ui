# Architecture Decision Records

This directory records the significant, settled architectural decisions for **spatial-ui** —
an apartment booking product whose core differentiator is a 3D spatial walkthrough.

## Format

Each ADR is a numbered markdown file: `NNNN-<slug>.md`. We use a lightweight template:

```
# NNNN. <Title>

- **Status:** Proposed | Accepted | Superseded by NNNN
- **Date:** YYYY-MM-DD

## Context
What is the situation and what forces are at play?

## Decision
What did we decide?

## Consequences
What becomes easier, harder, or constrained as a result?
```

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-product-identity-and-scope.md) | Product identity and v1 scope | Accepted |
| [0002](0002-spatial-data-is-parametric.md) | Spatial data is parametric (procedural) | Accepted |
| [0003](0003-tech-stack-react-vite-r3f-ts.md) | Tech stack: React + Vite + TypeScript + react-three-fiber | Accepted |
| [0004](0004-frontend-first-with-repository-seam.md) | Frontend-first with a repository seam | Accepted |
| [0005](0005-single-package-with-adrs-and-vitest.md) | Single package, with ADRs + glossary + Vitest from day one | Accepted |
| [0006](0006-apartment-schema-shape.md) | ApartmentSchema shape (v1) | Accepted |
| [0007](0007-coordinate-system-and-units.md) | World coordinate system and units | Accepted |
| [0008](0008-availability-pure-module.md) | Availability is a pure module; repository only fetches | Accepted |
| [0009](0009-module-map-and-build-order.md) | v1 module map and build order | Accepted |
| [0010](0010-testing-strategy.md) | Testing strategy per module | Accepted |
| [0011](0011-navigation-model-orbit-first.md) | Navigation model: orbit-first | Accepted |
| [0012](0012-navigation-state-in-viewer.md) | Navigation state encapsulated in the viewer | Accepted |
| [0013](0013-selection-model.md) | Selection model: room-level, highlight-only in v1 | Accepted |
| [0014](0014-hand-authored-fixtures.md) | Hand-authored schema fixtures for development | Accepted |
| [0015](0015-repository-promise-based.md) | Repository interface is Promise-based from day one | Accepted |
| [0016](0016-repository-error-model.md) | Repository error model: reject for errors, null for not-found | Accepted |
| [0017](0017-scene-gen-output-three-group.md) | Scene generator output is a THREE.Group | Accepted |
| [0018](0018-walls-with-openings.md) | Walls are segment boxes with openings cut out | Accepted |
| [0019](0019-scene-gen-room-tagging.md) | Scene-gen tags meshes with roomId, grouped per room | Accepted |
| [0020](0020-furniture-placeholder-boxes.md) | Furniture rendered as placeholder boxes from a catalogue | Accepted |
| [0021](0021-viewer-imperative-ref.md) | Viewer exposes an imperative interface via ref | Accepted |
| [0022](0022-orbit-controls-via-drei.md) | Orbit controls via drei's OrbitControls | Accepted |
| [0023](0023-viewer-receives-group.md) | Viewer receives a built THREE.Group, not a schema | Accepted |
| [0024](0024-viewer-default-rig-and-autoframe.md) | Viewer ships a default lighting rig and auto-frames the camera | Accepted |
| [0025](0025-selection-state-in-shell.md) | Selected-room state lives in React state, in the shell | Accepted |
| [0026](0026-interactions-controlled.md) | Interactions module is controlled; reports selection via callback | Accepted |
| [0027](0027-room-highlight-material-swap.md) | Room highlight by swapping mesh material | Accepted |
| [0028](0028-hover-and-select.md) | Both hover and select in v1 | Accepted |
| [0029](0029-selection-pure-function.md) | Selection decision extracted as a pure function, unit-tested | Accepted |
| [0030](0030-date-input-native-fields.md) | Date input is two native date fields | Accepted |
| [0031](0031-use-availability-hook.md) | Availability composed in a useAvailability hook | Accepted |
| [0032](0032-booking-submission.md) | Booking submission creates a request and shows a confirmation | Accepted |
| [0033](0033-validate-on-submit.md) | Validate on submit, never disable buttons | Accepted |
| [0034](0034-booking-flow-independent.md) | Booking flow is independent of the 3D scene | Accepted |
| [0035](0035-routing.md) | Lightweight routing with shareable unit URLs | Accepted |
| [0036](0036-url-source-of-truth.md) | The URL is the source of truth for the active apartment | Accepted |
| [0037](0037-desktop-first-layout.md) | Desktop-first layout for v1 | Accepted |
| [0038](0038-repositories-context.md) | Repositories provided via React context | Accepted |
| [0039](0039-v1-close-out.md) | v1 close-out: wire cleanly, code-split the viewer, write a README | Accepted |
| [0040](0040-visual-quality-bar.md) | Visual quality bar: modern-minimalist listing look | Accepted |
| [0041](0041-material-palette.md) | Solid PBR materials from a shared palette | Accepted |
| [0042](0042-realistic-fixtures-and-wall-dedupe.md) | Realistic fixtures with deduplicated shared boundaries | Accepted |
| [0043](0043-soft-lighting-rig.md) | Soft lighting rig with shadows | Accepted |
| [0044](0044-doors-and-windows.md) | Openings render as real doors and framed windows | Accepted |
| [0045](0045-furniture-catalogue-dressing.md) | A richer furniture catalogue with dressed rooms | Accepted |
| [0046](0046-atmosphere-environment-tone-mapping.md) | Atmosphere: environment lighting, tone mapping, contact shadows | Accepted |
| [0047](0047-ceiling-visibility-toggle.md) | Ceiling visibility is a toggle; scene-gen stays deterministic | Accepted |
| [0048](0048-ceiling-toggle-ux.md) | Ceiling toggle: viewer-overlay control, off by default, local state | Accepted |
| [0049](0049-css-modules-and-tokens.md) | UI styling: CSS Modules with design tokens | Accepted |
| [0050](0050-dark-elegant-theme.md) | Dark-elegant shell theme | Accepted |
| [0051](0051-sidebar-ux-additions.md) | Sidebar UX additions: room list, price summary, breadcrumb, skeleton | Accepted |
| [0052](0052-in-viewer-navigation-ui.md) | In-viewer navigation UI: imperative zoom/pan/orbit controls + how-to legend | Accepted |
| [0053](0053-light-dark-theme-toggle.md) | Light/dark theme toggle: token overrides + persisted, OS-aware default | Accepted |
| [0054](0054-ui-iconography-lucide.md) | UI iconography: lucide-react instead of emoji glyphs | Accepted |
