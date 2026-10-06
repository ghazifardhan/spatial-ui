# Glossary

One precise definition per term. Terms are added the moment they are settled.

We use the **codebase-design** vocabulary deliberately: **module**, **interface**, **implementation**,
**seam**, **adapter**, **depth**, **leverage**, **locality**. Do not substitute "component",
"service", "API", or "boundary" for these.

---

| Term | Definition | Example / counter-example |
|------|------------|---------------------------|
| **Module** | Anything with an interface and an implementation; deliberately scale-agnostic (function, class, package, or tier-spanning slice). | The scene generator is a module. _Avoid_: "unit", "component", "service". |
| **Interface** | Everything a caller must know to use a module correctly: type signature, invariants, ordering constraints, error modes, required config, performance characteristics. | The repository interface includes "calls may reject" — not just its method signatures. _Avoid_: "API", "signature" (too narrow). |
| **Seam** | The *location* at which a module's interface lives — a place where behaviour can be altered without editing there. | The `ApartmentRepository` seam lets us swap mock ↔ backend. _Avoid_: "boundary" (overloaded with DDD). |
| **Adapter** | A concrete thing that satisfies an interface at a seam. Describes *role*, not substance. | The in-memory mock is an adapter; a future Postgres repo is another. |
| **Depth** | Leverage at the interface: behaviour a caller/test can exercise per unit of interface learned. Deep = lots of behaviour, small interface. | A generator that turns a small `ApartmentSchema` into a full navigable scene is deep. |
| **ApartmentSchema** | The parametric description of a unit: room list, dimensions, and furniture placements. The input the scene generator consumes. | One schema can generate many visually distinct units. |
| **ApartmentRepository** | The external seam through which the app discovers, loads, and (later) persists apartment data. Adapters satisfy it; callers depend only on it. | Mock adapter today; HTTP adapter later — callers unchanged. |
| **Scene generator** | The module that converts an `ApartmentSchema` into a three.js scene graph. | Deep: small input, large output. |
| **Booking** | A *request → confirmation* record binding a unit + date range + guest identity. It has status (`requested` / `confirmed`), even though v1 moves no money. | A booking is not a payment; payment is out of scope. |
| **World frame** | three.js canonical: **Y-up, right-handed, meters**. Each unit's origin is at its entrance. | All schema dimensions are in meters. |
| **Availability** | A **pure module** owning the date rules: overlap detection and validation. The repository does not decide availability; it only fetches. | `availability.isAvailable(range)` composes fetched bookings + blackouts. |
| **Viewer** | The module that mounts a generated scene on an R3F canvas and owns camera/navigation state. Exposes a small imperative interface (e.g. `focusOn(unitId)`). | Deep module; render state never leaks to callers. |
| **Navigation controls** | The in-viewer UI for the walkthrough: a how-to legend plus clickable zoom/pan/orbit/reset buttons that drive the viewer's imperative handle. Holds no camera state. | `NavigationControls` (ADR 0052). |
| **Interactions** | The module owning in-canvas picking: raycasting, hover, and **room-level selection** (highlight + info panel). | Unit picking happens outside the canvas (shell/booking). |
| **Palette** | The shared set of PBR materials (`materials()`) scene-gen assigns to surfaces. The place to tune the look. | Dressing + architecture share one palette (ADR 0041). |
| **Opening** | A door or window cut into a wall. `sillHeight = 0` → door; `> 0` → window. | Rendered as real frames + leaf/glazing (ADR 0044). |
| **Wall segment** | A deduplicated wall run: `(axis, fixed coordinate, span, vertical extent)`. Shared room boundaries collapse to one. | Fixes interior double-walls (ADR 0042). |
| **Dressing** | Decorative furniture types (rug, plant, lamp, wall-art, dining-set) that make a room read as lived-in. | Part of the furniture catalogue (ADR 0045). |
| **Ceiling group** | The single root group (`ceiling`) holding every room's ceiling, so visibility toggles in one lookup. | `setCeilingVisible(scene, show)` (ADR 0047). |
| **Design tokens** | CSS custom properties (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--transition-*`) that define the shell's look; components reference variables, never literals. | `src/shell/styles/tokens.css` (ADR 0049). |
